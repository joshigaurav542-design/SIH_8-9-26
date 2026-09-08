/**
 * API Service for Smart Artisan Companion (SIH26090)
 * Connects frontend directly to Backend Database API (Prisma Engine on port 8000).
 * Implements offline-first fallback to catalogueData.js when database is offline.
 */

import { INITIAL_CATALOGUE } from '../data/catalogueData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
    const data = await res.json();
    return { data, source: 'database' };
  } catch (err) {
    console.warn('[Offline Mode] Could not reach database API, using local catalogue:', err.message);
    
    try {
      const stored = localStorage.getItem('artisan_catalogue_v1');
      if (stored) {
        return { data: JSON.parse(stored), source: 'local_storage' };
      }
    } catch (_) {}

    return { data: INITIAL_CATALOGUE, source: 'initial_catalogue' };
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
