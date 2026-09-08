import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: 'Prisma + SQLite/Postgres',
    service: 'Smart Artisan Companion API'
  });
});

// ==========================================
// 1. PRODUCTS CRUD ENDPOINTS
// ==========================================

// GET /api/v1/products - Fetch all products
app.get('/api/v1/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { artisan: true, certificates: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products from database' });
  }
});

// POST /api/v1/products - Insert new product
app.post('/api/v1/products', async (req, res) => {
  try {
    const body = req.body;
    
    let artisan = await prisma.artisan.findFirst();
    if (!artisan) {
      artisan = await prisma.artisan.create({
        data: {
          artisanId: 'PM-VISH-2026-098',
          name: 'Ramprasad Prajapati',
          craftType: 'Pottery & Terracotta',
          region: 'Gorakhpur / Varanasi, Uttar Pradesh',
          dialect: 'hi-IN',
          skillLevel: 'MASTER_ARTISAN',
          hourlyRate: 145.0,
          pmVishwakarmaId: 'PMV-UP-249018'
        }
      });
    }

    const sku = body.sku || `ART-NEW-${Date.now().toString().slice(-4)}`;

    const newProduct = await prisma.product.create({
      data: {
        sku: sku,
        title: body.title || body.name || 'Handmade Artisan Craft',
        description: body.description || 'Authentic handcrafted heritage craft.',
        category: body.category || 'Handicraft',
        craftStyle: body.craftStyle || body.category || 'Traditional Handcrafted',
        material: body.material || 'Natural Regional Materials',
        dimensions: body.dimensions || '30cm x 20cm',
        weightGrams: parseFloat(body.weightGrams || body.weight || 800),
        symmetryScore: parseFloat(body.symmetryScore || 95.0),
        densityScore: parseFloat(body.densityScore || 93.0),
        trustBadge: body.trustBadge || 'Masterpiece Grade A+ (GI Certified)',
        rawMaterialCost: parseFloat(body.rawCost || body.rawMaterialCost || 160),
        laborHours: parseFloat(body.laborHours || 8),
        fairLaborCost: parseFloat(body.fairLaborCost || 1449),
        suggestedPrice: parseFloat(body.price || body.suggestedPrice || 1930),
        imageUrl: body.image || body.imageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
        ondcPublished: Boolean(body.ondcPublished ?? true),
        whatsappSync: Boolean(body.whatsappSync ?? true),
        artisanId: artisan.id
      }
    });

    console.log(`[DB Insert] Saved new product: ${newProduct.title} (${newProduct.sku})`);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error saving product to database:', err);
    res.status(500).json({ error: 'Failed to create product in database' });
  }
});

// PUT /api/v1/products/:id - Update product
app.put('/api/v1/products/:id', async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: body.title,
        category: body.category,
        craftStyle: body.craftStyle,
        material: body.material,
        dimensions: body.dimensions,
        suggestedPrice: body.price ? parseFloat(body.price) : undefined,
        rawMaterialCost: body.rawCost ? parseFloat(body.rawCost) : undefined,
        laborHours: body.laborHours ? parseFloat(body.laborHours) : undefined,
        ondcPublished: body.ondcPublished !== undefined ? Boolean(body.ondcPublished) : undefined,
        imageUrl: body.image || body.imageUrl
      }
    });
    res.json(updated);
  } catch (err) {
    // If not found by UUID, try by SKU or prod-id
    try {
      const bySku = await prisma.product.updateMany({
        where: { OR: [{ sku: id }, { sku: body.sku }] },
        data: {
          title: body.title,
          suggestedPrice: body.price ? parseFloat(body.price) : undefined
        }
      });
      res.json({ success: true, updatedCount: bySku.count });
    } catch (e) {
      res.status(404).json({ error: 'Product not found in database' });
    }
  }
});

// DELETE /api/v1/products/:id - Delete product
app.delete('/api/v1/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Deleted from database' });
  } catch (err) {
    try {
      await prisma.product.deleteMany({ where: { sku: id } });
      res.json({ success: true, message: 'Deleted by SKU' });
    } catch (e) {
      res.status(404).json({ error: 'Could not delete product' });
    }
  }
});

// PATCH /api/v1/products/:id/ondc - Toggle ONDC publication status
app.patch('/api/v1/products/:id/ondc', async (req, res) => {
  const { id } = req.params;
  const { ondcPublished } = req.body;
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }] }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: { ondcPublished: ondcPublished !== undefined ? Boolean(ondcPublished) : !product.ondcPublished }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ONDC status' });
  }
});

// ==========================================
// 2. ORDERS ENDPOINTS
// ==========================================

// GET /api/v1/orders - List all customer orders
app.get('/api/v1/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/v1/orders - Place order
app.post('/api/v1/orders', async (req, res) => {
  try {
    const { customerName, customerPhone, shippingAddress, totalAmount, paymentMethod, items } = req.body;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName || 'ONDC Buyer',
        customerPhone: customerPhone || '+91 98765 00000',
        shippingAddress: shippingAddress || 'Domestic Address, India',
        totalAmount: parseFloat(totalAmount || 1500),
        paymentMethod: paymentMethod || 'UPI (ONDC)',
        status: 'CONFIRMED'
      }
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ==========================================
// 3. CERTIFICATES & ARTISANS
// ==========================================

// GET /api/v1/certificates - List authenticity certificates
app.get('/api/v1/certificates', async (req, res) => {
  try {
    const certs = await prisma.authenticityCertificate.findMany({
      include: { product: true, artisan: true },
      orderBy: { issueDate: 'desc' }
    });
    res.json(certs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// GET /api/v1/artisans - Fetch all artisans
app.get('/api/v1/artisans', async (req, res) => {
  try {
    const artisans = await prisma.artisan.findMany({
      include: { products: true }
    });
    res.json(artisans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch artisans' });
  }
});

// ==========================================
// 4. OFFLINE SYNC LOGS
// ==========================================

// POST /api/v1/offline/sync - Sync queued offline operations into database
app.post('/api/v1/offline/sync', async (req, res) => {
  try {
    const { batches } = req.body;
    if (Array.isArray(batches) && batches.length > 0) {
      for (const batch of batches) {
        await prisma.offlineSyncLog.create({
          data: {
            batchId: `BATCH-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            operation: batch.operation || 'SYNC_BATCH',
            status: 'SYNCED',
            payload: JSON.stringify(batch),
            syncedAt: new Date()
          }
        });
      }
    }
    res.json({ status: 'SYNCED_SUCCESSFULLY', count: batches?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record offline sync' });
  }
});

// 5. Living wage calculation
app.post('/api/v1/pricing/calculate', (req, res) => {
  const { raw_material_cost = 160, labor_hours = 9, skill_level = 'Master Artisan', artisan_margin_percent = 20 } = req.body;
  const rates = { 'Apprentice': 90, 'Skilled': 135, 'Master Artisan': 145 };
  const hourlyRate = rates[skill_level] || 145;
  const complexityFactor = 1.25;
  const totalLaborCost = Math.round(labor_hours * hourlyRate * complexityFactor);
  const baseCost = raw_material_cost + totalLaborCost;
  const artisanProfit = Math.round(baseCost * (artisan_margin_percent / 100));
  const fairMarketPrice = baseCost + artisanProfit;
  const middlemanPayout = Math.round(raw_material_cost + (labor_hours * 45));
  const extraGain = Math.round(((fairMarketPrice - middlemanPayout) / Math.max(middlemanPayout, 1)) * 100);

  res.json({
    raw_material_cost,
    labor_hours,
    hourly_rate: hourlyRate,
    fair_labor_cost: totalLaborCost,
    fair_market_price: fairMarketPrice,
    artisan_extra_gain_percent: extraGain
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Database API Server running on http://localhost:${PORT}`);
  console.log(`📊 Connected to Prisma Database Engine (Full CRUD & Orders Active)`);
});
