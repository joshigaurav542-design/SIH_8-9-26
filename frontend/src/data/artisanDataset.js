/**
 * 🪔 KalaSetu / Smart Artisan Companion - Master Artisan Catalogue Dataset
 * 
 * This file provides the full dataset of authentic Indian handicrafts catering to
 * the application, covering 15 GI-tagged trades under the PM Vishwakarma initiative.
 * 
 * Exported utilities allow filtering by category, calculating fair heritage prices,
 * extracting artisan metrics, and formatting products for ONDC Beckn protocol publishing.
 */

export const ARTISAN_CATEGORIES = [
  'ALL',
  'Pottery & Terracotta',
  'Handloom & Silk',
  'Bell Metal Casting',
  'Woodcraft & Lacquer',
  'Blue Pottery',
  'Traditional Painting',
  'Metalcraft & Inlay',
  'Temple Arts & Gold Leaf',
  'Textile Art',
  'Metal Handicrafts',
  'Needlework & Embroidery',
  'Textile Appliqué',
  'Leathercraft'
];

export const ARTISAN_MASTER_DATASET = [
  {
    id: 'prod-terra-001',
    sku: 'ART-TERRA-001',
    title: 'Gorakhpur GI-Tagged Terracotta Floral Urn',
    vernacularTitle: 'गोरखपुर जीआई-टैग टेराकोटा पुष्प कलश',
    category: 'Pottery & Terracotta',
    craftStyle: 'Hand-thrown Alluvial Clay Kiln-Fired',
    material: 'Natural Riverbed Clay (Mati) with Organic Husk Glaze',
    dimensions: '32cm (H) x 20cm (W) x 20cm (D)',
    weight: '1,200g',
    weightGrams: 1200,
    rawCost: 160,
    laborHours: 9,
    hourlyRate: 145,
    fairLaborCost: 1305,
    price: 1930,
    suggestedPrice: 1930,
    middlemanRate: 550,
    artisanGainPercent: 250.9,
    symmetryScore: 96.4,
    densityScore: 94.1,
    trustBadge: 'Masterpiece Grade A+ (GI Certified)',
    giCertified: true,
    giTagNumber: 'GI-IN-564',
    artisan: {
      name: 'Ramprasad Prajapati',
      artisanId: 'PM-VISH-2026-098',
      pmVishwakarmaId: 'PMV-UP-249018',
      skillLevel: 'Master Artisan',
      guild: 'Gorakhpur Mati Kala Samiti',
      region: 'Gorakhpur',
      state: 'Uttar Pradesh',
      dialect: 'hi-IN',
      phone: '+91 98765 43210'
    },
    story: 'Handcrafted along the sacred banks of the Rapti river using centuries-old clay blending techniques. Fired in natural husk kilns yielding a deep ochre hue without synthetic chemicals.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9012',
      hash: '0x8f2d91bc43a789ef1240ad8192a54b391789c0de49a712f5e3d74bc810aa39c1',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9012'
    },
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    ondcPublished: true,
    whatsappSync: true,
    dateAdded: '2026-09-01'
  },
  {
    id: 'prod-silk-002',
    sku: 'ART-SILK-002',
    title: 'Varanasi Royal Katan Silk Shawl with Zari',
    vernacularTitle: 'वाराणसी शाही कतान सिल्क ज़री शॉल',
    category: 'Handloom & Silk',
    craftStyle: 'Traditional Banarasi Pit Loom Jacquard Weave',
    material: 'Pure Mulberry Silk with Electroplated Silver-Gold Zari',
    dimensions: '2.4m (L) x 0.9m (W)',
    weight: '350g',
    weightGrams: 350,
    rawCost: 1200,
    laborHours: 32,
    hourlyRate: 160,
    fairLaborCost: 5120,
    price: 8450,
    suggestedPrice: 8450,
    middlemanRate: 2800,
    artisanGainPercent: 201.8,
    symmetryScore: 98.2,
    densityScore: 97.5,
    trustBadge: 'National Heritage Masterpiece',
    giCertified: true,
    giTagNumber: 'GI-IN-28',
    artisan: {
      name: 'Kashi Devi & Weaver Guild',
      artisanId: 'PM-VISH-2026-104',
      pmVishwakarmaId: 'PMV-UP-819201',
      skillLevel: 'Master Weaver',
      guild: 'Kashi Bunkar Sahkari Samiti',
      region: 'Varanasi',
      state: 'Uttar Pradesh',
      dialect: 'hi-IN',
      phone: '+91 98112 34567'
    },
    story: 'Woven on pit looms in the historic weaver mohallas of Varanasi. Each paisley and booti motif is manually interlaced using high-density Katan silk warps and electroplated silver zari threads.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9015',
      hash: '0x3e18a90bb62cf4e129ad4100dc8930419ef8214bbde7a23c4015671192fa2810',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9015'
    },
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    ondcPublished: true,
    whatsappSync: true,
    dateAdded: '2026-09-03'
  },
  {
    id: 'prod-dhok-003',
    sku: 'ART-DHOK-003',
    title: 'Bastar Lost-Wax Bell Metal Figurine (Dhokra Art)',
    vernacularTitle: 'बस्तर खोया-मोम घंटी धातु जनजातीय मूर्ति',
    category: 'Bell Metal Casting',
    craftStyle: 'Indigenous Lost-Wax Cire Perdue Hollow Casting',
    material: 'Bell Metal Bronze, Beeswax Core & Riverbed Soil Mold',
    dimensions: '25cm (H) x 12cm (W) x 9cm (D)',
    weight: '850g',
    weightGrams: 850,
    rawCost: 450,
    laborHours: 14,
    hourlyRate: 145,
    fairLaborCost: 2030,
    price: 3200,
    suggestedPrice: 3200,
    middlemanRate: 950,
    artisanGainPercent: 236.8,
    symmetryScore: 93.8,
    densityScore: 95.0,
    trustBadge: 'Heritage Certified Grade A',
    giCertified: true,
    giTagNumber: 'GI-IN-83',
    artisan: {
      name: 'Mangal Ram Ghadwa',
      artisanId: 'PM-VISH-2026-215',
      pmVishwakarmaId: 'PMV-CG-419082',
      skillLevel: 'Skilled Artisan',
      guild: 'Bastar Ghadwa Shilp Sangathan',
      region: 'Kondagaon, Bastar',
      state: 'Chhattisgarh',
      dialect: 'hi-IN',
      phone: '+91 94056 78912'
    },
    story: 'Dating back 4,000 years to the Indus Valley Dancing Girl, Dhokra casting uses an intricate non-ferrous lost-wax technique with hand-coiled wax threads over an alluvial clay core.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9022',
      hash: '0x5b2210fc91238914abce019842bcda71092437811efca010471239aaef114589',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9022'
    },
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    ondcPublished: true,
    whatsappSync: true,
    dateAdded: '2026-09-05'
  },
  {
    id: 'prod-wood-004',
    sku: 'ART-WOOD-004',
    title: 'Channapatna Organic Lacquerware Toy Ensemble',
    vernacularTitle: 'चन्नापट्टना प्राकृतिक लाख खिलौना समूह',
    category: 'Woodcraft & Lacquer',
    craftStyle: 'Lathe-Turned Seasoned Ivory Wood with Vegetable Lac',
    material: 'Wrightia Tinctoria (Aale Mara) Wood & Natural Vegetable Dyes',
    dimensions: '18cm (H) x 15cm (W) x 10cm (D)',
    weight: '400g',
    weightGrams: 400,
    rawCost: 180,
    laborHours: 6,
    hourlyRate: 145,
    fairLaborCost: 870,
    price: 1450,
    suggestedPrice: 1450,
    middlemanRate: 420,
    artisanGainPercent: 245.2,
    symmetryScore: 97.2,
    densityScore: 95.8,
    trustBadge: 'GI Tagged Heritage Toy',
    giCertified: true,
    giTagNumber: 'GI-IN-16',
    artisan: {
      name: 'B. R. Venkatesh',
      artisanId: 'PM-VISH-2026-312',
      pmVishwakarmaId: 'PMV-KA-992140',
      skillLevel: 'Master Craftsman',
      guild: 'Channapatna Toy Artisan Cooperative',
      region: 'Ramanagara',
      state: 'Karnataka',
      dialect: 'kn-IN',
      phone: '+91 97411 22334'
    },
    story: 'Hailing from Karnataka’s celebrated Gombegala Ooru (Toy Town). Lathe-turned from medicinal Ivory wood, colored using non-toxic molten organic tree lac blended with natural turmeric and indigo extracts.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9031',
      hash: '0x192a54b391789c0de49a712f5e3d74bc810aa39c18f2d91bc43a789ef1240ad8',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9031'
    },
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
    ondcPublished: false,
    whatsappSync: false,
    dateAdded: '2026-09-07'
  },
  {
    id: 'prod-blue-005',
    sku: 'ART-BLUE-005',
    title: 'Jaipur Hand-Painted Royal Blue Pottery Vase',
    vernacularTitle: 'जयपुर हस्तचित्रित शाही ब्लू पॉटरी फूलदान',
    category: 'Blue Pottery',
    craftStyle: 'Glazed Low-Fire Quartzite Frit Craft',
    material: 'Quartz Stone Powder, Multani Mitti, Katira Gond & Natural Cobalt',
    dimensions: '28cm (H) x 16cm (W) x 16cm (D)',
    weight: '950g',
    weightGrams: 950,
    rawCost: 290,
    laborHours: 11,
    hourlyRate: 150,
    fairLaborCost: 1650,
    price: 2650,
    suggestedPrice: 2650,
    middlemanRate: 800,
    artisanGainPercent: 231.3,
    symmetryScore: 95.8,
    densityScore: 96.2,
    trustBadge: 'Masterpiece Grade A+ (GI Certified)',
    giCertified: true,
    giTagNumber: 'GI-IN-41',
    artisan: {
      name: 'Girraj Kishore Sharma',
      artisanId: 'PM-VISH-2026-401',
      pmVishwakarmaId: 'PMV-RJ-104928',
      skillLevel: 'Master Artisan',
      guild: 'Jaipur Blue Pottery Vikas Kendra',
      region: 'Kot Jewar, Jaipur',
      state: 'Rajasthan',
      dialect: 'hi-IN',
      phone: '+91 94140 55678'
    },
    story: 'Formed from ground quartz and Fuller’s earth without raw clay. Hand-painted with squirrel-hair brushes using pure cobalt blue and copper green mineral oxides.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9040',
      hash: '0x7a8813bc94910243be44019a12810fcebb814032d1ef912091244ab98012cc45',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9040'
    },
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    ondcPublished: true,
    whatsappSync: true,
    dateAdded: '2026-09-08'
  },
  {
    id: 'prod-pash-006',
    sku: 'ART-PASH-006',
    title: 'Kashmir Hand-Spun Pashmina Sozni Stole',
    vernacularTitle: 'कश्मीर हस्त-कताई पश्मीना सोज़नी शॉल',
    category: 'Handloom & Silk',
    craftStyle: 'Charkha Hand-Spun Diamond Weave with Sozni Needlework',
    material: '100% Changthangi Mountain Goat Cashmere Fleece',
    dimensions: '2.0m (L) x 0.7m (W)',
    weight: '180g',
    weightGrams: 180,
    rawCost: 2800,
    laborHours: 48,
    hourlyRate: 175,
    fairLaborCost: 8400,
    price: 14200,
    suggestedPrice: 14200,
    middlemanRate: 4500,
    artisanGainPercent: 215.5,
    symmetryScore: 98.9,
    densityScore: 98.4,
    trustBadge: 'National Heritage Masterpiece',
    giCertified: true,
    giTagNumber: 'GI-IN-46',
    artisan: {
      name: 'Ghulam Mohammad Mir',
      artisanId: 'PM-VISH-2026-512',
      pmVishwakarmaId: 'PMV-JK-774120',
      skillLevel: 'Master Weaver',
      guild: 'Srinagar Craft Development Guild',
      region: 'Kanihama, Srinagar',
      state: 'Jammu & Kashmir',
      dialect: 'ur-IN',
      phone: '+91 99065 11223'
    },
    story: 'Handcrafted from 12-micron underfleece harvested by Changpa nomads at 14,000 ft altitude. Spun on traditional wooden wheels and delicately needle-embroidered in the historic Sozni tradition.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9051',
      hash: '0x44f128bc80129031bafe99134a709214bf390145edab7891240a1b2c3d4e5f60',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9051'
    },
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80',
    ondcPublished: true,
    whatsappSync: true,
    dateAdded: '2026-09-08'
  },
  {
    id: 'prod-madhu-007',
    sku: 'ART-MADHU-007',
    title: 'Madhubani Kohbar Painting on Handmade Bamboo Paper',
    vernacularTitle: 'मधुबनी कोहबर लोक चित्रकला हस्तनिर्मित कागज पर',
    category: 'Traditional Painting',
    craftStyle: 'Mithila Kohbar Double-Line Bamboo Nib Painting',
    material: 'Handmade Cotton Rag Paper with Mineral & Plant Pigments',
    dimensions: '56cm (L) x 38cm (W)',
    weight: '220g',
    weightGrams: 220,
    rawCost: 150,
    laborHours: 18,
    hourlyRate: 145,
    fairLaborCost: 2610,
    price: 3650,
    suggestedPrice: 3650,
    middlemanRate: 1100,
    artisanGainPercent: 231.8,
    symmetryScore: 94.6,
    densityScore: 96.7,
    trustBadge: 'Masterpiece Grade A+ (GI Certified)',
    giCertified: true,
    giTagNumber: 'GI-IN-105',
    artisan: {
      name: 'Sunita Devi Jha',
      artisanId: 'PM-VISH-2026-619',
      pmVishwakarmaId: 'PMV-BR-309182',
      skillLevel: 'Master Artist',
      guild: 'Mithila Mahila Kalakar Sangh',
      region: 'Ranti, Madhubani',
      state: 'Bihar',
      dialect: 'hi-IN',
      phone: '+91 94312 89012'
    },
    story: 'Painted using sharpened bamboo twigs and natural dyes pressed from flowers and leaves, portraying auspicious motifs of fertility and cosmic blessings.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9062',
      hash: '0x9182a54b391789c0de49a712f5e3d74bc810aa39c18f2d91bc43a789ef1240ad',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9062'
    },
    image: 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=800&q=80',
    ondcPublished: true,
    whatsappSync: true,
    dateAdded: '2026-09-08'
  },
  {
    id: 'prod-bidri-008',
    sku: 'ART-BIDRI-008',
    title: 'Bidar Heritage Pure Silver Inlay Bidriware Vessel',
    vernacularTitle: 'बीदर धरोहर शुद्ध चांदी जड़ाऊ बिदरी पात्र',
    category: 'Metalcraft & Inlay',
    craftStyle: 'Damascening Zinc-Copper Alloy with Fort Mud Oxidation',
    material: 'Zinc & Copper Alloy with Pure 99.9% Silver Sheet Inlay',
    dimensions: '22cm (H) x 14cm (W) x 14cm (D)',
    weight: '780g',
    weightGrams: 780,
    rawCost: 720,
    laborHours: 20,
    hourlyRate: 160,
    fairLaborCost: 3200,
    price: 5200,
    suggestedPrice: 5200,
    middlemanRate: 1600,
    artisanGainPercent: 225.0,
    symmetryScore: 97.6,
    densityScore: 95.9,
    trustBadge: 'National Heritage Masterpiece',
    giCertified: true,
    giTagNumber: 'GI-IN-11',
    artisan: {
      name: 'Mohammad Abdul Rauf',
      artisanId: 'PM-VISH-2026-724',
      pmVishwakarmaId: 'PMV-KA-620914',
      skillLevel: 'Master Metalworker',
      guild: 'Bidar Bidri Artisans Federation',
      region: 'Bidar',
      state: 'Karnataka',
      dialect: 'ur-IN',
      phone: '+91 98450 78123'
    },
    story: 'Originating in 14th-century Bahmani Sultanate. Cast from zinc-copper, engraved with floral scrolls, inlaid with pure silver wires, and permanently oxidized using unique soil from Bidar Fort.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9071',
      hash: '0x2891bc43a789ef1240ad8192a54b391789c0de49a712f5e3d74bc810aa39c18f',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9071'
    },
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
    ondcPublished: true,
    whatsappSync: true,
    dateAdded: '2026-09-08'
  },
  {
    id: 'prod-tanj-009',
    sku: 'ART-TANJ-009',
    title: 'Thanjavur 22K Gold Foil Temple Wall Panel',
    vernacularTitle: 'तंजौर 22 कैरेट स्वर्ण पत्रक मंदिर कलाकृति',
    category: 'Temple Arts & Gold Leaf',
    craftStyle: 'Gesso Relief Work with 22-Karat Gold Leaf & Jaipur Stones',
    material: 'Seasoned Teakwood Board, Limestone Chalk Gesso & Pure Gold Foil',
    dimensions: '45cm (H) x 35cm (W) x 4cm (D)',
    weight: '2,400g',
    weightGrams: 2400,
    rawCost: 2200,
    laborHours: 36,
    hourlyRate: 165,
    fairLaborCost: 5940,
    price: 10500,
    suggestedPrice: 10500,
    middlemanRate: 3800,
    artisanGainPercent: 176.3,
    symmetryScore: 96.1,
    densityScore: 97.8,
    trustBadge: 'Masterpiece Grade A+ (GI Certified)',
    giCertified: true,
    giTagNumber: 'GI-IN-33',
    artisan: {
      name: 'S. Kalyanasundaram',
      artisanId: 'PM-VISH-2026-809',
      pmVishwakarmaId: 'PMV-TN-450912',
      skillLevel: 'Master Artist',
      guild: 'Thanjavur Traditional Arts Guild',
      region: 'Thanjavur',
      state: 'Tamil Nadu',
      dialect: 'ta-IN',
      phone: '+91 94431 44556'
    },
    story: 'Preserved since the Chola and Nayaka dynasties, featuring high-relief chalk gesso adorned with unalterable 22-karat gold foil leaves that preserve their glow for centuries.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9080',
      hash: '0x671192fa28103e18a90bb62cf4e129ad4100dc8930419ef8214bbde7a23c4015',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9080'
    },
    image: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?auto=format&fit=crop&w=800&q=80',
    ondcPublished: false,
    whatsappSync: true,
    dateAdded: '2026-09-08'
  },
  {
    id: 'prod-rogan-010',
    sku: 'ART-ROGAN-010',
    title: 'Kutch Castor-Oil Rogan Painted Tree of Life',
    vernacularTitle: 'कच्छ कैस्टर-ऑइल रोगन चित्रित जीवन वृक्ष',
    category: 'Textile Art',
    craftStyle: 'Freehand Metal Stylus Rogan on Cotton Khadi',
    material: 'Boiled Castor Oil Paste, Natural Earth Pigments & Handspun Cotton',
    dimensions: '60cm (L) x 45cm (W)',
    weight: '280g',
    weightGrams: 280,
    rawCost: 340,
    laborHours: 22,
    hourlyRate: 150,
    fairLaborCost: 3300,
    price: 4800,
    suggestedPrice: 4800,
    middlemanRate: 1500,
    artisanGainPercent: 220.0,
    symmetryScore: 95.2,
    densityScore: 96.0,
    trustBadge: 'National Heritage Masterpiece',
    giCertified: true,
    giTagNumber: 'GI-IN-409',
    artisan: {
      name: 'Rizwan Khatri',
      artisanId: 'PM-VISH-2026-911',
      pmVishwakarmaId: 'PMV-GJ-881290',
      skillLevel: 'Master Craftsman',
      guild: 'Nirona Rogan Art Foundation',
      region: 'Nirona, Kutch',
      state: 'Gujarat',
      dialect: 'gu-IN',
      phone: '+91 98254 33211'
    },
    story: 'One of the world’s rarest textile arts. Castor oil is boiled into an elastic gel, colored with minerals, and spun in mid-air using a stylus before touching the cloth.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9095',
      hash: '0x1145895b2210fc91238914abce019842bcda71092437811efca010471239aaef',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9095'
    },
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80',
    ondcPublished: true,
    whatsappSync: true,
    dateAdded: '2026-09-08'
  },
  {
    id: 'prod-pem-011',
    sku: 'ART-PEM-011',
    title: 'Pembarthi Brass Sheet Repoussé Wall Medallion',
    vernacularTitle: 'पेंबरथी पीतल उत्कीर्ण भित्ति पदक',
    category: 'Metal Handicrafts',
    craftStyle: 'Sheet Metal Repoussé & Chasing Technique',
    material: 'High-Gauge Virgin Brass Sheet with Natural Lac Pitch Backing',
    dimensions: '36cm (Diameter) x 3cm (Depth)',
    weight: '1,150g',
    weightGrams: 1150,
    rawCost: 410,
    laborHours: 15,
    hourlyRate: 145,
    fairLaborCost: 2175,
    price: 3450,
    suggestedPrice: 3450,
    middlemanRate: 1050,
    artisanGainPercent: 228.6,
    symmetryScore: 97.0,
    densityScore: 94.8,
    trustBadge: 'GI Tagged Heritage Craft',
    giCertified: true,
    giTagNumber: 'GI-IN-37',
    artisan: {
      name: 'N. Sriramachari',
      artisanId: 'PM-VISH-2026-928',
      pmVishwakarmaId: 'PMV-TG-219403',
      skillLevel: 'Master Artisan',
      guild: 'Pembarthi Metal Workers Society',
      region: 'Jangaon',
      state: 'Telangana',
      dialect: 'te-IN',
      phone: '+91 99890 12345'
    },
    story: 'Inherited from the Kakatiya Dynasty royal brass workers. Hand-embossed with fine chasing punches over heated resin beds to create intricate three-dimensional reliefs.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9102',
      hash: '0x39c18f2d91bc43a789ef1240ad8192a54b391789c0de49a712f5e3d74bc810aa',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9102'
    },
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    ondcPublished: true,
    whatsappSync: false,
    dateAdded: '2026-09-08'
  },
  {
    id: 'prod-muga-012',
    sku: 'ART-MUGA-012',
    title: 'Assam Golden Muga Silk Mekhela Sador',
    vernacularTitle: 'असम स्वर्णिम मूगा सिल्क मेखेला चादर',
    category: 'Handloom & Silk',
    craftStyle: 'Throw-Shuttle Frame Loom Wild Silk Weave',
    material: '100% Endemic Antheraea Assamensis Wild Muga Silk',
    dimensions: '4.2m (Combined Length) x 0.95m (W)',
    weight: '480g',
    weightGrams: 480,
    rawCost: 3200,
    laborHours: 40,
    hourlyRate: 165,
    fairLaborCost: 6600,
    price: 12800,
    suggestedPrice: 12800,
    middlemanRate: 4800,
    artisanGainPercent: 166.7,
    symmetryScore: 98.4,
    densityScore: 97.9,
    trustBadge: 'National Heritage Masterpiece',
    giCertified: true,
    giTagNumber: 'GI-IN-55',
    artisan: {
      name: 'Pranita Saikia',
      artisanId: 'PM-VISH-2026-940',
      pmVishwakarmaId: 'PMV-AS-550912',
      skillLevel: 'Master Weaver',
      guild: 'Sualkuchi Silk Weavers Cooperative',
      region: 'Sualkuchi, Kamrup',
      state: 'Assam',
      dialect: 'as-IN',
      phone: '+91 94350 67890'
    },
    story: 'Woven from wild silkworms found only in Assam’s Brahmaputra valley. Its golden hue intensifies after each wash, surviving for centuries without artificial dyes.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9115',
      hash: '0xbb814032d1ef912091244ab98012cc457a8813bc94910243be44019a12810fce',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9115'
    },
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    ondcPublished: true,
    whatsappSync: true,
    dateAdded: '2026-09-08'
  },
  {
    id: 'prod-phul-013',
    sku: 'ART-PHUL-013',
    title: 'Punjab Hand-Embroidered Champa Phulkari Dupatta',
    vernacularTitle: 'पंजाब हस्त-कशीदाकारी चंपा फुलकारी दुपट्टा',
    category: 'Needlework & Embroidery',
    craftStyle: 'Reverse Darning Stitch on Handspun Khaddar',
    material: 'Raw Khaddar Cotton Cloth with Untwisted Pat Silk Floss',
    dimensions: '2.3m (L) x 1.0m (W)',
    weight: '420g',
    weightGrams: 420,
    rawCost: 580,
    laborHours: 26,
    hourlyRate: 145,
    fairLaborCost: 3770,
    price: 5600,
    suggestedPrice: 5600,
    middlemanRate: 1800,
    artisanGainPercent: 211.1,
    symmetryScore: 96.5,
    densityScore: 95.4,
    trustBadge: 'Masterpiece Grade A+ (GI Certified)',
    giCertified: true,
    giTagNumber: 'GI-IN-198',
    artisan: {
      name: 'Harpreet Kaur',
      artisanId: 'PM-VISH-2026-955',
      pmVishwakarmaId: 'PMV-PB-412980',
      skillLevel: 'Master Embroiderer',
      guild: 'Patiala Heritage Craft Guild',
      region: 'Patiala',
      state: 'Punjab',
      dialect: 'pa-IN',
      phone: '+91 98721 34567'
    },
    story: 'Embroidered entirely from the reverse side of handspun khaddar using vibrant silk floss, creating intricate geometric flower gardens without preliminary tracing.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9122',
      hash: '0xedab7891240a1b2c3d4e5f6044f128bc80129031bafe99134a709214bf390145',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9122'
    },
    image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80',
    ondcPublished: true,
    whatsappSync: true,
    dateAdded: '2026-09-08'
  },
  {
    id: 'prod-pipli-014',
    sku: 'ART-PIPLI-014',
    title: 'Pipli Chandua Appliqué Heritage Wall Hanging',
    vernacularTitle: 'पिपली चंदुआ पिपली हस्तकला भित्ति सज्जा',
    category: 'Textile Appliqué',
    craftStyle: 'Traditional Jagannath Ratha Yatra Appliqué & Mirror Embroidery',
    material: 'Dyed Cotton Fabrics, Glass Mirrors & Jute Reinforcement',
    dimensions: '90cm (L) x 60cm (W)',
    weight: '550g',
    weightGrams: 550,
    rawCost: 260,
    laborHours: 12,
    hourlyRate: 145,
    fairLaborCost: 1740,
    price: 2600,
    suggestedPrice: 2600,
    middlemanRate: 850,
    artisanGainPercent: 205.9,
    symmetryScore: 95.5,
    densityScore: 96.1,
    trustBadge: 'Heritage Certified Grade A',
    giCertified: true,
    giTagNumber: 'GI-IN-86',
    artisan: {
      name: 'Bichitra Mohapatra',
      artisanId: 'PM-VISH-2026-968',
      pmVishwakarmaId: 'PMV-OD-198204',
      skillLevel: 'Skilled Artisan',
      guild: 'Pipli Applique Crafts Society',
      region: 'Pipli, Puri',
      state: 'Odisha',
      dialect: 'or-IN',
      phone: '+91 94371 88990'
    },
    story: 'Consecrated for over 800 years for the Puri Ratha Yatra chariots. Colorful fabric cuts are hand-stitched over contrasting layers with mirror accents.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9130',
      hash: '0x1240ad8192a54b391789c0de49a712f5e3d74bc810aa39c18f2d91bc43a789ef',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9130'
    },
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    ondcPublished: false,
    whatsappSync: false,
    dateAdded: '2026-09-08'
  },
  {
    id: 'prod-kolh-015',
    sku: 'ART-KOLH-015',
    title: 'Kolhapuri Traditional Hand-Stitched Leather Mojari',
    vernacularTitle: 'कोल्हापुरी पारंपरिक हस्तनिर्मित चर्म मोजरी',
    category: 'Leathercraft',
    craftStyle: 'Vegetable-Tanned Bag-Tanned Leather Hand Braiding',
    material: 'Naturally Tanned Leather with Babool Bark & Sisal Thread',
    dimensions: 'Size 8-10 UK / 28cm Sole',
    weight: '460g',
    weightGrams: 460,
    rawCost: 380,
    laborHours: 10,
    hourlyRate: 145,
    fairLaborCost: 1450,
    price: 2400,
    suggestedPrice: 2400,
    middlemanRate: 750,
    artisanGainPercent: 220.0,
    symmetryScore: 97.4,
    densityScore: 95.0,
    trustBadge: 'GI Tagged Heritage Footwear',
    giCertified: true,
    giTagNumber: 'GI-IN-244',
    artisan: {
      name: 'Santosh Chougule',
      artisanId: 'PM-VISH-2026-981',
      pmVishwakarmaId: 'PMV-MH-771029',
      skillLevel: 'Master Cobbler',
      guild: 'Kolhapur Charmakar Audyogik Utpadak Society',
      region: 'Kolhapur',
      state: 'Maharashtra',
      dialect: 'mr-IN',
      phone: '+91 98901 22446'
    },
    story: 'Crafted without nails or metal staples, utilizing indigenous vegetable tanning from Babool tree barks and hand-woven sisal plant fibers for lifelong resilience.',
    authenticityCertificate: {
      certificateId: 'CERT-GI-2026-9141',
      hash: '0x5e3d74bc810aa39c18f2d91bc43a789ef1240ad8192a54b391789c0de49a712f',
      verificationUrl: 'https://kalasetu.gov.in/verify/CERT-GI-2026-9141'
    },
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    ondcPublished: true,
    whatsappSync: true,
    dateAdded: '2026-09-08'
  }
];

// Re-export alias for seamless compatibility
export const ARTISAN_DATASET = ARTISAN_MASTER_DATASET;

/**
 * Living Wage fair price calculation utility.
 * Formula: (Raw Material Cost + (Labor Hours * Hourly Living Wage)) * Artisan Margin Tier
 */
export function getSuggestedPrice(product, hourlyRate = 145, marginMultiplier = 1.25) {
  if (!product) return 1500;
  if (product.suggestedPrice) return Math.round(Number(product.suggestedPrice));
  const raw = Number(product.rawCost) || 160;
  const hours = Number(product.laborHours) || 8;
  const rate = Number(product.hourlyRate) || hourlyRate;
  return Math.round((raw + hours * rate) * marginMultiplier);
}

/**
 * Filter products by category
 */
export function getProductsByCategory(category = 'ALL') {
  if (!category || category === 'ALL') return ARTISAN_MASTER_DATASET;
  return ARTISAN_MASTER_DATASET.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

/**
 * Filter products by GI Certification status
 */
export function getGiCertifiedProducts() {
  return ARTISAN_MASTER_DATASET.filter(p => p.giCertified === true);
}

/**
 * Get aggregate statistics across the dataset
 */
export function getArtisanDatasetStats() {
  const totalProducts = ARTISAN_MASTER_DATASET.length;
  const totalValue = ARTISAN_MASTER_DATASET.reduce((sum, p) => sum + (p.price || 0), 0);
  const totalLaborHours = ARTISAN_MASTER_DATASET.reduce((sum, p) => sum + (p.laborHours || 0), 0);
  const avgSymmetry = (ARTISAN_MASTER_DATASET.reduce((sum, p) => sum + (p.symmetryScore || 0), 0) / totalProducts).toFixed(1);
  const avgGain = (ARTISAN_MASTER_DATASET.reduce((sum, p) => sum + (p.artisanGainPercent || 0), 0) / totalProducts).toFixed(1);
  const ondcLiveCount = ARTISAN_MASTER_DATASET.filter(p => p.ondcPublished).length;

  return {
    totalProducts,
    totalValue,
    totalLaborHours,
    avgSymmetry: Number(avgSymmetry),
    avgArtisanIncomeGainPercent: Number(avgGain),
    ondcLiveCount,
    giCertifiedCount: ARTISAN_MASTER_DATASET.filter(p => p.giCertified).length
  };
}

/**
 * Converts a catalogue item into the official ONDC Beckn protocol item specification
 */
export function formatForOndcProtocol(product) {
  return {
    id: product.sku,
    descriptor: {
      name: product.title,
      code: product.sku,
      short_desc: product.vernacularTitle || product.title,
      long_desc: product.story,
      images: [product.image]
    },
    price: {
      currency: 'INR',
      value: String(product.price || product.suggestedPrice)
    },
    category_id: product.category,
    fulfillment_id: 'standard-delivery',
    tags: [
      { code: 'gi_certified', value: String(Boolean(product.giCertified)) },
      { code: 'gi_tag_number', value: product.giTagNumber || 'N/A' },
      { code: 'trust_badge', value: product.trustBadge },
      { code: 'pm_vishwakarma_id', value: product.artisan?.pmVishwakarmaId || 'PMV-GEN' },
      { code: 'craft_origin', value: `${product.artisan?.region}, ${product.artisan?.state}` }
    ]
  };
}
