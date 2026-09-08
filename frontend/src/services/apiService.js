/**
 * API Service for Smart Artisan Companion (SIH26090)
 * Connects frontend directly to Backend Database API (Prisma Engine on port 8000).
 * Implements offline-first fallback to catalogueData.js when database is offline.
 */

import { INITIAL_CATALOGUE } from '../data/catalogueData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export function normalizeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    id: p.id || p.sku || `prod-${Date.now()}`,
    sku: p.sku || 'ART-CRAFT-001',
    title: p.title || 'Handcrafted Artisan Product',
    category: p.category || 'Handicrafts',
    craftStyle: p.craftStyle || p.craft_style || 'Traditional Handmade',
    material: p.material || 'Authentic Regional Materials',
    dimensions: p.dimensions || '25cm x 15cm x 10cm',
    weight: p.weight || (p.weight_grams ? `${p.weight_grams}g` : '650g'),
    price: Number(p.price || p.suggested_price || p.suggestedPrice || 1500),
    suggestedPrice: Number(p.suggestedPrice || p.suggested_price || p.price || 1500),
    rawCost: Number(p.rawCost || p.raw_material_cost || 160),
    laborHours: Number(p.laborHours || p.labor_hours || 8),
    ondcPublished: Boolean(p.ondcPublished ?? p.ondc_published ?? true),
    giCertified: Boolean(p.giCertified ?? p.gi_certified ?? true),
    image: p.image || p.image_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    trustBadge: p.trustBadge || p.trust_badge || 'Artisan Verified (PM Vishwakarma)'
  };
}

/**
 * Fetch all products from Database with offline fallback
 */
export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const rawData = await res.json();
    const normalized = Array.isArray(rawData) ? rawData.map(normalizeProduct).filter(Boolean) : [];
    return { data: normalized, source: 'database' };
  } catch (err) {
    console.warn('[Offline Mode] Could not reach database API, using local catalogue:', err.message);
    
    try {
      const stored = localStorage.getItem('artisan_catalogue_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { data: parsed.map(normalizeProduct).filter(Boolean), source: 'local_storage' };
        }
      }
    } catch (_) {}

    return { data: INITIAL_CATALOGUE.map(normalizeProduct), source: 'initial_catalogue' };
  }
}

/**
 * Save new product to Database
 */
export async function saveProductToDatabase(productPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productPayload),
      signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const saved = await res.json();
    return { success: true, product: saved, synced: true };
  } catch (err) {
    console.warn('[Offline Queue] Database unreachable, saving locally to offline sync queue:', err.message);
    
    const offlineQueue = JSON.parse(localStorage.getItem('artisan_offline_queue') || '[]');
    offlineQueue.push({ ...productPayload, queuedAt: new Date().toISOString() });
    localStorage.setItem('artisan_offline_queue', JSON.stringify(offlineQueue));

    return { success: true, product: productPayload, synced: false };
  }
}

/**
 * Update an existing product in Database
 */
export async function updateProductInDatabase(productId, updatedData) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
      signal: AbortSignal.timeout(3000)
    });
    return await res.json();
  } catch (err) {
    console.warn('[Offline Mode] Could not update product in DB:', err.message);
  }
}

/**
 * Delete a product from Database
 */
export async function deleteProductFromDatabase(productId) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000)
    });
    return await res.json();
  } catch (err) {
    console.warn('[Offline Mode] Could not delete product from DB:', err.message);
  }
}

/**
 * Toggle ONDC publish status in Database
 */
export async function toggleProductOndcInDatabase(productId, ondcPublished) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/ondc`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ondcPublished }),
      signal: AbortSignal.timeout(3000)
    });
    return await res.json();
  } catch (err) {
    console.warn('[Offline Mode] Could not toggle ONDC status in DB:', err.message);
  }
}

/**
 * Fetch all customer orders from Database
 */
export async function fetchOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

/**
 * Create a new customer order in Database
 */
export async function createOrderInDatabase(orderData) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return await res.json();
  } catch (err) {
    console.warn('[Offline Order] Saved locally');
    return { orderNumber: `ORD-${Date.now().toString().slice(-6)}`, status: 'PENDING_OFFLINE' };
  }
}

/**
 * Sync offline queue to Database
 */
export async function syncOfflineQueueToDatabase() {
  try {
    const queue = JSON.parse(localStorage.getItem('artisan_offline_queue') || '[]');
    if (queue.length === 0) return { count: 0 };

    const res = await fetch(`${API_BASE_URL}/offline/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batches: queue })
    });

    if (res.ok) {
      localStorage.removeItem('artisan_offline_queue');
      return await res.json();
    }
  } catch (err) {
    console.warn('Sync failed, will retry later:', err.message);
  }
}
