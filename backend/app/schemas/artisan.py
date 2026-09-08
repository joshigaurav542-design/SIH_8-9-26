from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- AI Vision Schemas ---
class VisionScanRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    category_hint: Optional[str] = None

class VisionScanResponse(BaseModel):
    detected_category: str
    craft_style: str
    material: str
    estimated_dimensions: str
    estimated_weight_grams: float
    symmetry_score: float
    texture_density_score: float
    trust_grade: str
    detected_features: List[str]

# --- Vernacular Voice Schemas ---
class VoicePromptRequest(BaseModel):
    audio_base64: Optional[str] = None
    language: str = "hi-IN"  # hi-IN, bn-IN, ta-IN, te-IN, mr-IN, gu-IN, en-IN
    sample_text: Optional[str] = None

class VoicePromptResponse(BaseModel):
    language: str
    transcription: str
    extracted_metadata: Dict[str, Any]
    detected_intent: str

# --- Heritage Pricing Schemas ---
class PricingCalculationRequest(BaseModel):
    raw_material_cost: float = Field(..., ge=0, description="Cost of raw materials in INR")
    labor_hours: float = Field(..., ge=0.5, description="Total hours spent on the craft")
    skill_level: str = Field(default="Master Artisan", description="Apprentice, Skilled, Master Artisan")
    artisan_margin_percent: float = Field(default=20.0, ge=5.0, le=50.0, description="Fair margin percentage")
    complexity_rating: float = Field(default=1.2, ge=1.0, le=2.5, description="1.0 to 2.5 multiplier for fine craftsmanship")

class PricingCalculationResponse(BaseModel):
    base_hourly_wage: float
    total_labor_cost: float
    raw_material_cost: float
    complexity_adjustment: float
    artisan_profit: float
    fair_market_price: float
    middleman_price_comparison: float  # What middlemen usually underpay / sell for
    artisan_earnings_gain_percent: float
    summary_explanation: str

# --- Generative Story & Certificate ---
class StoryGenerationRequest(BaseModel):
    product_title: str
    craft_style: str
    artisan_name: str
    region: str
    materials_used: str

class AuthenticityCertificateSchema(BaseModel):
    certificate_id: str
    product_title: str
    artisan_name: str
    cultural_origin_story: str
    historical_lineage: str
    geo_tag: str
    verification_hash: str
    qr_payload: str
    trust_badge: str
    issued_at: Optional[str] = None
    powered_by: Optional[str] = "Google Gemini 3.7 Flash AI"

# --- Product Cataloging & ONDC ---
class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    artisan_name: Optional[str] = "Master Artisan"
    region: Optional[str] = "India"
    category: Optional[str] = "Pottery & Terracotta"
    craft_style: Optional[str] = None
    craftStyle: Optional[str] = None
    material: Optional[str] = "Authentic Regional Materials"
    dimensions: Optional[str] = "25cm x 15cm x 10cm"
    weight_grams: Optional[float] = 500.0
    weight: Optional[Any] = None
    raw_material_cost: Optional[float] = None
    rawCost: Optional[float] = None
    labor_hours: Optional[float] = None
    laborHours: Optional[float] = None
    skill_level: Optional[str] = "Master Artisan"
    price: Optional[float] = 1500.0
    image_url: Optional[str] = None
    image: Optional[str] = None
    gi_certified: Optional[bool] = True
    giCertified: Optional[bool] = None
    ondc_published: Optional[bool] = True
    ondcPublished: Optional[bool] = None

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    craft_style: Optional[str] = None
    craftStyle: Optional[str] = None
    material: Optional[str] = None
    dimensions: Optional[str] = None
    weight_grams: Optional[float] = None
    weight: Optional[Any] = None
    raw_material_cost: Optional[float] = None
    rawCost: Optional[float] = None
    labor_hours: Optional[float] = None
    laborHours: Optional[float] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    image: Optional[str] = None
    gi_certified: Optional[bool] = None
    giCertified: Optional[bool] = None
    ondc_published: Optional[bool] = None
    ondcPublished: Optional[bool] = None

class ProductOut(BaseModel):
    id: int
    sku: str
    title: str
    category: str
    craft_style: str
    material: str
    dimensions: str
    suggested_price: float
    raw_material_cost: Optional[float] = 160.0
    labor_hours: Optional[float] = 8.0
    symmetry_score: float
    trust_badge: str
    image_url: Optional[str] = None
    ondc_published: bool
    whatsapp_sync: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ONDCPublishRequest(BaseModel):
    product_id: int
    channel: str = "ONDC_AND_WHATSAPP"

class ONDCPublishResponse(BaseModel):
    status: str
    bpp_id: str
    bpp_uri: str
    item_id: str
    ondc_network_status: str
    whatsapp_catalog_id: str
    message: str

class OfflineSyncItem(BaseModel):
    client_id: str
    timestamp: datetime
    action: str
    data: Dict[str, Any]

class OfflineSyncBatchRequest(BaseModel):
    device_id: str
    pending_items: List[OfflineSyncItem]

class OfflineSyncBatchResponse(BaseModel):
    processed_count: int
    status: str
    synced_at: datetime
