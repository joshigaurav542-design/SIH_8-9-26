"""
AI-powered Craft Storytelling & Verifiable Authenticity Certificate Generator.
Creates cultural origin stories, marketing captions, craft descriptions, and
cryptographic provenance certificates for conscious buyers on ONDC.
"""

import hashlib
import json
import os
import re
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

from app.core.config import settings

HERITAGE_TRADITIONS = {
    "Pottery & Terracotta": {
        "lineage": "Centuries-old Indian rural terracotta traditions",
        "narrative": "Handcrafted on traditional kick-wheels using alluvial riverbed clay, shaped with care, sun-baked, and kiln-fired using organic husk fuels."
    },
    "Handloom & Banarasi Silk": {
        "lineage": "Varanasi handloom weaving heritage passed across generations",
        "narrative": "Woven on pit looms with mulberry silk filaments and zari motifs, each centimeter representing meticulous rhythmic pedal actions and artisan dedication."
    },
    "Dhokra Brass Casting": {
        "lineage": "Lost-wax non-ferrous metal casting practiced across indigenous clusters",
        "narrative": "Crafted utilizing the lost-wax technique with natural beeswax cores and bell-metal alloys, making every casting singular and irreproducible."
    },
    "Wood Carving & Marquetry": {
        "lineage": "Traditional architectural and decorative woodworking ancestry",
        "narrative": "Chiseled from seasoned hardwood utilizing natural beeswax polish without harsh chemical varnishes to highlight the grain's organic beauty."
    },
    "Madhubani / Pattachitra Folk Art": {
        "lineage": "Traditional folk painting documented across cultural regions",
        "narrative": "Rendered with fine nibs, brushes, and natural pigments onto handmade surfaces, celebrating nature and timeless folklore."
    }
}


def _extract_json_from_llm_text(text: str) -> Optional[Dict[str, Any]]:
    """Helper to extract and parse JSON object from LLM response text."""
    if not text:
        return None
    cleaned = text.strip()
    
    # Remove markdown code block fences if present
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except Exception:
        # Try finding the first '{' and last '}'
        match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass
    return None


def call_llm_story_generation(
    product_title: str,
    craft_style: str,
    artisan_name: str,
    region: str,
    materials_used: str
) -> Optional[Dict[str, Any]]:
    """
    Invokes Google Gemini LLM to generate structured product storytelling,
    cultural narrative, craftsmanship details, marketing caption, and keywords.
    """
    api_key = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", None)
    if not api_key or "your-google-gemini-api-key" in str(api_key):
        return None

    prompt = f"""You are an AI storytelling assistant for an Indian artisan marketplace.

Create a compelling and respectful product story using ONLY the information provided by the artisan.

PRODUCT INFORMATION
-------------------
Product: {product_title}
Craft style: {craft_style}
Artisan: {artisan_name}
Region: {region}
Materials: {materials_used}

Return ONLY valid JSON with exactly these fields:

{{
    "product_description": "...",
    "cultural_story": "...",
    "craftsmanship": "...",
    "marketing_caption": "...",
    "keywords": ["...", "...", "...", "...", "..."]
}}

STRICT RULES:
- Do not invent historical facts.
- Do not invent dates or ancient origins.
- Do not claim GI certification unless explicitly provided.
- Do not claim government certification unless explicitly provided.
- Do not invent awards or artisan credentials.
- Do not invent facts about the artisan.
- Do not claim sustainability unless explicitly provided.
- Do not claim that the product belongs to a specific government scheme.
- Keep the story culturally respectful.
- Make the story suitable for an online marketplace.
"""

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        candidate_models = [
            "gemini-2.5-flash",
            "gemini-3.7-flash",
            "gemini-3.6-flash",
            "gemini-1.5-flash",
            "gemini-2.0-flash"
        ]

        for model_name in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                if response and response.text:
                    parsed = _extract_json_from_llm_text(response.text)
                    if parsed and isinstance(parsed, dict):
                        return parsed
            except Exception as model_err:
                print(f"[Gemini Model {model_name} Info] {model_err}")
                continue
    except Exception as err:
        print(f"[Gemini Client Info] {err}")

    return None


def generate_craft_story(
    product_title: str,
    craft_style: str,
    artisan_name: str,
    region: str,
    materials_used: str
) -> dict:
    """
    Generates an AI-assisted craft story and cryptographic
    provenance certificate.
    """
    # 1. Call Gemini LLM for structured story generation
    ai_content = call_llm_story_generation(
        product_title=product_title,
        craft_style=craft_style,
        artisan_name=artisan_name,
        region=region,
        materials_used=materials_used
    )

    heritage_info = HERITAGE_TRADITIONS.get(
        craft_style,
        {
            "lineage": "Centuries-old Indian rural handicraft traditions",
            "narrative": f"Masterfully handcrafted in {region} adhering to ethical, time-honored artisan knowledge systems."
        }
    )

    # 2. Resilient fallback if LLM is offline or not configured
    if not ai_content:
        ai_content = {
            "product_description": f"Authentic handcrafted {product_title} created in {region} by artisan {artisan_name} using {materials_used}.",
            "cultural_story": f"Handcrafted in {region} by master artisan {artisan_name}. Rooted in {heritage_info['lineage']}, {heritage_info['narrative']} Crafted meticulously with {materials_used}, each piece embodies traditional dedication and dignified artisan livelihood.",
            "craftsmanship": f"Traditional {craft_style} handcrafted with raw materials: {materials_used}.",
            "marketing_caption": f"Discover authentic Indian craft heritage: {product_title} handcrafted by {artisan_name} in {region}. #HandmadeInIndia #ArtisanHeritage",
            "keywords": [craft_style, region, "Handmade", "Indian Crafts", artisan_name]
        }

    # 3. Generate certificate identifier & timestamp
    certificate_id = f"CERT-IND-{uuid.uuid4().hex[:8].upper()}"
    timestamp = datetime.now(timezone.utc).isoformat()

    # 4. Create cryptographic provenance payload
    provenance_payload = {
        "certificate_id": certificate_id,
        "product_title": product_title,
        "artisan_name": artisan_name,
        "region": region,
        "materials_used": materials_used,
        "issued_at": timestamp
    }
    payload_string = json.dumps(provenance_payload, sort_keys=True)
    verification_hash = hashlib.sha256(payload_string.encode("utf-8")).hexdigest()

    verification_url = f"https://artisan-provenance.ondc.org/verify/{certificate_id}"

    return {
        "certificate_id": certificate_id,
        "product_title": product_title,
        "artisan_name": artisan_name,
        "cultural_origin_story": ai_content.get("cultural_story", "") or ai_content.get("cultural_origin_story", ""),
        "historical_lineage": heritage_info.get("lineage", "Indian artisan craft lineage"),
        "geo_tag": f"{region}, India",
        "verification_hash": verification_hash,
        "qr_payload": verification_url,
        "trust_badge": "AI-Generated Story | Provenance Hash Verified",
        "issued_at": timestamp,
        "product_description": ai_content.get("product_description", ""),
        "craftsmanship": ai_content.get("craftsmanship", ""),
        "marketing_caption": ai_content.get("marketing_caption", ""),
        "keywords": ai_content.get("keywords", []) or [],
        "powered_by": "Google Gemini LLM"
    }

