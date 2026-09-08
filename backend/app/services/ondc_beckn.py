"""
ONDC (Open Network for Digital Commerce) & WhatsApp Storefront Integration
Implements Beckn Protocol standard for decentralized e-commerce distribution.
Enables buyer applications (Paytm, Pincode, Magicpin, Mystore) to discover
and purchase directly from rural artisans without intermediary fees.
"""

from typing import Dict, Any, List
from datetime import datetime
import uuid

class BecknProtocolHandler:
    def __init__(self, bpp_id: str, bpp_uri: str):
        self.bpp_id = bpp_id
        self.bpp_uri = bpp_uri

    def format_item_to_beckn_catalog(self, product: dict, artisan: dict) -> dict:
        """
        Converts an artisan product into an ONDC Beckn compliant Catalog Item.
        """
        return {
            "id": f"ITEM-{product.get('sku', str(product.get('id', '001')))}",
            "descriptor": {
                "name": product.get("title", "Handcrafted Artisan Heritage Product"),
                "short_desc": product.get("craft_style", "Traditional Handicraft"),
                "long_desc": product.get("description", "Certified traditional craft by PM Vishwakarma artisan."),
                "images": [product.get("image_url", "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80")]
            },
            "category_id": product.get("category", "Handicrafts & Handlooms"),
            "price": {
                "currency": "INR",
                "value": str(product.get("price", product.get("suggested_price", 1200.0))),
                "maximum_value": str(round(float(product.get("price", 1200.0)) * 1.15, 2))
            },
            "matched": True,
            "tags": {
                "gi_tagged": "true",
                "pm_vishwakarma": "verified",
                "trust_badge": product.get("trust_badge", "Heritage Certified"),
                "artisan_origin": artisan.get("region", "India"),
                "direct_fair_trade": "true"
            }
        }

    def generate_beckn_on_search(self, transaction_id: str, catalog_items: List[dict]) -> dict:
        """
        Standard /on_search callback response conforming to ONDC retail protocol.
        """
        message_id = str(uuid.uuid4())
        return {
            "context": {
                "domain": "nic2004:52110",
                "country": "IND",
                "city": "std:080",
                "action": "on_search",
                "core_version": "1.2.0",
                "bap_id": "buyer-app.ondc.org",
                "bap_uri": "https://buyer-app.ondc.org/protocol/v1",
                "bpp_id": self.bpp_id,
                "bpp_uri": self.bpp_uri,
                "transaction_id": transaction_id,
                "message_id": message_id,
                "timestamp": datetime.utcnow().isoformat()
            },
            "message": {
                "catalog": {
                    "bpp/descriptor": {
                        "name": "Smart Artisan Heritage Collective",
                        "symbol": "https://img.icons8.com/color/96/pottery.png"
                    },
                    "bpp/providers": [
                        {
                            "id": "PROVIDER-BRO-CODE-01",
                            "descriptor": {
                                "name": "Direct Artisan Guild",
                                "short_desc": "Zero Middlemen Direct-to-Consumer Indian Handicrafts"
                            },
                            "items": catalog_items
                        }
                    ]
                }
            }
        }

    def publish_to_channels(self, product_id: int, product_details: dict) -> dict:
        """
        Simulates one-click automated sync to ONDC Gateway and WhatsApp Business Catalog.
        """
        item_id = f"ARTISAN-SKU-{product_id}"
        whatsapp_catalog_id = f"WABA-CAT-{uuid.uuid4().hex[:6].upper()}"

        return {
            "status": "SUCCESS",
            "bpp_id": self.bpp_id,
            "bpp_uri": self.bpp_uri,
            "item_id": item_id,
            "ondc_network_status": "ACTIVE_IN_SEARCH_INDEX",
            "whatsapp_catalog_id": whatsapp_catalog_id,
            "channels": [
                {"name": "ONDC Open Commerce", "status": "LIVE", "visibility": "All ONDC Buyer Apps (Paytm, Magicpin, Mystore)"},
                {"name": "WhatsApp Business", "status": "SYNCED", "store_link": f"https://wa.me/p/{whatsapp_catalog_id}"},
                {"name": "Tribal / Craft Direct", "status": "VERIFIED", "badge": "GI Trust Certified"}
            ],
            "message": "Product successfully published to national ONDC network and WhatsApp storefront!"
        }
