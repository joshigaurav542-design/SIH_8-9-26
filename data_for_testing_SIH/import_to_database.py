#!/usr/bin/env python3
import os
import json
import urllib.request
import urllib.error

import sys

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

API_URL = "http://127.0.0.1:8000/api/v1/products"
MANIFEST_FILE = os.path.join(os.path.dirname(__file__), "catalog_manifest.json")

def main():
    print("=" * 65)
    print(" [*] Smart Artisan Companion - Batch Database Ingestion")
    print(f" Target API: {API_URL}")
    print("=" * 65)

    if not os.path.exists(MANIFEST_FILE):
        print(f"[!] Error: Manifest not found at {MANIFEST_FILE}")
        return

    with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    crafts = data.get("crafts", [])
    print(f"[*] Found {len(crafts)} test craft products to ingest...")

    success_count = 0
    for idx, craft in enumerate(crafts, 1):
        payload = {
            "title": craft["title"],
            "description": craft["cultural_story"],
            "artisan_name": craft["artisan_name"],
            "region": craft["region"],
            "category": craft["category"],
            "craft_style": craft["craft_style"],
            "material": craft["material"],
            "dimensions": craft["dimensions"],
            "weight_grams": craft.get("weight_grams", 500.0),
            "raw_material_cost": craft["raw_material_cost"],
            "labor_hours": craft["labor_hours"],
            "skill_level": craft["skill_level"],
            "price": craft["suggested_price"],
            "image_url": craft["image_url"],
            "gi_certified": craft.get("gi_certified", True),
            "ondc_published": craft.get("ondc_published", True)
        }

        req = urllib.request.Request(
            API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status in (200, 201):
                    res_body = json.loads(resp.read().decode("utf-8"))
                    print(f"[{idx}/{len(crafts)}] [OK] Ingested: {craft['title'][:32]}... -> SKU: {res_body.get('sku')}")
                    success_count += 1
                else:
                    print(f"[{idx}/{len(crafts)}] [!] Warning HTTP {resp.status} for {craft['title'][:25]}")
        except urllib.error.URLError as e:
            print(f"[{idx}/{len(crafts)}] [FAILED] Could not connect to API at {API_URL}: {e}")
            print("   Make sure the FastAPI backend is running on port 8000!")
            return

    print("=" * 65)
    print(f"[DONE] Successfully ingested {success_count}/{len(crafts)} products into Database!")
    print("=" * 65)

if __name__ == "__main__":
    main()
