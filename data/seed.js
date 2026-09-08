import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database via Prisma...');

  // 1. Create or upsert Master Artisan
  const artisan = await prisma.artisan.upsert({
    where: { artisanId: 'PM-VISH-2026-098' },
    update: {},
    create: {
      artisanId: 'PM-VISH-2026-098',
      name: 'Ramprasad Prajapati',
      craftType: 'Pottery & Terracotta',
      region: 'Gorakhpur / Varanasi, Uttar Pradesh',
      dialect: 'hi-IN',
      skillLevel: 'MASTER_ARTISAN',
      hourlyRate: 145.0,
      pmVishwakarmaId: 'PMV-UP-249018',
      phone: '+91 98765 43210'
    }
  });
  console.log(`✅ Master Artisan created: ${artisan.name} (${artisan.artisanId})`);

  // 2. Upsert Sample Products
  const productsData = [
    {
      sku: 'ART-TERRA-001',
      title: 'Gorakhpur GI-Tagged Terracotta Floral Urn',
      description: 'Handcrafted terracotta urn fired with natural organic husks using traditional techniques.',
      category: 'Pottery & Terracotta',
      craftStyle: 'Kiln-Fired Terracotta',
      material: 'Riverbed Alluvial Clay (Mati)',
      dimensions: '32cm x 20cm x 20cm',
      weightGrams: 1200.0,
      symmetryScore: 96.4,
      densityScore: 94.1,
      trustBadge: 'Masterpiece Grade A+ (GI Certified)',
      rawMaterialCost: 160.0,
      laborHours: 9.0,
      fairLaborCost: 1449.0,
      suggestedPrice: 1930.0,
      imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      ondcPublished: true,
      whatsappSync: true,
      artisanId: artisan.id
    },
    {
      sku: 'ART-SILK-002',
      title: 'Varanasi Royal Katan Silk Shawl with Zari',
      description: 'Authentic Banarasi handloom woven with silver zari motifs.',
      category: 'Handloom & Silk',
      craftStyle: 'Traditional Banarasi Handloom',
      material: 'Mulberry Silk with Silver-Plated Zari Brocade',
      dimensions: '2.4m x 0.9m',
      weightGrams: 350.0,
      symmetryScore: 98.1,
      densityScore: 96.5,
      trustBadge: 'National Heritage Masterpiece',
      rawMaterialCost: 1200.0,
      laborHours: 32.0,
      fairLaborCost: 5152.0,
      suggestedPrice: 8450.0,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      ondcPublished: true,
      whatsappSync: true,
      artisanId: artisan.id
    },
    {
      sku: 'ART-DHOK-003',
      title: 'Bastar Lost-Wax Bell Metal Figurine (Dhokra Art)',
      description: 'Indigenous lost-wax metal casting crafted by tribal artisans.',
      category: 'Bell Metal Casting',
      craftStyle: 'Indigenous Lost-Wax Dhokra',
      material: 'Bell Metal Bronze & Beeswax Core',
      dimensions: '25cm x 12cm x 9cm',
      weightGrams: 850.0,
      symmetryScore: 94.8,
      densityScore: 93.2,
      trustBadge: 'Heritage Certified Grade A',
      rawMaterialCost: 450.0,
      laborHours: 14.0,
      fairLaborCost: 2030.0,
      suggestedPrice: 3200.0,
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      ondcPublished: true,
      whatsappSync: true,
      artisanId: artisan.id
    },
    {
      sku: 'ART-WOOD-004',
      title: 'Channapatna Organic Lacquerware Toy Ensemble',
      description: 'Lathe-turned natural ivory wood crafted using non-toxic organic vegetable dyes.',
      category: 'Woodcraft & Lacquer',
      craftStyle: 'Lathe-Turned Ivory Wood',
      material: 'Wrightia Tinctoria Wood & Vegetable Dyes',
      dimensions: '18cm x 15cm x 10cm',
      weightGrams: 400.0,
      symmetryScore: 97.2,
      densityScore: 95.8,
      trustBadge: 'GI Tagged Heritage Toy',
      rawMaterialCost: 180.0,
      laborHours: 6.0,
      fairLaborCost: 870.0,
      suggestedPrice: 1450.0,
      imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      ondcPublished: false,
      whatsappSync: false,
      artisanId: artisan.id
    }
  ];

  for (const prod of productsData) {
    const created = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod
    });
    console.log(`✅ Product created: ${created.title} (${created.sku})`);
  }

  // 3. Create Sample Authenticity Certificate for Terracotta product
  const terraProduct = await prisma.product.findUnique({ where: { sku: 'ART-TERRA-001' } });
  if (terraProduct) {
    await prisma.authenticityCertificate.upsert({
      where: { certificateId: 'CERT-GI-2026-9012' },
      update: {},
      create: {
        certificateId: 'CERT-GI-2026-9012',
        giCertified: true,
        giTagNumber: 'GI-IN-564',
        trustLevel: 'Heritage Masterpiece Grade A+',
        verificationHash: '0x8f2d91bc43a789ef1240ad8192a54b391789c0de',
        artisanId: artisan.id,
        productId: terraProduct.id
      }
    });
    console.log('✅ Authenticity Certificate seeded');
  }

  // 4. Create Sample Order
  const sampleOrder = await prisma.order.upsert({
    where: { orderNumber: 'ORD-2026-8801' },
    update: {},
    create: {
      orderNumber: 'ORD-2026-8801',
      customerName: 'Ananya Sharma',
      customerPhone: '+91 99887 76655',
      shippingAddress: 'Flat 402, Heritage Residency, Indiranagar, Bengaluru, Karnataka 560038',
      totalAmount: 1930.0,
      paymentMethod: 'UPI (Paytm ONDC)',
      status: 'CONFIRMED',
      items: {
        create: [
          {
            productId: terraProduct.id,
            quantity: 1,
            unitPrice: 1930.0
          }
        ]
      }
    }
  });
  console.log(`✅ Sample Order seeded: ${sampleOrder.orderNumber}`);

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
