# 🪔 Smart Artisan Companion - Testing Dataset (SIH 2026)
### Ready-to-Use Authentic Indian Handicraft Inventory for Catalogue, Vision, & ONDC Testing

This directory contains **10 authentic, GI-tagged Indian handicraft products** curated for testing all core pillars of the **Smart Artisan Companion** (PM Vishwakarma & ONDC) platform:
1. **Zero-Literacy Vernacular Voice Transcription** (Digital India BHASHINI / Whisper AI)
2. **Edge AI Computer Vision & Symmetry Analysis** (YOLOv8 & OpenCV)
3. **Heritage Fair-Wage Pricing Calculation** (Living Wage Formula)
4. **ONDC & WhatsApp Business Marketplace Broadcast** (Beckn Protocol)

---

## 📦 Directory Structure

```
data_for_testing_SIH/
├── catalog_manifest.json              # Complete master JSON dataset of all 10 products
├── import_to_database.py              # 1-Click batch script to upload all items to active DB
├── README.md                          # Visual specifications & test guide
├── <craft_slug>.json                  # Individual detailed craft metadata files
└── images/                            # High-resolution genuine craft photos
    ├── gorakhpur_terracotta_elephant.jpg
    ├── varanasi_katan_silk_saree.jpg
    ├── bastar_dhokra_tribal_musician.jpg
    ├── channapatna_lacquerware_rocking_horse.jpg
    ├── jaipur_blue_pottery_floral_plate.jpg
    ├── madhubani_tussar_silk_painting.jpg
    ├── kutch_rogan_art_tree_stole.jpg
    ├── kashmiri_walnut_wood_jewelry_box.jpg
    ├── bidriware_silver_inlay_vase.jpg
    └── aranmula_metal_mirror.jpg
```

---

## 📋 Summary Product Manifest Table

| # | Craft Title | Category | Region / GI Tag | Raw Cost | Hours | Fair Price | Symmetry |
| :- | :--- | :--- | :--- | :-: | :-: | :-: | :-: |
| 1 | **Gorakhpur Terracotta Elephant** | Pottery & Terracotta | Gorakhpur, UP (GI) | ₹180 | 9.5h | **₹2,050** | 96.8% |
| 2 | **Varanasi Royal Katan Silk Saree** | Handloom & Silk | Varanasi, UP (GI) | ₹2,400 | 36.0h | **₹9,800** | 98.6% |
| 3 | **Bastar Dhokra Tribal Musician** | Bell Metal Casting | Bastar, CG (GI) | ₹420 | 16.0h | **₹3,400** | 94.2% |
| 4 | **Channapatna Rocking Horse Toy** | Woodcraft & Lacquer | Channapatna, KA (GI) | ₹210 | 7.0h | **₹1,450** | 97.4% |
| 5 | **Jaipur Blue Pottery Floral Plate** | Pottery & Terracotta | Jaipur, RJ (GI) | ₹280 | 11.0h | **₹2,350** | 98.1% |
| 6 | **Mithila Madhubani Tree of Life** | Folk Art & Painting | Madhubani, BR (GI) | ₹220 | 14.0h | **₹2,750** | 92.5% |
| 7 | **Kutch Rogan Art Wall Hanging** | Fabric Heritage Art | Kutch, GJ (GI) | ₹380 | 18.0h | **₹4,200** | 97.9% |
| 8 | **Kashmiri Walnut Wood Chest** | Woodcraft & Lacquer | Srinagar, J&K (GI) | ₹550 | 20.0h | **₹4,650** | 96.0% |
| 9 | **Bidriware Silver Inlay Vase** | Bell Metal Casting | Bidar, KA (GI) | ₹680 | 22.0h | **₹5,400** | 98.8% |
| 10 | **Aranmula Sacred Metal Mirror** | Bell Metal Casting | Aranmula, KL (GI) | ₹750 | 26.0h | **₹6,500** | 99.4% |

---

## ⚡ How to Import All 10 Items to Database

Run the included automated python script:

```bash
python data_for_testing_SIH/import_to_database.py
```

Or make a POST request with any of the `<craft_slug>.json` files to:
`http://localhost:8000/api/v1/products`
