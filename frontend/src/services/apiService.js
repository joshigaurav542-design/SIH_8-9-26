/**
 * API Service for Smart Artisan Companion (SIH26090)
 * Connects frontend directly to FastAPI + SQLite Database backend (Port 8000).
 * Implements offline-first fallback to catalogueData.js when database is offline.
 */

import { INITIAL_CATALOGUE } from '../data/catalogueData';

const rawBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').trim();
const API_BASE_URL = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api/v1`;

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
    giCertified: Boolean(p.gi_certified ?? p.giCertified ?? false),
    image: p.image_url || p.image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    trustBadge: p.trust_badge || p.trustBadge || 'Artisan Verified (PM Vishwakarma)',
    syncedWithDb: p.syncedWithDb !== undefined ? Boolean(p.syncedWithDb) : (p.offlineQueued ? false : true),
    offlineQueued: Boolean(p.offlineQueued || p.syncedWithDb === false),
    syncStatus: (p.offlineQueued || p.syncedWithDb === false) ? 'Queued in SQLite (Offline)' : 'Live on Main Database'
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

const QUEUE_STORAGE_KEY = 'artisan_offline_sync_queue';
const EDGE_SQLITE_STORAGE_KEY = 'artisan_edge_sqlite_db';

/**
 * Get all pending items queued in the local Edge SQLite database
 */
export function getEdgeSqliteQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read Edge SQLite queue:', err);
    return [];
  }
}

/**
 * Save product to Edge SQLite database when offline
 */
export function saveToEdgeSqlite(productPayload) {
  try {
    const queue = getEdgeSqliteQueue();
    const localId = productPayload.id || `sqlite-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const weightVal = parseFloat(String(productPayload.weight || '500').replace(/[^\d.]/g, '')) || 500;
    
    const queuedItem = {
      id: localId,
      title: productPayload.title || 'Handcrafted Craft Item',
      sku: productPayload.sku || `ART-SQLITE-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Just now',
      queuedAt: new Date().toISOString(),
      size: `${((JSON.stringify(productPayload).length / 1024) + 0.5).toFixed(1)} KB`,
      status: 'Queued in SQLite (Offline)',
      action: 'CREATE_PRODUCT',
      data: {
        ...productPayload,
        id: localId,
        weight_grams: weightVal,
        syncedWithDb: false,
        offlineQueued: true,
        syncStatus: 'Queued in SQLite (Offline)'
      }
    };

    // Prepend to queue without duplicate IDs
    const filtered = queue.filter(q => q.id !== localId && q.data?.title !== productPayload.title);
    filtered.unshift(queuedItem);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filtered));

    // Also persist into edge sqlite table store
    try {
      const edgeDb = JSON.parse(localStorage.getItem(EDGE_SQLITE_STORAGE_KEY) || '[]');
      const filteredDb = edgeDb.filter(p => p.id !== localId && p.title !== productPayload.title);
      filteredDb.unshift(queuedItem.data);
      localStorage.setItem(EDGE_SQLITE_STORAGE_KEY, JSON.stringify(filteredDb));
    } catch (_) {}

    // Dispatch update event for real-time reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('edge_sqlite_updated', {
        detail: { queueLength: filtered.length, lastAdded: queuedItem }
      }));
    }

    return queuedItem;
  } catch (err) {
    console.error('Failed to save to Edge SQLite:', err);
    return null;
  }
}

/**
 * Flush and upload all Edge SQLite pending records to Main Database (when network is detected)
 */
export async function syncEdgeSqliteToMainDatabase() {
  const queue = getEdgeSqliteQueue();
  if (!queue || queue.length === 0) {
    return { success: true, count: 0, syncedProducts: [] };
  }

  const syncedProducts = [];
  const remainingQueue = [];

  for (const item of queue) {
    try {
      const prod = item.data || item;
      const weightVal = parseFloat(String(prod.weight || prod.weight_grams || '500').replace(/[^\d.]/g, '')) || 500;
      const bodyPayload = {
        title: prod.title,
        description: prod.description || `Authentic ${prod.category} handcrafted by Indian rural artisan.`,
        category: prod.category || 'Pottery & Terracotta',
        craft_style: prod.craftStyle || prod.craft_style || 'Traditional Handmade',
        material: prod.material || 'Authentic Regional Materials',
        dimensions: prod.dimensions || '25cm x 15cm x 10cm',
        weight_grams: weightVal,
        raw_material_cost: Number(prod.rawCost || prod.raw_material_cost || 160),
        labor_hours: Number(prod.laborHours || prod.labor_hours || 8),
        price: Number(prod.price || prod.suggested_price || 1500),
        image_url: prod.image || prod.image_url,
        artisan_name: prod.artisanName || 'Master Artisan',
        region: prod.region || 'India',
        ondc_published: Boolean(prod.ondcPublished ?? prod.ondc_published ?? true),
        gi_certified: Boolean(prod.giCertified ?? prod.gi_certified ?? false)
      };

      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
        signal: AbortSignal.timeout(4000)
      });

      if (res.ok) {
        const saved = await res.json();
        const normalized = normalizeProduct(saved);
        syncedProducts.push({ originalId: item.id, synced: normalized });
      } else {
        remainingQueue.push(item);
      }
    } catch (err) {
      console.warn(`[Sync Failed for ${item.title}]:`, err.message);
      remainingQueue.push(item);
    }
  }

  // Update local queue storage
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remainingQueue));

  // Log batch sync event with backend /sync/batch
  try {
    if (syncedProducts.length > 0) {
      await fetch(`${API_BASE_URL}/sync/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: 'EDGE-DEVICE-VISHWAKARMA-01',
          pending_items: syncedProducts.map(sp => ({
            client_id: String(sp.originalId),
            timestamp: new Date().toISOString(),
            action: 'CREATE_PRODUCT',
            data: sp.synced
          }))
        }),
        signal: AbortSignal.timeout(3000)
      });
    }
  } catch (_) {}

  // Dispatch global events so Catalogue & OfflineSyncQueue update instantly
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('edge_sqlite_synced', {
      detail: {
        syncedCount: syncedProducts.length,
        syncedProducts: syncedProducts.map(s => s.synced),
        remainingCount: remainingQueue.length
      }
    }));
    window.dispatchEvent(new CustomEvent('edge_sqlite_updated', {
      detail: { queueLength: remainingQueue.length }
    }));
  }

  return {
    success: true,
    count: syncedProducts.length,
    remaining: remainingQueue.length,
    syncedProducts: syncedProducts.map(s => s.synced)
  };
}

/**
 * Clear Edge SQLite Queue manually
 */
export function clearEdgeSqliteQueue() {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('edge_sqlite_updated', { detail: { queueLength: 0 } }));
  }
}

/**
 * Save new product with Edge Offline-First SQLite Sync
 * - When Offline: writes directly to local Edge SQLite database and queue (zero latency)
 * - When Online: uploads directly to Main Database (FastAPI SQLite backend)
 */
export async function saveProductToDatabase(productPayload, isOnline = true) {
  // 1. OFFLINE MODE: Store directly in Edge SQLite database
  if (isOnline === false || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    console.info('[Edge SQLite] Offline mode active: writing new product to local SQLite database');
    const queuedItem = saveToEdgeSqlite(productPayload);
    const offlineProd = normalizeProduct({
      ...productPayload,
      id: queuedItem?.id || productPayload.id || `sqlite-local-${Date.now()}`,
      syncedWithDb: false,
      offlineQueued: true
    });
    return { success: true, product: offlineProd, synced: false, source: 'edge_sqlite' };
  }

  // 2. ONLINE MODE: Upload directly to Main Database
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
      gi_certified: Boolean(productPayload.giCertified ?? productPayload.gi_certified ?? false)
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
    return { success: true, product: normalizeProduct(saved), synced: true, source: 'main_database' };
  } catch (err) {
    console.warn('[Offline Fallback] Main database unreachable, saving to Edge SQLite:', err.message);
    const queuedItem = saveToEdgeSqlite(productPayload);
    const offlineProd = normalizeProduct({
      ...productPayload,
      id: queuedItem?.id || productPayload.id || `sqlite-local-${Date.now()}`,
      syncedWithDb: false,
      offlineQueued: true
    });
    return { success: true, product: offlineProd, synced: false, source: 'edge_sqlite' };
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
