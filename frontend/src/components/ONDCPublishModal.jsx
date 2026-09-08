import React, { useState } from 'react';
import { Send, CheckCircle2, ShoppingBag, MessageSquare, ExternalLink, Globe, Sparkles, RefreshCw } from 'lucide-react';

export default function ONDCPublishModal({ product, isOnline, onPublishSuccess }) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedData, setPublishedData] = useState(null);

  const handlePublish = () => {
    setIsPublishing(true);

    setTimeout(() => {
      setIsPublishing(false);
      const res = {
        bppId: 'artisan-bpp.brocode.sih.in',
        itemId: `ITEM-${product?.id || '901'}`,
        timestamp: new Date().toISOString(),
        channels: [
          { name: 'ONDC Open Network (Beckn Protocol)', status: 'ACTIVE', buyers: 'Paytm, Pincode, Mystore, Magicpin' },
          { name: 'WhatsApp Business Storefront', status: 'SYNCED', link: 'https://wa.me/p/waba-artisan-901' },
          { name: 'Tribal / Crafts Direct India', status: 'VERIFIED', badge: 'GI Trust Seal' }
        ]
      };
      setPublishedData(res);
      if (onPublishSuccess) onPublishSuccess(res);
    }, 1800);
  };

  return (
    <div className="glass-panel p-5 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[var(--color-terracotta)] text-white text-xs font-bold flex items-center justify-center">
            4
          </span>
          <h2 className="text-base font-bold text-white font-heading">
            ONDC & Multi-Channel Distribution (Direct Market Sync)
          </h2>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
          Beckn Protocol
        </span>
      </div>

      <p className="text-xs text-[var(--text-muted)] mb-4">
        Directly broadcasts the verified artisan catalog to India's national Open Network for Digital Commerce (ONDC) and syncs an automated WhatsApp conversational commerce storefront.
      </p>

      {/* Action / Trigger Box */}
      {!publishedData ? (
        <div className="p-4 rounded-2xl bg-black/30 border border-[var(--border-glass)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">
              Ready for National Market Launch
            </h4>
            <p className="text-xs text-gray-400">
              {isOnline
                ? 'Online sync enabled: Catalog will be indexed immediately across all ONDC buyer apps.'
                : 'Offline mode active: Listing will be safely queued in local SQLite and auto-synced once connected.'}
            </p>
          </div>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="btn-primary px-5 py-2.5 text-xs flex items-center gap-2 w-full sm:w-auto justify-center shrink-0"
          >
            {isPublishing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Broadcasting to ONDC...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publish Catalog Now</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Success State */
        <div className="space-y-4 animate-fadeIn">
          
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Catalog Successfully Published & Broadcasted</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">BPP ID: {publishedData.bppId}</span>
          </div>

          {/* Active Distribution Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            <div className="p-3 rounded-xl bg-black/30 border border-[var(--border-glass)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-400" /> ONDC National Network
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Discoverable across buyer apps: <strong>Paytm, Mystore, Pincode, Magicpin</strong> with zero middleman commissions.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-[var(--border-glass)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp Commerce
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                  SYNCED
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Conversational storefront created. Urban customers can chat and buy with 1-click UPI direct to the artisan's bank.
              </p>
            </div>

          </div>

          <div className="text-right">
            <button
              onClick={() => setPublishedData(null)}
              className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
            >
              Simulate Another Publication
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
