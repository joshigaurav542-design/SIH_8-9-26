from fastapi.testclient import TestClient
from app.main import app
from app.services.pricing_engine import calculate_heritage_price
from app.services.story_engine import generate_craft_story

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["sih_problem_id"] == "SIH26090"
    assert data["team"] == "Bro Code"

def test_impact_stats():
    response = client.get("/api/v1/impact-stats")
    assert response.status_code == 200
    data = response.json()
    assert "30 Lakh+" in data["pm_vishwakarma_registrations"]

def test_heritage_pricing_engine():
    calc = calculate_heritage_price(
        raw_material_cost=150.0,
        labor_hours=8.0,
        skill_level="Master Artisan",
        artisan_margin_percent=20.0
    )
    assert calc["fair_market_price"] > 1000.0
    assert calc["artisan_earnings_gain_percent"] > 0

def test_story_generation():
    cert = generate_craft_story(
        product_title="Varanasi Silk Shawl",
        craft_style="Handloom & Banarasi Silk",
        artisan_name="Kashi Devi",
        region="Varanasi",
        materials_used="Pure Mulberry Silk"
    )
    assert "CERT-IND-" in cert["certificate_id"]
    assert len(cert["verification_hash"]) == 64

def test_voice_prompt_endpoint():
    payload = {
        "language": "hi-IN",
        "sample_text": "मैंने टेराकोटा का बड़ा फूलदान बनाया है। 8 घंटे लगे और 150 रुपया खर्च हुआ।"
    }
    response = client.post("/api/v1/voice/process", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["detected_intent"] == "PRODUCT_CATALOG_VOICE_CREATION"
    assert data["extracted_metadata"]["labor_hours"] == 8.0
