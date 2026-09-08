from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Artisan(Base):
    __tablename__ = "artisans"

    id = Column(Integer, primary_key=True, index=True)
    artisan_id = Column(String(50), unique=True, index=True)  # e.g., PM-VISH-9281
    name = Column(String(100), nullable=False)
    craft_type = Column(String(100), nullable=False)  # Pottery, Handloom, Wood Carving, Brassware, etc.
    region = Column(String(100), nullable=False)      # e.g., Varanasi, Bankura, Madurai
    dialect = Column(String(20), default="hi-IN")     # Preferred vernacular language
    skill_level = Column(String(50), default="Master Artisan")  # Apprentice, Skilled, Master Artisan
    hourly_rate = Column(Float, default=120.0)        # Fair living wage base (INR/hr)
    pm_vishwakarma_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="artisan")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    artisan_id = Column(Integer, ForeignKey("artisans.id"), nullable=False)
    
    # AI Vision Extracted Attributes
    category = Column(String(100))
    craft_style = Column(String(100))
    material = Column(String(100))
    dimensions = Column(String(100))  # e.g. "25cm x 15cm x 15cm"
    weight_grams = Column(Float, default=500.0)
    
    # Quality Rating Metrics
    symmetry_score = Column(Float, default=95.0)  # 0 to 100
    density_score = Column(Float, default=92.0)   # Weave or carving density
    trust_badge = Column(String(50), default="Heritage Certified")

    # Heritage Pricing Breakdown
    raw_material_cost = Column(Float, default=150.0)
    labor_hours = Column(Float, default=8.0)
    fair_labor_cost = Column(Float, default=960.0)
    artisan_margin_percent = Column(Float, default=20.0)
    suggested_price = Column(Float, default=1330.0)

    # Status
    image_url = Column(String(500), nullable=True)
    ondc_published = Column(Boolean, default=False)
    whatsapp_sync = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    artisan = relationship("Artisan", back_populates="products")
    certificate = relationship("AuthenticityCertificate", back_populates="product", uselist=False)

class AuthenticityCertificate(Base):
    __tablename__ = "authenticity_certificates"

    id = Column(Integer, primary_key=True, index=True)
    certificate_id = Column(String(100), unique=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), unique=True, nullable=False)
    origin_story = Column(Text, nullable=False)
    cultural_lineage = Column(String(200), nullable=False)
    geo_tag = Column(String(100), nullable=False)
    hash_fingerprint = Column(String(64), nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="certificate")

class OfflineSyncLog(Base):
    __tablename__ = "offline_sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    client_device_id = Column(String(100), index=True)
    action = Column(String(50))  # CREATE_CATALOG, UPDATE_PRICING, ONDC_PUBLISH
    payload = Column(JSON)
    synced_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="COMPLETED")
