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

# --- Product Cataloging & ONDC ---
class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    artisan_name: str
    region: str
    category: str
    craft_style: str
    material: str
    dimensions: str
    weight_grams: float = 500.0
    raw_material_cost: float
    labor_hours: float
    skill_level: str = "Master Artisan"
    price: float
    image_url: Optional[str] = None

class ProductOut(BaseModel):
    id: int
    sku: str
    title: str
    category: str
    craft_style: str
    material: str
    dimensions: str
    suggested_price: float
    symmetry_score: float
    trust_badge: str
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
