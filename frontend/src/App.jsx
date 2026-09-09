import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Sparkles, CheckCircle2, ChevronRight, Layers, Award, ArrowUpRight, Camera, Package } from 'lucide-react';
import Navbar from './components/Navbar';
import VoicePromptCapture from './components/VoicePromptCapture';
import VisionScanner from './components/VisionScanner';
import ListingPhotoStudio from './components/ListingPhotoStudio';
import PricingCalculator from './components/PricingCalculator';
import ONDCPublishModal from './components/ONDCPublishModal';
import OfflineSyncQueue from './components/OfflineSyncQueue';
import NationalImpactMetrics from './components/NationalImpactMetrics';
import ArtisanCatalogue, { INITIAL_CATALOGUE } from './components/ArtisanCatalogue';
import { useLanguage } from './context/LanguageContext';
import {
  fetchProducts,
  saveProductToDatabase,
  updateProductInDatabase,
  deleteProductFromDatabase,
  toggleProductOndcInDatabase,
  syncEdgeSqliteToMainDatabase
} from './services/apiService';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [isMobileSimView, setIsMobileSimView] = useState(false);
  const [syncToast, setSyncToast] = useState(null);

  const triggerSyncToast = (msg) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 5000);
  };

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('artisan_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('artisan_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (err) {
      console.warn('Theme update error:', err);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Shared state between steps
  const [capturedVoice, setCapturedVoice] = useState(null);
  const [scannedCraft, setScannedCraft] = useState({
    id: 'terra',
    name: 'Gorakhpur GI Terracotta Urn',
    category: 'Pottery & Terracotta',
    material: 'Alluvial Riverbed Clay',
    dimensions: '32cm (H) x 20cm (W)',
    weight: '1,200g',
    symmetry: 96.4,
    density: 94.1,
    trustBadge: 'Masterpiece Grade A+ (GI Certified)',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
  });
  const [pricing, setPricing] = useState({
    rawCost: 160,
    laborHours: 9,
    skillLevel: 'Master Artisan',
    fairMarketPrice: 1930,
    totalLaborCost: 1449
  });
  const [step2SubTab, setStep2SubTab] = useState('studio'); // 'studio' | 'scanner'

  // Catalogue state with live Database synchronization and localStorage persistence
  const [catalogueProducts, setCatalogueProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('artisan_catalogue_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.warn('Could not read catalogue from localStorage:', err);
    }
    return INITIAL_CATALOGUE;
  });

  // Load products from live Database on mount
  useEffect(() => {
    fetchProducts().then(({ data, source }) => {
      console.log(`[Database Sync] Loaded ${data.length} products from: ${source}`);
      if (data && data.length > 0) {
        setCatalogueProducts(data);
      }
    });
  }, []);

  // Automatic SQLite flush & upload when network is detected
  useEffect(() => {
    const handleNetworkOnline = async () => {
      setIsOnline(true);
      triggerSyncToast('⚡ Network connection detected: Flushed pending Edge SQLite records to Main Database...');
      try {
        const syncRes = await syncEdgeSqliteToMainDatabase();
        if (syncRes && syncRes.count > 0) {
          triggerSyncToast(`✅ Network online! ${syncRes.count} product(s) uploaded from Edge SQLite to Main Database.`);
          const { data } = await fetchProducts();
          if (data && data.length > 0) {
            setCatalogueProducts(data);
          }
        }
      } catch (err) {
        console.warn('Auto-sync on network restore failed:', err);
      }
    };

    const handleNetworkOffline = () => {
      setIsOnline(false);
      triggerSyncToast('📡 Working Offline: Edge SQLite mode active. New products will be stored safely on-device.');
    };

    const handleEdgeSqliteSyncedEvent = async (e) => {
      const count = e.detail?.syncedCount;
      if (count > 0) {
        triggerSyncToast(`✅ Successfully synced ${count} craft(s) from Edge SQLite to Main Database!`);
        const { data } = await fetchProducts();
        if (data && data.length > 0) {
          setCatalogueProducts(data);
        }
      }
    };

    window.addEventListener('online', handleNetworkOnline);
    window.addEventListener('offline', handleNetworkOffline);
    window.addEventListener('edge_sqlite_synced', handleEdgeSqliteSyncedEvent);

    return () => {
      window.removeEventListener('online', handleNetworkOnline);
      window.removeEventListener('offline', handleNetworkOffline);
      window.removeEventListener('edge_sqlite_synced', handleEdgeSqliteSyncedEvent);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('artisan_catalogue_v1', JSON.stringify(catalogueProducts));
    } catch (err) {
      console.warn('Could not save catalogue to localStorage:', err);
    }
  }, [catalogueProducts]);

  const handleToggleOnline = async () => {
    const nextOnline = !isOnline;
    setIsOnline(nextOnline);
    if (nextOnline) {
      triggerSyncToast('⚡ Connected to network: Auto-uploading Edge SQLite queue to Main Database...');
      try {
        const syncRes = await syncEdgeSqliteToMainDatabase();
        if (syncRes && syncRes.count > 0) {
          triggerSyncToast(`✅ Uploaded ${syncRes.count} pending product(s) from Edge SQLite to Main Database!`);
          const { data } = await fetchProducts();
          if (data && data.length > 0) {
            setCatalogueProducts(data);
          }
        } else {
          triggerSyncToast('☁️ Cloud connected: Main Database synchronized.');
        }
      } catch (err) {
        console.warn('Online sync toggle failed:', err);
      }
    } else {
      triggerSyncToast('📦 Offline Mode Enabled: New listings will be saved to local Edge SQLite database.');
    }
  };

  const handleAddProduct = async (newProd) => {
    // 1. Optimistic UI update with proper sync status flags
    const optimisticProd = {
      ...newProd,
      syncedWithDb: isOnline,
      offlineQueued: !isOnline,
      syncStatus: isOnline ? 'Live on Main Database' : 'Queued in SQLite (Offline)'
    };
    setCatalogueProducts(prev => [optimisticProd, ...prev]);

    // 2. Persist directly to backend database or local Edge SQLite
    const res = await saveProductToDatabase(newProd, isOnline);
    if (res?.product?.id) {
      setCatalogueProducts(prev =>
        prev.map(p => (p.id === newProd.id ? { ...p, ...res.product } : p))
      );
    }

    if (!isOnline) {
      triggerSyncToast(`💾 Stored in Edge SQLite: "${newProd.title}" will upload to Main Database when network connects.`);
    } else {
      triggerSyncToast(`☁️ Uploaded to Main Database: "${newProd.title}" is live!`);
    }
  };

  const handleRemoveProduct = (productId) => {
    setCatalogueProducts(prev => prev.filter(p => p.id !== productId && p.sku !== productId));
    deleteProductFromDatabase(productId);
  };

  const handleEditProduct = (updatedProd) => {
    setCatalogueProducts(prev =>
      prev.map(p => (p.id === updatedProd.id ? updatedProd : p))
    );
    updateProductInDatabase(updatedProd.id || updatedProd.sku, updatedProd);
  };

  const handleToggleOndcStatus = (productId) => {
    let nextStatus = false;
    setCatalogueProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          nextStatus = !p.ondcPublished;
          return { ...p, ondcPublished: nextStatus };
        }
        return p;
      })
    );
    toggleProductOndcInDatabase(productId, nextStatus);
  };

  const handlePublishSuccess = async () => {
    // Automatically add/update the current product in the catalogue & database
    const newEntry = {
      id: 'prod-' + Date.now(),
      sku: `ART-${(scannedCraft.id || 'CRAFT').toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
      title: scannedCraft.name,
      category: scannedCraft.category || 'Handicraft',
      craftStyle: scannedCraft.category || 'Handicraft',
      material: scannedCraft.material || 'Authentic Regional Materials',
      dimensions: scannedCraft.dimensions || '30cm x 20cm',
      weight: scannedCraft.weight || '1,000g',
      rawCost: pricing.rawCost,
      laborHours: pricing.laborHours,
      price: pricing.fairMarketPrice || 1850,
      ondcPublished: true,
      giCertified: false,
      trustBadge: scannedCraft.trustBadge || 'Artisan Handcrafted (GI Verification Pending)',
      image: scannedCraft.image,
      dateAdded: new Date().toISOString().split('T')[0],
      syncedWithDb: isOnline,
      offlineQueued: !isOnline,
      syncStatus: isOnline ? 'Live on Main Database' : 'Queued in SQLite (Offline)'
    };

    setCatalogueProducts(prev => {
      const existingIdx = prev.findIndex(p => p.title === scannedCraft.name || p.id === scannedCraft.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ondcPublished: true,
          price: pricing.fairMarketPrice || updated[existingIdx].price,
          image: scannedCraft.image || updated[existingIdx].image,
          syncedWithDb: isOnline,
          offlineQueued: !isOnline,
          syncStatus: isOnline ? 'Live on Main Database' : 'Queued in SQLite (Offline)'
        };
        if (isOnline) {
          updateProductInDatabase(updated[existingIdx].id, updated[existingIdx]);
        }
        return updated;
      }
      return [newEntry, ...prev];
    });

    const res = await saveProductToDatabase(newEntry, isOnline);
    if (res?.product) {
      setCatalogueProducts(prev =>
        prev.map(p => (p.id === newEntry.id ? { ...p, ...res.product } : p))
      );
    }

    if (!isOnline) {
      triggerSyncToast(`💾 Published to Edge SQLite: Ready for auto-upload upon network detection.`);
    } else {
      triggerSyncToast(`🚀 Published to Main Database & ONDC network successfully!`);
    }
  };

  const handleListingPhotosApplied = (primaryImageUrl, allPhotos) => {
    setScannedCraft(prev => ({
      ...prev,
      image: primaryImageUrl,
      galleryImages: allPhotos
    }));
  };

  const handleVoiceExtracted = (voiceResult) => {
    setCapturedVoice(voiceResult);
    if (voiceResult.extracted) {
      setPricing(prev => ({
        ...prev,
        rawCost: voiceResult.extracted.rawMaterialCost || prev.rawCost,
        laborHours: voiceResult.extracted.laborHours || prev.laborHours
      }));
      if (voiceResult.extracted.craftType) {
        setScannedCraft(prev => ({
          ...prev,
          name: voiceResult.extracted.title || prev.name,
          category: voiceResult.extracted.craftType || prev.category,
          material: voiceResult.extracted.material || prev.material
        }));
      }
    }
  };

  const handleVoiceDirectToCatalogue = (voiceItem) => {
    const rawCost = Number(voiceItem.extracted?.rawMaterialCost || 160);
    const laborHours = Number(voiceItem.extracted?.laborHours || 8);
    const fairPrice = Math.round((laborHours * 140) + rawCost + ((laborHours * 140 + rawCost) * 0.20));

    const newProd = {
      id: 'prod-' + Date.now(),
      sku: `ART-VOICE-${Math.floor(1000 + Math.random() * 9000)}`,
      title: voiceItem.extracted?.title || voiceItem.spokenText?.slice(0, 45) || 'Handcrafted Artisan Craft',
      category: voiceItem.extracted?.craftType || 'Traditional Handicraft',
      craftStyle: voiceItem.extracted?.craftType || 'Traditional Handicraft',
      material: voiceItem.extracted?.material || 'Authentic Regional Materials',
      dimensions: '30cm x 18cm x 18cm',
      weight: '850g',
      rawCost: rawCost,
      laborHours: laborHours,
      price: fairPrice,
      suggestedPrice: fairPrice,
      ondcPublished: true,
      giCertified: false,
      trustBadge: 'Artisan Verified (GI Verification Pending)',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    handleAddProduct(newProd);
    setActiveStep(4);
  };

  const handleVerifyProduct = (productId, verificationData) => {
    setCatalogueProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === productId) {
          const updatedProduct = {
            ...p,
            giCertified: true,
            giVerifiedAt: new Date().toISOString(),
            giTagNumber: verificationData.tagNumber || p.giTagNumber || `GI-IN-00${Math.floor(100 + Math.random() * 899)}`,
            giCluster: verificationData.cluster || p.giCluster || `${verificationData.district || 'Heritage'}, ${verificationData.state || 'India'}`,
            artisanName: verificationData.artisanName || p.artisanName,
            pmVishwakarmaId: verificationData.pmVishwakarmaId,
            originDistrict: verificationData.district,
            originState: verificationData.state,
            rawMaterialSource: verificationData.rawMaterialSource,
            heritageTechnique: verificationData.technique,
            generationsPracticed: verificationData.generations,
            trustBadge: 'GI Certified Heritage Craft (PM Vishwakarma)'
          };
          if (isOnline) {
            updateProductInDatabase(productId, {
              ...updatedProduct,
              gi_certified: true
            });
          }
          return updatedProduct;
        }
        return p;
      });
      return updated;
    });
  };

  const steps = [
    { id: 1, label: t('steps.step1', '1. Voice Prompt'), hint: t('steps.step1Sub', 'Vernacular Speech') },
    { id: 2, label: t('steps.step2', '2. Edge AI Vision'), hint: t('steps.step2Sub', 'Camera & Hard Drive') },
    { id: 3, label: t('steps.step3', '3. ONDC Publish'), hint: t('steps.step3Sub', 'Direct Market Sync') },
    { id: 4, label: '4. Catalogue & GI Verification', hint: `${catalogueProducts.length} Items • Verified GI` }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between pb-10 relative">
      
      {/* 3D Ambient Floating Depth Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute top-[6%] left-[4%] w-96 h-96 rounded-full bg-gradient-to-tr from-amber-500/15 via-rose-600/10 to-transparent blur-3xl animate-float-3d" />
        <div className="absolute top-[38%] right-[2%] w-[26rem] h-[26rem] rounded-full bg-gradient-to-bl from-purple-600/12 via-indigo-600/10 to-transparent blur-3xl animate-float-3d" style={{ animationDelay: '-2.5s' }} />
        <div className="absolute bottom-[12%] left-[25%] w-80 h-80 rounded-full bg-gradient-to-tr from-amber-600/10 to-transparent blur-3xl animate-float-3d" style={{ animationDelay: '-1.2s' }} />
      </div>
      
      {/* Navigation Header */}
      <Navbar
        selectedLang={language}
        onSelectLang={setLanguage}
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Network Sync Floating Toast Banner */}
      {syncToast && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-slate-900/95 border border-amber-500/60 shadow-2xl rounded-2xl p-3.5 text-xs text-amber-200 backdrop-blur-md flex items-center gap-3 animate-fadeIn">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
          <p className="font-semibold leading-relaxed">{syncToast}</p>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 w-full flex-grow">
        
        {/* Top Hero Banner & Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-terracotta)]/15 text-[var(--color-terracotta)] text-xs font-semibold mb-2 border border-[var(--color-terracotta)]/25">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart India Hackathon 2026 Solution Showcase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              {t('nav.title', 'Smart Artisan Companion')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl mt-1">
              {t('voice.subtitle')}
            </p>
          </div>

          {/* View / Mode Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Device Simulation Toggle (Desktop vs Mobile Frame) */}
            <div className="flex items-center glass-pill p-1">
              <button
                onClick={() => setIsMobileSimView(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  !isMobileSimView ? 'bg-[var(--color-saffron)] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setIsMobileSimView(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isMobileSimView ? 'bg-[var(--color-saffron)] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Companion</span>
              </button>
            </div>

          </div>
        </div>

        {/* 4-Step Interactive Workflow Progress Navigation */}
        <div className="glass-panel p-2 mb-6 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[500px]">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex-1 flex items-center gap-2 p-2.5 rounded-xl text-left transition-all ${
                  activeStep === step.id
                    ? 'bg-white/10 text-white border border-[var(--color-saffron)]/40'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    activeStep === step.id
                      ? 'bg-[var(--color-saffron)] text-black'
                      : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {step.id}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold leading-tight truncate">{step.label}</div>
                  <div className="text-[10px] text-gray-400 truncate">{step.hint}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content View: Mobile Phone Simulation or Full Dashboard Layout */}
        {isMobileSimView ? (
          /* Mobile Phone Frame Simulation */
          <div className="max-w-[400px] mx-auto p-3 rounded-[40px] bg-slate-900 border-[6px] border-slate-700 shadow-2xl mb-8 relative">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3" />
            
            <div className="space-y-4 max-h-[720px] overflow-y-auto pr-1">
              {activeStep === 1 && (
                <VoicePromptCapture
                  language={language}
                  onVoiceExtracted={handleVoiceExtracted}
                  onProceedToStudio={() => setActiveStep(2)}
                  onDirectToCatalogue={handleVoiceDirectToCatalogue}
                />
              )}
              {activeStep === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center glass-pill p-1 gap-1">
                    <button
                      onClick={() => setStep2SubTab('studio')}
                      className={`flex-1 py-1 px-2 rounded-full text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                        step2SubTab === 'studio'
                          ? 'bg-[var(--color-terracotta)] text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Camera className="w-3 h-3" />
                      <span>Photo Studio</span>
                    </button>
                    <button
                      onClick={() => setStep2SubTab('scanner')}
                      className={`flex-1 py-1 px-2 rounded-full text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                        step2SubTab === 'scanner'
                          ? 'bg-[var(--color-saffron)] text-black'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AI Scanner</span>
                    </button>
                  </div>

                  {step2SubTab === 'studio' ? (
                    <ListingPhotoStudio
                      onApplyToListing={handleListingPhotosApplied}
                    />
                  ) : (
                    <VisionScanner onScanComplete={setScannedCraft} />
                  )}
                </div>
              )}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <ONDCPublishModal
                    product={scannedCraft}
                    pricing={pricing}
                    isOnline={isOnline}
                    onPublishSuccess={handlePublishSuccess}
                    onViewCatalogue={() => setActiveStep(4)}
                  />
                  <OfflineSyncQueue isOnline={isOnline} />
                </div>
              )}
              {activeStep === 4 && (
                <div className="space-y-4">
                  <ArtisanCatalogue
                    isOnline={isOnline}
                    products={catalogueProducts}
                    onAddProduct={handleAddProduct}
                    onRemoveProduct={handleRemoveProduct}
                    onEditProduct={handleEditProduct}
                    onToggleOndcStatus={handleToggleOndcStatus}
                    onCreateNewListing={() => setActiveStep(1)}
                    onVerifyProduct={handleVerifyProduct}
                    pricing={pricing}
                    onPriceCalculated={setPricing}
                    scannedCraft={scannedCraft}
                  />
                  <OfflineSyncQueue isOnline={isOnline} />
                </div>
              )}
            </div>

            {/* Step Next Button on Mobile */}
            <div className="pt-3 mt-3 border-t border-slate-700 flex justify-between items-center text-xs">
              <button
                disabled={activeStep === 1}
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                className="text-gray-400 disabled:opacity-30 hover:text-white"
              >
                Previous
              </button>
              <span className="text-gray-500 font-mono text-[11px]">Step {activeStep} of 4</span>
              <button
                disabled={activeStep === 4}
                onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
                className="text-[var(--color-saffron)] font-bold disabled:opacity-30 flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Full Dashboard Layout */
          <div className="space-y-6">
            
            {activeStep === 1 && (
              <div className="w-full">
                <VoicePromptCapture
                  language={language}
                  onVoiceExtracted={handleVoiceExtracted}
                  onProceedToStudio={() => setActiveStep(2)}
                  onDirectToCatalogue={handleVoiceDirectToCatalogue}
                />
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center glass-pill p-1 gap-1">
                    <button
                      onClick={() => setStep2SubTab('studio')}
                      className={`py-1.5 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        step2SubTab === 'studio'
                          ? 'bg-[var(--color-terracotta)] text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Camera & Hard Drive Photo Studio</span>
                    </button>
                    <button
                      onClick={() => setStep2SubTab('scanner')}
                      className={`py-1.5 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        step2SubTab === 'scanner'
                          ? 'bg-[var(--color-saffron)] text-black shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Edge AI Vision Scanner & Quality Rating</span>
                    </button>
                  </div>

                  <span className="text-xs text-gray-400 hidden sm:inline">
                    {step2SubTab === 'studio'
                      ? 'Live camera capture & hard drive image upload for ONDC'
                      : 'On-device automated dimension & defect analysis'}
                  </span>
                </div>

                <div className="w-full">
                  {step2SubTab === 'studio' ? (
                    <ListingPhotoStudio
                      onApplyToListing={handleListingPhotosApplied}
                    />
                  ) : (
                    <VisionScanner onScanComplete={setScannedCraft} />
                  )}
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-6">
                <ONDCPublishModal
                  product={scannedCraft}
                  pricing={pricing}
                  isOnline={isOnline}
                  onPublishSuccess={handlePublishSuccess}
                  onViewCatalogue={() => setActiveStep(4)}
                />
                <OfflineSyncQueue isOnline={isOnline} />
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-6">
                <ArtisanCatalogue
                  isOnline={isOnline}
                  products={catalogueProducts}
                  onAddProduct={handleAddProduct}
                  onRemoveProduct={handleRemoveProduct}
                  onEditProduct={handleEditProduct}
                  onToggleOndcStatus={handleToggleOndcStatus}
                  onCreateNewListing={() => setActiveStep(1)}
                  onVerifyProduct={handleVerifyProduct}
                  pricing={pricing}
                  onPriceCalculated={setPricing}
                  scannedCraft={scannedCraft}
                />
                <OfflineSyncQueue isOnline={isOnline} />
              </div>
            )}

            {/* National Impact Metrics on every view */}
            <div className="mt-8">
              <NationalImpactMetrics />
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-[var(--border-glass)] w-full text-center text-xs text-gray-500">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <strong>Smart India Hackathon 2026</strong> • Problem Statement <strong>SIH26090</strong> (Software / Miscellaneous)
          </div>
          <div className="flex items-center gap-2">
            <span>Built with ❤️ by Team <strong>Bro Code</strong></span>
            <span>•</span>
            <span className="text-[var(--color-saffron)]">ONDC + BHASHINI + TF-Lite</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
