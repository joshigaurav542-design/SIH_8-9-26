from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import uuid

from app.core.database import get_db, engine, Base
from app.core.config import settings
from app.models.artisan import Artisan, Product, AuthenticityCertificate, OfflineSyncLog
from app.schemas.artisan import (
    VisionScanRequest, VisionScanResponse,
    VoicePromptRequest, VoicePromptResponse,
    PricingCalculationRequest, PricingCalculationResponse,
    StoryGenerationRequest, AuthenticityCertificateSchema,
    ProductCreate, ProductUpdate, ProductOut,
    ONDCPublishRequest, ONDCPublishResponse,
    OfflineSyncBatchRequest, OfflineSyncBatchResponse
)
from app.services.pricing_engine import calculate_heritage_price
from app.services.story_engine import generate_craft_story
from app.services.quality_evaluator import evaluate_craft_quality
from app.services.voice_bhashini import process_vernacular_speech
from app.services.ondc_beckn import BecknProtocolHandler

# Create database tables automatically
Base.metadata.create_all(bind=engine)

router = APIRouter()
beckn_handler = BecknProtocolHandler(bpp_id=settings.ONDC_BPP_ID, bpp_uri=settings.ONDC_BPP_URI)

# Pre-populate sample master artisan if not exists
def seed_sample_data(db: Session):
    existing = db.query(Artisan).first()
    if not existing:
        sample_artisan = Artisan(
            artisan_id="PM-VISH-2026-098",
            name="Ramprasad Prajapati",
            craft_type="Pottery & Terracotta",
            region="Gorakhpur / Varanasi, Uttar Pradesh",
            dialect="hi-IN",
            skill_level="Master Artisan",
            hourly_rate=140.0,
            pm_vishwakarma_id="PMV-UP-249018"
        )
        db.add(sample_artisan)
        db.commit()
        db.refresh(sample_artisan)

        # Add initial sample product
        sample_prod = Product(
            sku="ART-TERRA-001",
            title="GI-Tagged Terracotta Floral Urn (हाथ से निर्मित टेराकोटा फूलदान)",
            description="Handcrafted terracotta urn fired with natural organic husks using traditional techniques.",
            artisan_id=sample_artisan.id,
            category="Pottery & Terracotta",
            craft_style="Pottery & Terracotta",
            material="River Alluvial Clay",
            dimensions="32cm x 20cm x 20cm",
            weight_grams=1200.0,
            symmetry_score=96.4,
            density_score=94.1,
            trust_badge="Masterpiece Grade A+ (GI Certified)",
            raw_material_cost=160.0,
            labor_hours=9.0,
            fair_labor_cost=1449.0,
            suggested_price=1930.0,
            image_url="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
            ondc_published=True,
            whatsapp_sync=True
        )
        db.add(sample_prod)
        db.commit()

# --- Health & National Impact Stats ---
@router.get("/health")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "sih_problem_id": settings.SIH_PROBLEM_ID,
        "team": settings.TEAM_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/impact-stats")
def get_national_impact_stats():
    """
    Returns verified scale metrics from official government dashboards (Ministry of MSME & Textiles).
    """
    return {
        "pm_vishwakarma_registrations": "30 Lakh+",
        "beneficiaries_trained": "24.29 Lakh",
        "loans_approved_inr": "₹5,235.8 Crore",
        "pahchan_mobilized_artisans": "32.90 Lakh",
        "aligned_schemes": ["PM Vishwakarma", "Digital India", "Make in India", "SDG 8: Decent Work & Economic Growth"],
        "direct_middlemen_elimination_rate": "100% on ONDC"
    }

# --- Step 1: Multilingual Voice Transcription ---
@router.post("/voice/process", response_model=VoicePromptResponse)
def process_voice_prompt(req: VoicePromptRequest):
    return process_vernacular_speech(
        audio_base64=req.audio_base64,
        language=req.language,
        sample_text=req.sample_text
    )

# --- Step 2: Edge AI Vision Scanning & Quality Rating ---
@router.post("/vision/scan", response_model=VisionScanResponse)
def scan_artisan_product(req: VisionScanRequest):
    quality = evaluate_craft_quality(req.category_hint or "Pottery & Terracotta")
    
    return {
        "detected_category": req.category_hint or "Pottery & Terracotta",
        "craft_style": "Traditional Hand-turned Clay Art",
        "material": "Riverbed Clay with Natural Ochre Glaze",
        "estimated_dimensions": "28cm (H) x 16cm (W)",
        "estimated_weight_grams": 950.0,
        "symmetry_score": quality["symmetry_score"],
        "texture_density_score": quality["texture_density_score"],
        "trust_grade": quality["trust_badge"],
        "detected_features": [
            "Consistent wall thickness",
            "Zero micro-fractures detected",
            "Flawless bilateral rotational symmetry",
            "Natural mineral dye sheen"
        ]
    }

# --- Step 3: Automated Heritage Pricing Engine ---
@router.post("/pricing/calculate", response_model=PricingCalculationResponse)
def calculate_pricing(req: PricingCalculationRequest):
    return calculate_heritage_price(
        raw_material_cost=req.raw_material_cost,
        labor_hours=req.labor_hours,
        skill_level=req.skill_level,
        artisan_margin_percent=req.artisan_margin_percent
    )

# --- Step 3b: Generative Craft Storytelling & Certificate ---
@router.post("/story/generate", response_model=AuthenticityCertificateSchema)
def generate_story_and_certificate(req: StoryGenerationRequest):
    cert = generate_craft_story(
        product_title=req.product_title,
        craft_style=req.craft_style,
        artisan_name=req.artisan_name,
        region=req.region,
        materials_used=req.materials_used
    )
    return cert

# --- Step 4: Product Cataloging & Persistence ---
@router.get("/products", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db)):
    seed_sample_data(db)
    return db.query(Product).order_by(Product.id.desc()).all()

@router.post("/products", response_model=ProductOut)
def create_product(prod: ProductCreate, db: Session = Depends(get_db)):
    artisan = db.query(Artisan).first()
    if not artisan:
        artisan = Artisan(
            artisan_id=f"ART-{uuid.uuid4().hex[:6].upper()}",
            name=prod.artisan_name or "Master Artisan",
            craft_type=prod.category or "Pottery & Terracotta",
            region=prod.region or "India",
            skill_level=prod.skill_level or "Master Artisan"
        )
        db.add(artisan)
        db.commit()
        db.refresh(artisan)

    category = prod.category or "Pottery & Terracotta"
    craft_style = prod.craft_style or prod.craftStyle or "Traditional Handmade"
    quality = evaluate_craft_quality(category)
    cat_prefix = (category.split()[0] if category else "CRAFT").upper()[:4]
    new_sku = f"ART-{cat_prefix}-{uuid.uuid4().hex[:4].upper()}"

    raw_cost = prod.raw_material_cost or prod.rawCost or 160.0
    hours = prod.labor_hours or prod.laborHours or 8.0
    price = prod.price if prod.price is not None else round((raw_cost + hours * 140) * 1.25)
    image = prod.image_url or prod.image or "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
    ondc_pub = prod.ondc_published if prod.ondc_published is not None else (prod.ondcPublished if prod.ondcPublished is not None else True)

    new_prod = Product(
        sku=new_sku,
        title=prod.title,
        description=prod.description or f"Authentic handcrafted {craft_style} from {prod.region or 'India'}.",
        artisan_id=artisan.id,
        category=category,
        craft_style=craft_style,
        material=prod.material or "Authentic Regional Materials",
        dimensions=prod.dimensions or "25cm x 15cm x 10cm",
        weight_grams=float(prod.weight_grams or 500.0),
        symmetry_score=quality["symmetry_score"],
        density_score=quality["texture_density_score"],
        trust_badge=quality["trust_badge"],
        raw_material_cost=raw_cost,
        labor_hours=hours,
        fair_labor_cost=max(0.0, price - raw_cost),
        suggested_price=price,
        image_url=image,
        ondc_published=ondc_pub,
        whatsapp_sync=ondc_pub
    )
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)
    return new_prod

@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, prod_update: ProductUpdate, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    if prod_update.title is not None:
        prod.title = prod_update.title
    if prod_update.category is not None:
        prod.category = prod_update.category
    if prod_update.craft_style or prod_update.craftStyle:
        prod.craft_style = prod_update.craft_style or prod_update.craftStyle
    if prod_update.material is not None:
        prod.material = prod_update.material
    if prod_update.dimensions is not None:
        prod.dimensions = prod_update.dimensions
    if prod_update.raw_material_cost or prod_update.rawCost:
        prod.raw_material_cost = prod_update.raw_material_cost or prod_update.rawCost
    if prod_update.labor_hours or prod_update.laborHours:
        prod.labor_hours = prod_update.labor_hours or prod_update.laborHours
    if prod_update.price is not None:
        prod.suggested_price = prod_update.price
    if prod_update.image_url or prod_update.image:
        prod.image_url = prod_update.image_url or prod_update.image
    if prod_update.ondc_published is not None:
        prod.ondc_published = prod_update.ondc_published
    elif prod_update.ondcPublished is not None:
        prod.ondc_published = prod_update.ondcPublished

    db.commit()
    db.refresh(prod)
    return prod

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(prod)
    db.commit()
    return {"success": True, "deleted_id": product_id}

@router.patch("/products/{product_id}/ondc")
def toggle_product_ondc(product_id: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    is_pub = payload.get("ondcPublished", payload.get("ondc_published", not prod.ondc_published))
    prod.ondc_published = is_pub
    prod.whatsapp_sync = is_pub
    db.commit()
    return {"success": True, "product_id": product_id, "ondc_published": is_pub}

# --- Step 4b: ONDC Protocol & Direct Distribution ---
@router.post("/ondc/publish", response_model=ONDCPublishResponse)
def publish_to_ondc(req: ONDCPublishRequest, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == req.product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    
    result = beckn_handler.publish_to_channels(product_id=prod.id, product_details={"sku": prod.sku})
    prod.ondc_published = True
    prod.whatsapp_sync = True
    db.commit()
    return result

@router.post("/ondc/search")
def ondc_beckn_search(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Simulates ONDC network gateway discovery (/search -> /on_search).
    """
    transaction_id = payload.get("context", {}).get("transaction_id", str(uuid.uuid4()))
    products = db.query(Product).filter(Product.ondc_published == True).all()
    
    catalog_items = []
    for p in products:
        catalog_items.append(beckn_handler.format_item_to_beckn_catalog(
            product={"id": p.id, "sku": p.sku, "title": p.title, "price": p.suggested_price, "trust_badge": p.trust_badge},
            artisan={"region": "Varanasi, India"}
        ))
        
    return beckn_handler.generate_beckn_on_search(transaction_id, catalog_items)

# --- Offline-First Sync Queue Processor ---
@router.post("/sync/batch", response_model=OfflineSyncBatchResponse)
def sync_offline_batch(req: OfflineSyncBatchRequest, db: Session = Depends(get_db)):
    count = 0
    for item in req.pending_items:
        log_entry = OfflineSyncLog(
            client_device_id=req.device_id,
            action=item.action,
            payload=item.data,
            status="SYNCED"
        )
        db.add(log_entry)
        count += 1
    db.commit()
    
    return {
        "processed_count": count,
        "status": "BATCH_SYNC_SUCCESS",
        "synced_at": datetime.utcnow()
    }
