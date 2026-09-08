import React, { useState } from 'react';
import { Database, CloudUpload, CheckCircle, RefreshCw, Smartphone, AlertCircle } from 'lucide-react';

export default function OfflineSyncQueue({ isOnline, pendingCount = 2, onSyncComplete }) {
  const [queue, setQueue] = useState([
    { id: 'SYNC-01', title: 'Terracotta Urn #4', timestamp: '10 mins ago', size: '1.4 MB', status: 'Queued in SQLite' },
    { id: 'SYNC-02', title: 'Banarasi Zari Border Note', timestamp: '4 mins ago', size: '480 KB', status: 'Queued in SQLite' }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    if (!isOnline) {
      alert('Network is currently in Offline mode. Please toggle to Online mode in the top right corner first.');
      return;
    }

    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setQueue([]);
      if (onSyncComplete) onSyncComplete();
    }, 2000);
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
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
          queue.length > 0
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        }`}>
          {queue.length} Pending Local Records
        </span>
      </div>

      <p className="text-xs text-[var(--text-muted)] mb-4">
        Deep rural handicraft clusters often suffer from patchy 2G/3G connectivity. All vision scans, speech notes, and price calculations are stored in local device SQLite and automatically flush to the cloud when network is detected.
      </p>

      {/* Queue List */}
      {queue.length > 0 ? (
        <div className="space-y-2 mb-4">
          {queue.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-black/30 border border-[var(--border-glass)] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="font-semibold text-white">{item.title}</div>
                  <div className="text-[10px] text-gray-400">{item.timestamp} • {item.size}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {item.status}
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
          <p className="text-[10px] text-gray-400">Zero data loss guaranteed in zero-internet zones.</p>
        </div>
      )}

      {/* Sync Trigger */}
      {queue.length > 0 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          {!isOnline && (
            <div className="text-[11px] text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Offline mode: Turn online in navbar to push sync.
            </div>
          )}

          <button
            onClick={handleSync}
            disabled={isSyncing || !isOnline}
            className={`btn-primary px-4 py-2 text-xs flex items-center gap-1.5 ml-auto ${
              !isOnline ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <CloudUpload className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
            <span>{isSyncing ? 'Synchronizing SQLite...' : 'Flush & Sync Queue Now'}</span>
          </button>
        </div>
      )}

    </div>
  );
}
