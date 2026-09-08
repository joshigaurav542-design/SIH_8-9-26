// Initial catalogue sample data and pricing helper for KalaSetu ONDC Platform

export const INITIAL_CATALOGUE = [
  {
    id: 'prod-1',
    sku: 'ART-TERRA-001',
    title: 'Gorakhpur GI-Tagged Terracotta Floral Urn',
    category: 'Pottery & Terracotta',
    craftStyle: 'Hand-thrown Alluvial Clay',
    material: 'Natural Riverbed Clay with Organic Husk Glaze',
    dimensions: '32cm (H) x 20cm (W)',
    weight: '1,200g',
    rawCost: 160,
    laborHours: 9,
    price: 1930,
    ondcPublished: true,
    giCertified: true,
    trustBadge: 'Masterpiece Grade A+ (GI Certified)',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    dateAdded: '2026-09-01'
  },
  {
    id: 'prod-2',
    sku: 'ART-SILK-002',
    title: 'Varanasi Royal Katan Silk Shawl with Zari',
    category: 'Handloom & Silk',
    craftStyle: 'Traditional Banarasi Handloom',
    material: 'Mulberry Silk with Silver-Plated Zari Brocade',
    dimensions: '2.4m x 0.9m',
    weight: '350g',
    rawCost: 1200,
    laborHours: 32,
    price: 8450,
    ondcPublished: true,
    giCertified: true,
    trustBadge: 'National Heritage Masterpiece',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    dateAdded: '2026-09-03'
  },
  {
    id: 'prod-3',
    sku: 'ART-DHOK-003',
    title: 'Bastar Lost-Wax Bell Metal Figurine (Dhokra Art)',
    category: 'Bell Metal Casting',
    craftStyle: 'Indigenous Lost-Wax Dhokra',
    material: 'Bell Metal Bronze & Beeswax Core',
    dimensions: '25cm x 12cm x 9cm',
    weight: '850g',
    rawCost: 450,
    laborHours: 14,
    price: 3200,
    ondcPublished: true,
    giCertified: true,
    trustBadge: 'Heritage Certified Grade A',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    dateAdded: '2026-09-05'
  },
  {
    id: 'prod-4',
    sku: 'ART-WOOD-004',
    title: 'Channapatna Organic Lacquerware Toy Ensemble',
    category: 'Woodcraft & Lacquer',
    craftStyle: 'Lathe-Turned Ivory Wood',
    material: 'Wrightia Tinctoria Wood & Vegetable Dyes',
    dimensions: '18cm x 15cm x 10cm',
    weight: '400g',
    rawCost: 180,
    laborHours: 6,
    price: 1450,
    ondcPublished: false,
    giCertified: true,
    trustBadge: 'GI Tagged Heritage Toy',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
    dateAdded: '2026-09-07'
  }
];

export function getSuggestedPrice(product) {
  if (!product) return 1500;
  if (product.suggestedPrice) return Math.round(Number(product.suggestedPrice));
  const raw = Number(product.rawCost) || 160;
  const hours = Number(product.laborHours) || 8;
  // Algorithmic Living Wage benchmark: Material + Labor (₹145/hr) + 25% Master Artisan margin
  return Math.round((raw + hours * 145) * 1.25);
}
