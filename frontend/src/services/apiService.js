/**
 * API Service for Smart Artisan Companion (SIH26090)
 * Connects frontend directly to FastAPI + SQLite Database backend (Port 8000).
 * Implements offline-first fallback to catalogueData.js when database is offline.
 */

import { INITIAL_CATALOGUE } from '../data/catalogueData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Normalize database product schema into frontend attributes
 */
export function normalizeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    id: p.id || p.sku || `prod-${Date.now()}`,
    sku: p.sku || 'ART-CRAFT-001',
    title: p.title || 'Handcrafted Artisan Product',
    category: p.category || 'Pottery & Terracotta',
    craftStyle: p.craft_style || p.craftStyle || 'Traditional Handmade',
    material: p.material || 'Authentic Regional Materials',
    dimensions: p.dimensions || '25cm x 15cm x 10cm',
    weight: p.weight || (p.weight_grams ? `${p.weight_grams}g` : '650g'),
    price: Number(p.suggested_price || p.price || 1500),
    suggestedPrice: Number(p.suggested_price || p.suggestedPrice || p.price || 1500),
    rawCost: Number(p.raw_material_cost || p.rawCost || 160),
    laborHours: Number(p.labor_hours || p.laborHours || 8),
    ondcPublished: Boolean(p.ondc_published ?? p.ondcPublished ?? true),
    giCertified: Boolean(p.gi_certified ?? p.giCertified ?? true),
    image: p.image_url || p.image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    trustBadge: p.trust_badge || p.trustBadge || 'Artisan Verified (PM Vishwakarma)',
    syncedWithDb: true
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
 * Save new product to Database (POST /api/v1/products)
 */
export async function saveProductToDatabase(productPayload) {
  try {
    const weightVal = parseFloat(String(productPayload.weight || '500').replace(/[^\d.]/g, '')) || 500;
    const bodyPayload = {
      title: productPayload.title,
      description: productPayload.description || `Authentic ${productPayload.category} handcrafted by Indian rural artisan.`,
      category: productPayload.category || 'Pottery & Terracotta',
      craft_style: productPayload.craftStyle || productPayload.craft_style || 'Traditional Handmade',
      material: productPayload.material || 'Authentic Regional Materials',
      dimensions: productPayload.dimensions || '25cm x 15cm x 10cm',
      weight_grams: weightVal,
      raw_material_cost: Number(productPayload.rawCost || productPayload.raw_material_cost || 160),
      labor_hours: Number(productPayload.laborHours || productPayload.labor_hours || 8),
      price: Number(productPayload.price || productPayload.suggested_price || 1500),
      image_url: productPayload.image || productPayload.image_url,
      artisan_name: productPayload.artisanName || 'Master Artisan',
      region: productPayload.region || 'India',
      ondc_published: Boolean(productPayload.ondcPublished ?? productPayload.ondc_published ?? true),
      gi_certified: Boolean(productPayload.giCertified ?? productPayload.gi_certified ?? true)
    };

    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
      signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP error ${res.status}: ${errText}`);
    }
    const saved = await res.json();
    return { success: true, product: normalizeProduct(saved), synced: true };
  } catch (err) {
    console.warn('[Offline Queue] Database unreachable, saving locally to offline sync queue:', err.message);
    
    try {
      const offlineQueue = JSON.parse(localStorage.getItem('artisan_offline_queue') || '[]');
      offlineQueue.push({ ...productPayload, queuedAt: new Date().toISOString() });
      localStorage.setItem('artisan_offline_queue', JSON.stringify(offlineQueue));
    } catch (_) {}

    return { success: true, product: normalizeProduct(productPayload), synced: false };
  }
}

/**
 * Update an existing product in Database (PUT /api/v1/products/{id})
 */
export async function updateProductInDatabase(productId, updatedData) {
  try {
    const numId = typeof productId === 'number' ? productId : parseInt(String(productId).replace(/[^\d]/g, ''), 10);
    if (!numId) return null;

    const bodyPayload = {
      title: updatedData.title,
      category: updatedData.category,
      craft_style: updatedData.craftStyle || updatedData.craft_style,
      material: updatedData.material,
      dimensions: updatedData.dimensions,
      raw_material_cost: Number(updatedData.rawCost || updatedData.raw_material_cost),
      labor_hours: Number(updatedData.laborHours || updatedData.labor_hours),
      price: Number(updatedData.price || updatedData.suggested_price),
      image_url: updatedData.image || updatedData.image_url,
      ondc_published: Boolean(updatedData.ondcPublished ?? updatedData.ondc_published)
    };

    const res = await fetch(`${API_BASE_URL}/products/${numId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeProduct(data);
  } catch (err) {
    console.warn('[Offline Mode] Could not update product in DB:', err.message);
    return null;
  }
}

/**
 * Delete a product from Database (DELETE /api/v1/products/{id})
 */
export async function deleteProductFromDatabase(productId) {
  try {
    const numId = typeof productId === 'number' ? productId : parseInt(String(productId).replace(/[^\d]/g, ''), 10);
    if (!numId) return { success: false };

    const res = await fetch(`${API_BASE_URL}/products/${numId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000)
    });
    return await res.json();
  } catch (err) {
    console.warn('[Offline Mode] Could not delete product from DB:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Toggle ONDC publish status in Database (PATCH /api/v1/products/{id}/ondc)
 */
export async function toggleProductOndcInDatabase(productId, ondcPublished) {
  try {
    const numId = typeof productId === 'number' ? productId : parseInt(String(productId).replace(/[^\d]/g, ''), 10);
    if (!numId) return null;

    const res = await fetch(`${API_BASE_URL}/products/${numId}/ondc`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ondcPublished }),
      signal: AbortSignal.timeout(3000)
    });
    return await res.json();
  } catch (err) {
    console.warn('[Offline Mode] Could not toggle ONDC status in DB:', err.message);
    return null;
  }
}

/**
 * Process vernacular speech via backend BHASHINI / Whisper AI engine (POST /api/v1/voice/process)
 */
export async function processVoicePrompt({ audioBase64, language, sampleText }) {
  try {
    const res = await fetch(`${API_BASE_URL}/voice/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_base64: audioBase64 || null,
        language: language || 'hi-IN',
        sample_text: sampleText || null
      }),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Voice Service] Backend unreachable or timeout, using edge extraction:', err.message);
    return null;
  }
}
