import React, { useState } from 'react';
import { 
  Send, CheckCircle2, ShoppingBag, MessageSquare, ExternalLink, Globe, 
  Sparkles, RefreshCw, Package, Search, MapPin, Star, ShieldCheck, Heart, 
  Share2, Check, ArrowRight, Truck, Info, Copy, Smartphone, Eye, Code, 
  Award, ChevronRight, IndianRupee, QrCode, X, Clock, AlertCircle, ShoppingCart
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BUYER_APPS = [
  { id: 'mystore', name: 'Mystore Crafts', badge: 'ODOP Pavilion', color: 'from-blue-600 to-indigo-700', border: 'border-blue-500/40', text: 'text-blue-400' },
  { id: 'paytm', name: 'Paytm ONDC', badge: 'National Mall', color: 'from-cyan-600 to-blue-800', border: 'border-cyan-500/40', text: 'text-cyan-400' },
  { id: 'pincode', name: 'Pincode (PhonePe)', badge: 'Hyperlocal & Metro', color: 'from-purple-600 to-indigo-800', border: 'border-purple-500/40', text: 'text-purple-400' },
  { id: 'magicpin', name: 'Magicpin', badge: 'Direct Discovery', color: 'from-emerald-600 to-teal-800', border: 'border-emerald-500/40', text: 'text-emerald-400' }
];

export default function ONDCPublishModal({ 
  product, 
  pricing, 
  isOnline = true, 
  onPublishSuccess, 
  onViewCatalogue 
}) {
  const { t } = useLanguage();
  
  // Tab view inside ONDC Suite: 'replica' (Buyer View) | 'console' (Seller Broadcast) | 'beckn' (Protocol JSON)
  const [activeTab, setActiveTab] = useState('replica');
  const [selectedBuyerApp, setSelectedBuyerApp] = useState(BUYER_APPS[0]);
  const [pincode, setPincode] = useState('110001');
  const [isEditingPincode, setIsEditingPincode] = useState(false);
  const [tempPincode, setTempPincode] = useState('110001');
  
  // Simulated buyer interactions
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: review, 2: processing, 3: confirmed
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [copiedBeckn, setCopiedBeckn] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  
  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState(0); // 0 to 4 steps animation
  const [publishedData, setPublishedData] = useState({
    bppId: 'artisan-bpp.brocode.sih.in',
    bppUri: 'https://artisan-bpp.brocode.sih.in/protocol/v1',
    itemId: `ITEM-${product?.id || '901'}`,
    timestamp: new Date().toISOString(),
    channels: [
      { name: 'ONDC Open Network (Beckn Protocol)', status: 'ACTIVE', buyers: 'Paytm, Pincode, Mystore, Magicpin' },
      { name: 'WhatsApp Business Storefront', status: 'SYNCED', link: 'https://wa.me/p/waba-artisan-901' },
      { name: 'Tribal / Crafts Direct India', status: 'VERIFIED', badge: 'GI Trust Seal' }
    ]
  });

  const priceValue = pricing?.fairMarketPrice || product?.price || 1930;
  const retailComparisonPrice = Math.round(priceValue * 2.3);
  const savingsAmount = retailComparisonPrice - priceValue;
  const artisanName = product?.artisanName || "Ramprasad Prajapati";
  const clusterRegion = product?.region || "Gorakhpur / Varanasi, Uttar Pradesh";
  const craftTitle = product?.title || product?.name || "Gorakhpur GI-Tagged Terracotta Floral Urn";
  const craftImage = product?.image || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80";

  // Trigger Beckn protocol broadcast simulation
  const handlePublish = () => {
    setIsPublishing(true);
    setPublishStep(1);

    setTimeout(() => setPublishStep(2), 500);
    setTimeout(() => setPublishStep(3), 1100);
    setTimeout(() => {
      setPublishStep(4);
      setIsPublishing(false);
      const res = {
        bppId: 'artisan-bpp.brocode.sih.in',
        bppUri: 'https://artisan-bpp.brocode.sih.in/protocol/v1',
        itemId: `ITEM-${product?.sku || product?.id || '901'}`,
        timestamp: new Date().toISOString(),
        networkStatus: 'ACTIVE_IN_SEARCH_INDEX',
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

  // Beckn v1.2 JSON Schema compliant with ONDC Retail Specifications
  const becknCatalogJson = {
    context: {
      domain: "nic2004:52110",
      country: "IND",
      city: "std:080",
      action: "on_search",
      core_version: "1.2.0",
      bap_id: `${selectedBuyerApp.id}-buyer.ondc.org`,
      bap_uri: `https://${selectedBuyerApp.id}-buyer.ondc.org/protocol/v1`,
      bpp_id: publishedData.bppId,
      bpp_uri: publishedData.bppUri,
      transaction_id: "txn-sih-2026-9a4f-82b1c",
      message_id: "msg-9904-81e0-beckn",
      timestamp: publishedData.timestamp
    },
    message: {
      catalog: {
        "bpp/descriptor": {
          name: "Smart Artisan Collective (PM Vishwakarma)",
          short_desc: "Direct Rural Artisan Collective",
          symbol: "https://img.icons8.com/color/96/pottery.png"
        },
        "bpp/providers": [
          {
            id: "PROVIDER-BROCODE-01",
            descriptor: {
              name: `${artisanName} Workshop`,
              short_desc: "GI Certified Master Craftsperson Guild",
              images: [craftImage]
            },
            categories: [{ id: product?.category || "Pottery & Terracotta", descriptor: { name: product?.category || "Pottery & Terracotta" } }],
            items: [
              {
                id: publishedData.itemId,
                descriptor: {
                  name: craftTitle,
                  short_desc: product?.material || "Alluvial Riverbed Clay",
                  long_desc: `Handcrafted in ${clusterRegion} by master artisan ${artisanName}. PM Vishwakarma Certified.`,
                  images: [craftImage]
                },
                category_id: product?.category || "Pottery & Terracotta",
                price: {
                  currency: "INR",
                  value: String(priceValue),
                  maximum_value: String(retailComparisonPrice)
                },
                tags: {
                  gi_tagged: "true",
                  pm_vishwakarma: "verified",
                  artisan_name: artisanName,
                  cluster_region: clusterRegion,
                  direct_artisan_share: "100%",
                  logistics_partner: "India Post Dak Ghar Niryat Kendra"
                }
              }
            ]
          }
        ]
      }
    }
  };

  const handleCopyBeckn = () => {
    navigator.clipboard.writeText(JSON.stringify(becknCatalogJson, null, 2));
    setCopiedBeckn(true);
    setTimeout(() => setCopiedBeckn(false), 2000);
  };

  const handleSimulateBuy = () => {
    setShowCheckoutModal(true);
    setCheckoutStep(1);
  };

  const handleConfirmCheckout = () => {
    setCheckoutStep(2);
    setTimeout(() => {
      setCheckoutStep(3);
    }, 1200);
  };

  return (
    <div className="glass-panel p-5 relative overflow-hidden space-y-5">
      
      {/* Top Banner & Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-glass)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--color-terracotta)] text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white font-heading flex items-center gap-2">
              <span>ONDC National Network Marketplace & Publish Suite</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Beckn v1.2
              </span>
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Experience how urban buyers discover and buy your craft on ONDC apps with 0% middleman exploitation.
          </p>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center glass-pill p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('replica')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'replica'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Buyer App Replica</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'console'
                ? 'bg-[var(--color-saffron)] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Seller Broadcast Hub</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('beckn')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'beckn'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Beckn Protocol JSON</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ONDC BUYER APP REPLICA VIEW                                       */}
      {/* ========================================================================= */}
      {activeTab === 'replica' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Buyer Application Chrome / Frame */}
          <div className="rounded-2xl bg-gradient-to-b from-[#0F172A] via-[#111C38] to-[#0A1020] border-2 border-blue-500/30 shadow-2xl overflow-hidden">
            
            {/* ONDC Buyer App Top Navigation Bar */}
            <div className="p-3 sm:p-4 bg-[#090D1A] border-b border-blue-500/20 flex flex-wrap items-center justify-between gap-3">
              
              {/* ONDC Brand & App Switcher */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-400/30 text-blue-300 font-bold text-xs">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>ONDC</span>
                </div>
                <div className="h-4 w-px bg-white/10 hidden sm:block" />
                
                {/* Switcher Pills for Different ONDC Buyer Apps */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  {BUYER_APPS.map(app => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedBuyerApp(app)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 ${
                        selectedBuyerApp.id === app.id
                          ? `bg-white/15 text-white ${app.border} border shadow-sm`
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {app.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Pincode Pill */}
              <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-gray-400 text-[11px]">Deliver to:</span>
                {isEditingPincode ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      maxLength={6}
                      value={tempPincode}
                      onChange={(e) => setTempPincode(e.target.value)}
                      className="w-16 px-1 py-0.5 bg-black text-white font-mono text-xs rounded border border-blue-500 outline-none"
                    />
                    <button
                      onClick={() => { setPincode(tempPincode); setIsEditingPincode(false); }}
                      className="text-[10px] text-emerald-400 font-bold px-1"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingPincode(true)}
                    className="font-mono text-white font-semibold hover:underline"
                    title="Click to change pincode"
                  >
                    {pincode}
                  </button>
                )}
                <span className="text-[10px] text-emerald-400 font-medium ml-1 hidden sm:inline">
                  • India Post Fast Transit
                </span>
              </div>
            </div>

            {/* ONDC Search Simulator Bar */}
            <div className="px-4 py-2 bg-[#0C1427] border-b border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-400 w-full max-w-md">
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate text-gray-300 font-sans">
                  "GI Tagged {product?.category || 'Handicrafts'} from {clusterRegion.split(',')[0]}"
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                <span className="hidden md:inline">Showing 1 of 1 Verified Masterpiece</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                  Zero Commission Payout
                </span>
              </div>
            </div>

            {/* Main Product Showcase (As viewed by buyer) */}
            <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Product Image & Badges (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 group aspect-square">
                  <img
                    src={craftImage}
                    alt={craftTitle}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Verified Trust Badges on Image */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[var(--color-gold)] border border-[var(--color-gold)]/40 text-[10px] font-bold flex items-center gap-1 shadow-lg">
                      <Award className="w-3 h-3 text-[var(--color-gold)]" /> GI Certified Origin
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 shadow-lg">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> PM Vishwakarma
                    </span>
                  </div>

                  {/* Favorite / Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => setIsLiked(!isLiked)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-all"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-gray-300'}`} />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] text-gray-300 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[var(--color-saffron)]">
                      <Sparkles className="w-3 h-3" /> AI Symmetry: {product?.symmetry || 96.4}%
                    </span>
                    <span className="text-gray-400">Stock: 3 units left</span>
                  </div>
                </div>

                {/* Fulfillment & Logistics Note */}
                <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-[11px] text-gray-300 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <strong>India Post Dak Ghar Niryat Kendra:</strong> Dispatched from {clusterRegion.split(',')[0]} directly to {pincode}.
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Artisan Provenance, Pricing & Buy (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                
                <div className="space-y-3">
                  {/* Category & Rating */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-saffron)]">
                      {product?.category || "Pottery & Terracotta"} • {selectedBuyerApp.name}
                    </span>
                    <div className="flex items-center gap-1 bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>4.9 (142 Verified Buyer Reviews)</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-extrabold text-white font-heading leading-snug">
                    {craftTitle}
                  </h3>

                  {/* Artisan Maker Credential */}
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-terracotta)] flex items-center justify-center font-bold text-white text-xs">
                        {artisanName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{artisanName}</div>
                        <div className="text-[10px] text-gray-400">{clusterRegion}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                      PMV ID: PMV-UP-249018
                    </span>
                  </div>

                  {/* Price Comparison Card */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-black/40 to-emerald-950/30 border border-emerald-500/30">
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl sm:text-3xl font-extrabold text-white font-heading flex items-center">
                        <IndianRupee className="w-6 h-6 text-emerald-400" />
                        <span>{priceValue}</span>
                      </div>
                      <span className="text-sm text-gray-500 line-through font-mono">
                        ₹{retailComparisonPrice}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold ml-auto">
                        Save ₹{savingsAmount}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-300/80 mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span><strong>100% Direct to Artisan:</strong> Zero broker commission. You save while the maker earns a dignified living wage.</span>
                    </p>
                  </div>

                  {/* Product Specification Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                      <div className="text-[10px] text-gray-400">Material</div>
                      <div className="font-semibold text-white truncate">{product?.material || 'Natural Clay'}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                      <div className="text-[10px] text-gray-400">Dimensions</div>
                      <div className="font-semibold text-white truncate">{product?.dimensions || '32cm x 20cm'}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                      <div className="text-[10px] text-gray-400">Weight</div>
                      <div className="font-semibold text-white truncate">{product?.weight || '1,200g'}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                      <div className="text-[10px] text-gray-400">Crafting Time</div>
                      <div className="font-semibold text-[var(--color-saffron)] truncate">{pricing?.laborHours || 9} hrs</div>
                    </div>
                  </div>

                </div>

                {/* Buyer CTA Buttons */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Primary Buy Button */}
                    <button
                      type="button"
                      onClick={handleSimulateBuy}
                      className="btn-primary py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-950/50"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Buy on ONDC (Direct Checkout)</span>
                    </button>

                    {/* WhatsApp Storefront Chat Button */}
                    <button
                      type="button"
                      onClick={() => setShowWhatsAppModal(true)}
                      className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat on WhatsApp Storefront</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Encrypted Beckn Protocol Payment
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('beckn')}
                      className="text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>View Beckn Catalog JSON</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Network Broadcasting Channels Matrix */}
          <div className="p-4 rounded-xl bg-black/30 border border-[var(--border-glass)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Live ONDC Network Discovery Nodes
              </span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                4 Buyer Apps Synced
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {BUYER_APPS.map(app => (
                <div key={app.id} className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{app.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-gray-400">{app.badge}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-1">Status: LIVE</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ARTISAN SELLER BROADCAST CONSOLE                                   */}
      {/* ========================================================================= */}
      {activeTab === 'console' && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="p-4 rounded-2xl bg-black/30 border border-[var(--border-glass)] space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[var(--color-saffron)]" />
                  ONDC Beckn Gateway Broadcast Console
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Artisan BPP Endpoint: <code className="text-blue-300 font-mono">{publishedData.bppId}</code>
                </p>
              </div>

              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Broadcasting to ONDC Gateway...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Re-Broadcast & Sync Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Step-by-Step Sync Progress Bar during broadcast */}
            {isPublishing && (
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-2 animate-fadeIn text-xs">
                <div className="flex justify-between text-blue-300 font-semibold text-[11px]">
                  <span>Broadcasting via Beckn Protocol v1.2</span>
                  <span>Step {publishStep} of 4</span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${(publishStep / 4) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-gray-300 italic">
                  {publishStep === 1 && "1. Validating PM Vishwakarma certification & GI Tag registry..."}
                  {publishStep === 2 && "2. Compiling Beckn v1.2 Retail Catalog with verified pricing..."}
                  {publishStep === 3 && "3. Cryptographically signing Ed25519 authentication headers..."}
                  {publishStep === 4 && "4. Broadcast confirmed! Catalog indexed across Paytm, Mystore, Pincode."}
                </div>
              </div>
            )}

            {/* Gateway Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="text-[10px] text-gray-400">Total Potential Reach</div>
                <div className="text-base font-bold text-white mt-0.5">4.5 Crore+</div>
                <div className="text-[10px] text-blue-300">Across ONDC buyer apps</div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="text-[10px] text-gray-400">Artisan Commission</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">0% Zero Cut</div>
                <div className="text-[10px] text-emerald-300">100% to bank account</div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="text-[10px] text-gray-400">Logistics Routing</div>
                <div className="text-base font-bold text-[var(--color-saffron)] mt-0.5">India Post</div>
                <div className="text-[10px] text-gray-400">Dak Ghar Niryat Kendra</div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="text-[10px] text-gray-400">Direct Payout VPA</div>
                <div className="text-base font-bold text-white mt-0.5 truncate">artisan@upi</div>
                <div className="text-[10px] text-emerald-400">Instant settlement</div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {onViewCatalogue && (
                <button
                  type="button"
                  onClick={onViewCatalogue}
                  className="btn-secondary px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  <span>View in My Catalogue 📦</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('replica')}
                className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer ml-auto"
              >
                Switch to ONDC Buyer Preview →
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BECKN PROTOCOL JSON INSPECTOR                                     */}
      {/* ========================================================================= */}
      {activeTab === 'beckn' && (
        <div className="space-y-3 animate-fadeIn">
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Code className="w-4 h-4 text-emerald-400" />
                Live ONDC Beckn v1.2 Retail Catalog Payload
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Action: on_search
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyBeckn}
              className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
            >
              {copiedBeckn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBeckn ? 'Copied JSON!' : 'Copy Beckn JSON'}</span>
            </button>
          </div>

          <p className="text-[11px] text-gray-400">
            This standardized Beckn JSON payload conforms to ONDC Retail specs (v1.2.0), enabling universal interoperability across any buyer app (Paytm, Mystore, Pincode, Magicpin).
          </p>

          {/* JSON Code Viewer */}
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-inner">
            <div className="p-3 bg-[#0A0E1A] border-b border-white/5 flex items-center justify-between text-[11px] text-gray-400 font-mono">
              <span>schema_type: ondc_retail_catalog_item</span>
              <span>Ed25519 Signature Verified</span>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[380px] leading-relaxed select-all">
              {JSON.stringify(becknCatalogJson, null, 2)}
            </pre>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SIMULATED ONDC BECKN CHECKOUT                                   */}
      {/* ========================================================================= */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-[#0F172A] border-2 border-blue-500/40 p-5 shadow-2xl space-y-4 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                  ONDC
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-heading">
                    {selectedBuyerApp.name} • Direct Beckn Checkout
                  </h4>
                  <div className="text-[10px] text-gray-400">Zero Middleman Direct-to-Artisan Transaction</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Review Order & Pay */}
            {checkoutStep === 1 && (
              <div className="space-y-3.5 text-xs">
                
                {/* Item Summary */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <img src={craftImage} alt={craftTitle} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white truncate">{craftTitle}</div>
                    <div className="text-[10px] text-gray-400">Master Maker: {artisanName}</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">₹{priceValue}</div>
                  </div>
                </div>

                {/* Delivery Address Pill */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-400" /> Delivery Address</span>
                    <span className="text-blue-400">Change</span>
                  </div>
                  <div className="text-white font-semibold">House 42, Barakhamba Road, Connaught Place, New Delhi - {pincode}</div>
                  <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Standard Delivery via India Post (3-4 business days) • Free
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <div className="text-[11px] text-gray-400 mb-1.5 font-semibold">Payment Method:</div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">UPI</div>
                      <span className="text-white font-semibold">Instant UPI Direct to Artisan VPA</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-mono">0% Merchant Fee</span>
                  </div>
                </div>

                {/* Amount Total */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm">
                  <span className="text-gray-300 font-semibold">Total Payable:</span>
                  <span className="text-xl font-extrabold text-white font-heading">₹{priceValue}</span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmCheckout}
                  className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Pay ₹{priceValue} Direct to Artisan Bank Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Processing Handshake */}
            {checkoutStep === 2 && (
              <div className="py-8 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-white">Broadcasting Beckn /init & /confirm Handshake...</h4>
                <p className="text-xs text-gray-400">Locking inventory with {artisanName}'s workshop via ONDC BPP.</p>
              </div>
            )}

            {/* Step 3: Confirmed Screen */}
            {checkoutStep === 3 && (
              <div className="py-4 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-heading">ONDC Order Confirmed!</h4>
                  <p className="text-xs text-gray-300 mt-1">
                    Order ID: <code className="text-[var(--color-gold)] font-mono">ORD-ONDC-2026-8812</code>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 text-left text-xs text-gray-300 border border-white/5 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payout Recipient:</span>
                    <span className="text-white font-semibold">{artisanName} (100% Direct)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fulfillment:</span>
                    <span className="text-emerald-400 font-semibold">India Post Dak Ghar Niryat Kendra</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estimated Dispatch:</span>
                    <span className="text-white font-semibold">Within 48 Hours from Gorakhpur Cluster</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="btn-secondary px-5 py-2 text-xs font-semibold"
                >
                  Close Preview
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SIMULATED WHATSAPP BUSINESS STOREFRONT                          */}
      {/* ========================================================================= */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-[32px] bg-[#111B21] border-2 border-emerald-500/40 shadow-2xl overflow-hidden relative">
            
            {/* WhatsApp Top Header */}
            <div className="p-3.5 bg-[#202C33] flex items-center justify-between text-white border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[var(--color-terracotta)] flex items-center justify-center text-xs font-bold text-white">
                  {artisanName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>{artisanName} Crafts</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  </div>
                  <div className="text-[10px] text-gray-400">PM Vishwakarma Artisan • Online</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 space-y-3 text-xs min-h-[300px] bg-[#0B141A] relative">
              
              {/* Timestamp */}
              <div className="text-center">
                <span className="px-2 py-0.5 rounded-full bg-[#182229] text-[10px] text-gray-400">
                  Today • ONDC Storefront Chat
                </span>
              </div>

              {/* Bot Automated Craft Card Message */}
              <div className="max-w-[85%] p-3 rounded-2xl rounded-tl-none bg-[#202C33] text-white space-y-2 border border-white/5 shadow-md">
                <img src={craftImage} alt={craftTitle} className="w-full h-28 object-cover rounded-lg" />
                <div>
                  <div className="font-bold text-xs">{craftTitle}</div>
                  <div className="text-[10px] text-gray-300">Direct ONDC Fair Price: <strong>₹{priceValue}</strong></div>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  नमस्ते! Welcome to my craft workshop. Handcrafted with traditional techniques in {clusterRegion.split(',')[0]}. Certified PM Vishwakarma heritage piece.
                </p>
                <div className="pt-1 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setShowWhatsAppModal(false); setShowCheckoutModal(true); }}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-emerald-500"
                  >
                    <span>⚡ Order Now via 1-Click UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("WhatsApp automated enquiry sent to artisan")}
                    className="w-full py-1 rounded-lg bg-white/5 text-gray-300 text-[10px] hover:bg-white/10"
                  >
                    Custom Dimensions Enquiry
                  </button>
                </div>
                <div className="text-[9px] text-gray-400 text-right">Just now • Automated Assistant</div>
              </div>

            </div>

            {/* WhatsApp Bottom Footer */}
            <div className="p-2.5 bg-[#202C33] flex items-center justify-between text-xs text-gray-400 border-t border-white/5">
              <span className="text-[10px]">Connected via Meta WhatsApp Cloud API</span>
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="text-[10px] text-emerald-400 font-semibold"
              >
                Close Chat
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
