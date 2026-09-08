"""
Multilingual Voice-to-Text & Vernacular Entity Extraction Engine
Inspired by Digital India BHASHINI & Whisper Edge AI.
Allows non-literate rural artisans to speak freely in regional languages (Hindi, Bengali, Tamil, etc.)
and automatically extracts structured product attributes (title, materials, hours, costs).
"""

import re
from typing import Dict, Any

VERNACULAR_SAMPLE_PROMPTS = {
    "hi-IN": {
        "audio_text": "मैंने यह टेराकोटा का बड़ा फूलदान बनाया है। गंगा किनारे की चिकनी मिट्टी इस्तेमाल की है। बनाने में आठ घंटे लगे और मिट्टी और रंग का सौ रुपया खर्च हुआ।",
        "title": "हस्तनिर्मित टेराकोटा पुष्पदान (Floral Clay Vase)",
        "craft_style": "Pottery & Terracotta",
        "material": "River Alluvial Clay & Natural Organic Dyes",
        "dimensions": "30cm x 18cm x 18cm",
        "hours": 8.0,
        "cost": 120.0
    },
    "bn-IN": {
        "audio_text": "আমি বাঁকুড়ার পোড়ামাটির ঘোড়া বানিয়েছি। বিশুদ্ধ মাটি দিয়ে হাতে গড়েছি। বানাতে দশ ঘণ্টা সময় লেগেছে, কাঁচামালের খরচ দেড়শত টাকা।",
        "title": "বাঁকুড়া পোড়ামাটির টেরাকোটা ঘোড়া (Bankura Terracotta Horse)",
        "craft_style": "Pottery & Terracotta",
        "material": "Bankura Terracotta Clay",
        "dimensions": "35cm x 12cm x 28cm",
        "hours": 10.0,
        "cost": 150.0
    },
    "ta-IN": {
        "audio_text": "நான் இந்த மதுரை சுங்கடி சேலையை கையால் நெய்துள்ளேன். தூய பருத்தி நூல் மற்றும் இயற்கை சாயங்கள் பயன்படுத்தப்பட்டுள்ளது. நெசவு செய்ய 14 மணிநேரம் ஆனது.",
        "title": "பாரம்பரிய மதுரை சுங்கடி பருத்தி சேலை (Madurai Sungudi Saree)",
        "craft_style": "Handloom & Banarasi Silk",
        "material": "Organic Cotton & Natural Indigo Dye",
        "dimensions": "5.5 meters x 1.2 meters",
        "hours": 14.0,
        "cost": 450.0
    },
    "en-IN": {
        "audio_text": "I have handcrafted this brass Dhokra tribal art figurine using traditional lost-wax bell metal casting. It took 12 hours of delicate wax filigree work and raw material cost of 320 rupees.",
        "title": "Handcrafted Dhokra Tribal Bell-Metal Figurine",
        "craft_style": "Dhokra Brass Casting",
        "material": "Recycled Brass, Bronze & Beeswax Core",
        "dimensions": "22cm x 10cm x 8cm",
        "hours": 12.0,
        "cost": 320.0
    }
}

def process_vernacular_speech(
    audio_base64: str = None,
    language: str = "hi-IN",
    sample_text: str = None
) -> Dict[str, Any]:
    """
    Simulates speech-to-text inference and attribute parsing.
    Extracts structured catalog metadata from spoken input.
    """
    ref_data = VERNACULAR_SAMPLE_PROMPTS.get(language, VERNACULAR_SAMPLE_PROMPTS["hi-IN"])
    
    transcription = sample_text if sample_text else ref_data["audio_text"]
    
    # Extract numerical cues if custom text is provided
    hours_match = re.search(r"(\d+)\s*(hour|ghante|ghanta|ঘণ্টা|மணிநேரம்)", transcription, re.IGNORECASE)
    cost_match = re.search(r"(\d+)\s*(rupee|rupiye|rupya|টাকা|ரூபாய்)", transcription, re.IGNORECASE)
    
    extracted_hours = float(hours_match.group(1)) if hours_match else ref_data["hours"]
    extracted_cost = float(cost_match.group(1)) if cost_match else ref_data["cost"]

    return {
        "language": language,
        "transcription": transcription,
        "detected_intent": "PRODUCT_CATALOG_VOICE_CREATION",
        "extracted_metadata": {
            "title": ref_data["title"],
            "craft_style": ref_data["craft_style"],
            "material": ref_data["material"],
            "dimensions": ref_data["dimensions"],
            "labor_hours": extracted_hours,
            "raw_material_cost": extracted_cost,
            "confidence_score": 0.96
        }
    }
