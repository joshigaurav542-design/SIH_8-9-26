"""
Database Initialization and Seeding Script for Smart Artisan Companion (SIH 2026)
Creates all SQLAlchemy tables and seeds initial Master Artisan & Product data.
Supports both SQLite (default zero-config) and PostgreSQL.
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, SessionLocal
from app.core.config import settings
from app.models.artisan import Artisan, Product, AuthenticityCertificate, OfflineSyncLog

def init_database():
    print("=" * 65)
    print(f"[*] Initializing Database: {settings.PROJECT_NAME}")
    print(f"[*] Database URL: {settings.DATABASE_URL}")
    print("=" * 65)

    try:
        # Create all tables defined in SQLAlchemy models
        print("\n[*] Step 1: Creating database schema and tables...")
        Base.metadata.create_all(bind=engine)
        print("[OK] Schema created: artisans, products, authenticity_certificates, offline_sync_logs")

        # Seed sample master artisan & products
        db = SessionLocal()
        try:
            artisan_count = db.query(Artisan).count()
            if artisan_count == 0:
                print("\n[+] Step 2: Seeding initial PM Vishwakarma Master Artisan...")
                sample_artisan = Artisan(
                    artisan_id="PM-VISH-2026-098",
                    name="Ramprasad Prajapati",
                    craft_type="Pottery & Terracotta",
                    region="Gorakhpur / Varanasi, Uttar Pradesh",
                    dialect="hi-IN",
                    skill_level="Master Artisan",
                    hourly_rate=145.0,
                    pm_vishwakarma_id="PMV-UP-249018"
                )
                db.add(sample_artisan)
                db.commit()
                db.refresh(sample_artisan)
                print(f"  + Added Master Artisan: {sample_artisan.name} ({sample_artisan.artisan_id})")

                print("[+] Step 3: Seeding initial craft catalogue listings...")
                sample_products = [
                    Product(
                        sku="ART-TERRA-001",
                        title="Gorakhpur GI-Tagged Terracotta Floral Urn",
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
                        image_url="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
                        ondc_published=True,
                        whatsapp_sync=True
                    ),
                    Product(
                        sku="ART-SILK-002",
                        title="Varanasi Royal Katan Silk Shawl with Zari",
                        description="Authentic Banarasi handloom woven with silver zari motifs.",
                        artisan_id=sample_artisan.id,
                        category="Handloom & Silk",
                        craft_style="Traditional Banarasi Handloom",
                        material="Mulberry Silk with Silver-Plated Zari Brocade",
                        dimensions="2.4m x 0.9m",
                        weight_grams=350.0,
                        symmetry_score=98.1,
                        density_score=96.5,
                        trust_badge="National Heritage Masterpiece",
                        raw_material_cost=1200.0,
                        labor_hours=32.0,
                        fair_labor_cost=5152.0,
                        suggested_price=8450.0,
                        image_url="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
                        ondc_published=True,
                        whatsapp_sync=True
                    ),
                    Product(
                        sku="ART-DHOK-003",
                        title="Bastar Lost-Wax Bell Metal Figurine (Dhokra Art)",
                        description="Indigenous lost-wax metal casting crafted by tribal artisans.",
                        artisan_id=sample_artisan.id,
                        category="Bell Metal Casting",
                        craft_style="Indigenous Lost-Wax Dhokra",
                        material="Bell Metal Bronze & Beeswax Core",
                        dimensions="25cm x 12cm x 9cm",
                        weight_grams=850.0,
                        symmetry_score=94.8,
                        density_score=93.2,
                        trust_badge="Heritage Certified Grade A",
                        raw_material_cost=450.0,
                        labor_hours=14.0,
                        fair_labor_cost=2030.0,
                        suggested_price=3200.0,
                        image_url="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
                        ondc_published=True,
                        whatsapp_sync=True
                    )
                ]
                db.add_all(sample_products)
                db.commit()
                print(f"  + Added {len(sample_products)} verified ONDC products")
            else:
                print(f"\n[*] Database already initialized with {artisan_count} artisan(s). Skipping seed.")

            # Summary
            total_artisans = db.query(Artisan).count()
            total_products = db.query(Product).count()
            print("\n" + "=" * 65)
            print(f"[OK] Database Setup Complete!")
            print(f"   * Total Artisans: {total_artisans}")
            print(f"   * Total Products: {total_products}")
            print("=" * 65)
        finally:
            db.close()

    except Exception as e:
        print(f"\n[ERROR] Error initializing database: {e}")
        print("\nTroubleshooting:")
        print("  1. Ensure dependencies are installed: pip install -r requirements.txt")
        print("  2. If using PostgreSQL, ensure PostgreSQL server is running and database exists.")
        print("  3. For PostgreSQL, install driver: pip install psycopg2-binary")
        sys.exit(1)

if __name__ == "__main__":
    init_database()
