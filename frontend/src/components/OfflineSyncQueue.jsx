import React, { useState, useEffect } from 'react';
import { Database, CloudUpload, CheckCircle, RefreshCw, Smartphone, AlertCircle, Trash2, Check } from 'lucide-react';
import { getEdgeSqliteQueue, syncEdgeSqliteToMainDatabase, clearEdgeSqliteQueue } from '../services/apiService';

export default function OfflineSyncQueue({ isOnline, onSyncComplete }) {
  const [queue, setQueue] = useState(() => getEdgeSqliteQueue());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  // Synchronize queue from local Edge SQLite storage and listen for real-time changes
  const refreshQueue = () => {
    const current = getEdgeSqliteQueue();
    setQueue(current);
  };

  useEffect(() => {
    refreshQueue();

    const handleUpdate = () => refreshQueue();
    const handleSynced = (e) => {
      refreshQueue();
      if (e.detail?.syncedCount > 0) {
        setSyncFeedback(`Successfully flushed & uploaded ${e.detail.syncedCount} item(s) to Main Database!`);
        setTimeout(() => setSyncFeedback(null), 4000);
      }
    };

    window.addEventListener('edge_sqlite_updated', handleUpdate);
    window.addEventListener('edge_sqlite_synced', handleSynced);

    return () => {
      window.removeEventListener('edge_sqlite_updated', handleUpdate);
      window.removeEventListener('edge_sqlite_synced', handleSynced);
    };
  }, []);

  // Automatic sync flush when network/internet connection is detected
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      console.log('[Edge Offline-First SQLite Sync] Network detected: Auto-flushing pending records to Main Database...');
      handleSync();
    }
  }, [isOnline, queue.length]);

  const handleSync = async () => {
    if (!isOnline) {
      alert('Network is currently in Offline mode. Please toggle to "Online (Cloud Sync)" in the top navigation bar.');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncEdgeSqliteToMainDatabase();
      refreshQueue();
      if (result && result.count > 0) {
        setSyncFeedback(`Successfully uploaded ${result.count} offline product(s) to Main Database!`);
        setTimeout(() => setSyncFeedback(null), 5000);
      }
      if (onSyncComplete) onSyncComplete(result);
    } catch (err) {
      console.error('Manual SQLite sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear pending local SQLite queue?')) {
      clearEdgeSqliteQueue();
      refreshQueue();
    }
  };

  return (
    <div className="glass-panel p-5 relative overflow-hidden">
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[var(--color-saffron)]" />
          <h2 className="text-base font-bold text-white font-heading">
            Edge Offline-First SQLite Sync
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
            queue.length > 0
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }`}>
            {queue.length} Pending Local Records
          </span>
          {queue.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-rose-400 p-1 text-xs"
              title="Clear queue"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)] mb-4">
        Deep rural handicraft clusters often suffer from patchy 2G/3G connectivity. When in Offline mode, all new products are safely saved directly in the local Edge SQLite database with zero data loss, and automatically upload to the main database & ONDC as soon as network/internet is detected.
      </p>

      {/* Sync Success Feedback Banner */}
      {syncFeedback && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Queue List */}
      {queue.length > 0 ? (
        <div className="space-y-2 mb-4">
          {queue.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-black/30 border border-[var(--border-glass)] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-semibold text-white">{item.title}</div>
                  <div className="text-[10px] text-gray-400">
                    {item.sku} • {item.timestamp} • {item.size}
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                {item.status || 'Queued in SQLite (Offline)'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-center mb-4">
          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-emerald-300">
            All Local Records Synced to Cloud & ONDC
          </p>
          <p className="text-[10px] text-gray-400">Local Edge SQLite database is clean and completely synchronized with the main database.</p>
        </div>
      )}

      {/* Sync Trigger Action Row */}
      {queue.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          {!isOnline ? (
            <div className="text-[11px] text-amber-400 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Offline mode active: Switch to "Online" in top bar to auto-upload to main database.</span>
            </div>
          ) : (
            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>Network detected: Auto-syncing SQLite records with Main Database...</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing || !isOnline}
            className={`btn-primary px-4 py-2 text-xs flex items-center gap-1.5 ml-auto cursor-pointer ${
              !isOnline ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <CloudUpload className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
            <span>{isSyncing ? 'Uploading to Main Database...' : 'Flush & Sync Queue Now'}</span>
          </button>
        </div>
      )}

    </div>
  );
}
