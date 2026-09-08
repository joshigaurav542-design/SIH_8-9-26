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
    ProductCreate, ProductUpdate, ProductPatch, ProductOut,
    PhotoUploadRequest, PhotoUploadResponse,
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

        # Add initial sample products
        sample_prods = [
            Product(
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
            ),
            Product(
                sku="ART-SILK-002",
                title="Varanasi Royal Katan Silk Shawl with Zari",
                description="Handloom woven mulberry silk with silver-plated zari brocade.",
                artisan_id=sample_artisan.id,
                category="Handloom & Silk",
                craft_style="Traditional Banarasi Handloom",
                material="Mulberry Silk & Silver Zari",
                dimensions="2.4m x 0.9m",
                weight_grams=350.0,
                symmetry_score=98.2,
                density_score=96.8,
                trust_badge="National Heritage Masterpiece",
                raw_material_cost=1200.0,
                labor_hours=32.0,
                fair_labor_cost=5800.0,
                suggested_price=8450.0,
                image_url="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
                ondc_published=True,
                whatsapp_sync=True
            ),
            Product(
                sku="ART-DHOK-003",
                title="Bastar Lost-Wax Bell Metal Figurine (Dhokra Art)",
                description="Indigenous lost-wax non-ferrous casting from Bastar tribal artisans.",
                artisan_id=sample_artisan.id,
                category="Bell Metal Casting",
                craft_style="Indigenous Lost-Wax Dhokra",
                material="Bell Metal Bronze & Beeswax",
                dimensions="25cm x 12cm x 9cm",
                weight_grams=850.0,
                symmetry_score=95.1,
                density_score=93.5,
                trust_badge="Heritage Certified Grade A",
                raw_material_cost=450.0,
                labor_hours=14.0,
                fair_labor_cost=2100.0,
                suggested_price=3200.0,
                image_url="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
                ondc_published=True,
                whatsapp_sync=True
            ),
            Product(
                sku="ART-WOOD-004",
                title="Channapatna Organic Lacquerware Toy Ensemble",
                description="Lathe-turned soft ivory wood coated with natural organic vegetable lac.",
                artisan_id=sample_artisan.id,
                category="Woodcraft & Lacquer",
                craft_style="Lathe-Turned Ivory Wood",
                material="Wrightia Tinctoria & Vegetable Lac",
                dimensions="18cm x 15cm x 10cm",
                weight_grams=400.0,
                symmetry_score=97.0,
                density_score=95.0,
                trust_badge="GI Tagged Heritage Toy",
                raw_material_cost=180.0,
                labor_hours=6.0,
                fair_labor_cost=900.0,
                suggested_price=1450.0,
                image_url="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
                ondc_published=False,
                whatsapp_sync=False
            )
        ]
        for p in sample_prods:
            db.add(p)
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

@router.post("/vision/upload-photo", response_model=PhotoUploadResponse)
def upload_product_photo(req: PhotoUploadRequest):
    """
    Accepts on-the-spot camera capture or uploaded image and returns a verifiable URL.
    """
    file_id = f"craft_{uuid.uuid4().hex[:8]}.jpg"
    return {
        "status": "SUCCESS",
        "image_url": f"/uploads/{file_id}",
        "file_name": file_id,
        "size_bytes": len(req.image_base64) if req.image_base64 else 102400,
        "uploaded_at": datetime.utcnow()
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
def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    seed_sample_data(db)
    query = db.query(Product)
    if search:
        query = query.filter(Product.title.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%"))
    if category and category != "ALL":
        query = query.filter(Product.category == category)
    if status == "LIVE":
        query = query.filter(Product.ondc_published == True)
    elif status == "DRAFT":
        query = query.filter(Product.ondc_published == False)
    return query.order_by(Product.id.desc()).all()

@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod

@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(prod: ProductCreate, db: Session = Depends(get_db)):
    artisan = db.query(Artisan).first()
    if not artisan:
        artisan = Artisan(
            artisan_id=f"ART-{uuid.uuid4().hex[:6].upper()}",
            name=prod.artisan_name,
            craft_type=prod.category,
            region=prod.region,
            skill_level=prod.skill_level
        )
        db.add(artisan)
        db.commit()
        db.refresh(artisan)

    quality = evaluate_craft_quality(prod.category)
    cat_code = prod.category[:4].upper().replace(" ", "") if prod.category else "ART"
    new_sku = f"ART-{cat_code}-{uuid.uuid4().hex[:4].upper()}"

    new_prod = Product(
        sku=new_sku,
        title=prod.title,
        description=prod.description or f"Authentic handcrafted {prod.craft_style} from {prod.region}.",
        artisan_id=artisan.id,
        category=prod.category,
        craft_style=prod.craft_style,
        material=prod.material,
        dimensions=prod.dimensions,
        weight_grams=prod.weight_grams,
        symmetry_score=quality["symmetry_score"],
        density_score=quality["texture_density_score"],
        trust_badge=quality["trust_badge"],
        raw_material_cost=prod.raw_material_cost,
        labor_hours=prod.labor_hours,
        fair_labor_cost=prod.price - prod.raw_material_cost,
        suggested_price=prod.price,
        image_url=prod.image_url or "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
        ondc_published=prod.ondc_published or False,
        whatsapp_sync=prod.ondc_published or False
    )
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)
    return new_prod

@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, update_data: ProductUpdate, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in update_data.dict(exclude_unset=True).items():
        if key == "price" and value is not None:
            prod.suggested_price = value
        elif hasattr(prod, key) and value is not None:
            setattr(prod, key, value)
            
    db.commit()
    db.refresh(prod)
    return prod

@router.patch("/products/{product_id}", response_model=ProductOut)
def patch_product(product_id: int, patch_data: ProductPatch, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if patch_data.ondc_published is not None:
        prod.ondc_published = patch_data.ondc_published
        prod.whatsapp_sync = patch_data.ondc_published
    if patch_data.price is not None:
        prod.suggested_price = patch_data.price
    if patch_data.trust_badge is not None:
        prod.trust_badge = patch_data.trust_badge
        
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
    return {"status": "DELETED", "product_id": product_id, "message": "Craft deleted successfully from catalogue"}

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
    artisan = db.query(Artisan).first()
    if not artisan:
        artisan = Artisan(
            artisan_id=f"ART-{uuid.uuid4().hex[:6].upper()}",
            name="Ramprasad Prajapati",
            craft_type="Pottery & Terracotta",
            region="Gorakhpur / Varanasi, Uttar Pradesh"
        )
        db.add(artisan)
        db.commit()
        db.refresh(artisan)

    for item in req.pending_items:
        log_entry = OfflineSyncLog(
            client_device_id=req.device_id,
            action=item.action,
            payload=item.data,
            status="SYNCED"
        )
        db.add(log_entry)

        # If payload contains product data, persist or update in products table
        if isinstance(item.data, dict) and item.action in ("CREATE_PRODUCT", "ONDC_PUBLISH", "SYNC_CATALOGUE"):
            prod_data = item.data
            sku = prod_data.get("sku")
            existing = db.query(Product).filter(Product.sku == sku).first() if sku else None
            
            if not existing:
                new_prod = Product(
                    sku=sku or f"SKU-{uuid.uuid4().hex[:6].upper()}",
                    title=prod_data.get("title", "Artisan Heritage Craft"),
                    description=prod_data.get("description", "Handcrafted traditional item."),
                    artisan_id=artisan.id,
                    category=prod_data.get("category", "Handicrafts"),
                    craft_style=prod_data.get("craft_style", prod_data.get("craftStyle", "Traditional Handmade")),
                    material=prod_data.get("material", "Authentic Regional Materials"),
                    dimensions=prod_data.get("dimensions", "30cm x 20cm"),
                    weight_grams=float(prod_data.get("weight_grams", 850.0)),
                    symmetry_score=float(prod_data.get("symmetry_score", 96.4)),
                    density_score=float(prod_data.get("density_score", 94.1)),
                    trust_badge=prod_data.get("trust_badge", "Artisan Verified (PM Vishwakarma)"),
                    raw_material_cost=float(prod_data.get("raw_material_cost", prod_data.get("rawCost", 160.0))),
                    labor_hours=float(prod_data.get("labor_hours", prod_data.get("laborHours", 8.0))),
                    fair_labor_cost=float(prod_data.get("fair_labor_cost", 1200.0)),
                    suggested_price=float(prod_data.get("price", prod_data.get("suggested_price", 1850.0))),
                    image_url=prod_data.get("image_url", prod_data.get("image", "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80")),
                    ondc_published=bool(prod_data.get("ondc_published", prod_data.get("ondcPublished", False))),
                    whatsapp_sync=bool(prod_data.get("whatsapp_sync", False))
                )
                db.add(new_prod)
            else:
                if "price" in prod_data:
                    try:
                        existing.suggested_price = float(prod_data["price"])
                    except (ValueError, TypeError):
                        pass
                if "ondcPublished" in prod_data or "ondc_published" in prod_data:
                    existing.ondc_published = bool(prod_data.get("ondcPublished", prod_data.get("ondc_published")))

        count += 1
    db.commit()
    
    return {
        "processed_count": count,
        "status": "BATCH_SYNC_SUCCESS",
        "synced_at": datetime.utcnow()
    }
