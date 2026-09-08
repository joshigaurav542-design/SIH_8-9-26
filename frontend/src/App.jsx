import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Sparkles, CheckCircle2, ChevronRight, Layers, Award, ArrowUpRight, Camera, Package } from 'lucide-react';
import {
  fetchProducts,
  saveProductToDatabase,
  updateProductInDatabase,
  deleteProductFromDatabase,
  toggleProductOndcInDatabase
} from './services/apiService';
import { useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import VoicePromptCapture from './components/VoicePromptCapture';
import VisionScanner from './components/VisionScanner';
import ListingPhotoStudio from './components/ListingPhotoStudio';
import PricingCalculator from './components/PricingCalculator';
import StoryCertificate from './components/StoryCertificate';
import ONDCPublishModal from './components/ONDCPublishModal';
import NationalImpactMetrics from './components/NationalImpactMetrics';
import ArtisanCatalogue, { INITIAL_CATALOGUE } from './components/ArtisanCatalogue';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [isMobileSimView, setIsMobileSimView] = useState(false);

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

  // Catalogue state with localStorage persistence
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

  // Load products from live Database on startup (with offline fallback)
  useEffect(() => {
    fetchProducts().then(({ data, source }) => {
      console.log(`[Database Sync] Loaded ${data.length} products from: ${source}`);
      if (data && data.length > 0) {
        setCatalogueProducts(data);
      }
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('artisan_catalogue_v1', JSON.stringify(catalogueProducts));
    } catch (err) {
      console.warn('Could not save catalogue to localStorage:', err);
    }
  }, [catalogueProducts]);

  const handleAddProduct = (newProd) => {
    setCatalogueProducts(prev => [newProd, ...prev]);
    saveProductToDatabase(newProd);
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
        if (p.id === productId || p.sku === productId) {
          nextStatus = !p.ondcPublished;
          return { ...p, ondcPublished: nextStatus };
        }
        return p;
      })
    );
    toggleProductOndcInDatabase(productId, nextStatus);
  };

  const handlePublishSuccess = () => {
    // Automatically add/update the current product in the catalogue and persist to database
    let newlyCreatedEntry = null;

    setCatalogueProducts(prev => {
      const existingIdx = prev.findIndex(p => p.title === scannedCraft.name || p.id === scannedCraft.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ondcPublished: true,
          price: pricing.fairMarketPrice || updated[existingIdx].price,
          image: scannedCraft.image || updated[existingIdx].image
        };
        newlyCreatedEntry = updated[existingIdx];
        return updated;
      }
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
        price: pricing.fairMarketPrice,
        ondcPublished: true,
        giCertified: true,
        trustBadge: scannedCraft.trustBadge || 'Masterpiece Grade A+ (GI Certified)',
        image: scannedCraft.image,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      newlyCreatedEntry = newEntry;
      return [newEntry, ...prev];
    });

    // Asynchronously commit to the backend database
    if (newlyCreatedEntry) {
      saveProductToDatabase(newlyCreatedEntry).then(res => {
        console.log('[DB Sync] Result:', res.synced ? 'Persisted to Database' : 'Queued Offline');
      });
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
    }
  };

  const steps = [
    { id: 1, label: 'Multilingual Speech', hint: 'BHASHINI & Whisper AI' },
    { id: 2, label: 'Vision Quality Rating', hint: 'INT8 YOLOv8 & OpenCV' },
    { id: 3, label: 'Heritage Valuation', hint: 'PM Vishwakarma Matrix' },
    { id: 4, label: 'Market Distribution', hint: 'Beckn Protocol v1.2' },
    { id: 5, label: 'My Catalogue', hint: `${catalogueProducts.length} Items & Pricing` }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between pb-10">

      {/* Navigation Header */}
      <Navbar
        selectedLang={language}
        onSelectLang={setLanguage}
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
      />

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

            {/* Studio vs Catalogue Switcher */}
            <div className="flex items-center glass-pill p-1">
              <button
                onClick={() => { if (activeStep === 5) setActiveStep(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeStep !== 5
                    ? 'bg-[var(--color-terracotta)] text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('steps.step2', 'AI Listing Studio')}</span>
              </button>
              <button
                onClick={() => setActiveStep(5)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeStep === 5
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{t('steps.step4', 'Catalogue')} ({catalogueProducts.length})</span>
              </button>
            </div>

            {/* Device Simulation Toggle (Desktop vs Mobile Frame) */}
            <div className="flex items-center glass-pill p-1">
              <button
                onClick={() => setIsMobileSimView(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${!isMobileSimView ? 'bg-[var(--color-saffron)] text-black' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setIsMobileSimView(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isMobileSimView ? 'bg-[var(--color-saffron)] text-black' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Companion</span>
              </button>
            </div>

          </div>
        </div>

        {/* 5-Step Interactive Workflow Progress Navigation from picture */}
        <div className="mb-6 overflow-x-auto pb-1">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 min-w-[660px]">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`p-3.5 rounded-2xl text-left transition-all duration-200 ${activeStep === step.id
                    ? 'bg-[#0D1424] border-2 border-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.28)]'
                    : 'bg-[#0C1220] border border-white/5 hover:border-white/15'
                  }`}
              >
                <div className={`text-xs sm:text-sm font-bold truncate leading-snug ${activeStep === step.id ? 'text-white' : 'text-slate-200'
                  }`}>
                  {step.label}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-1">
                  {step.hint}
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
                <VoicePromptCapture language={language} onVoiceExtracted={handleVoiceExtracted} />
              )}
              {activeStep === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center glass-pill p-1 gap-1">
                    <button
                      onClick={() => setStep2SubTab('studio')}
                      className={`flex-1 py-1 px-2 rounded-full text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${step2SubTab === 'studio'
                          ? 'bg-[var(--color-terracotta)] text-white'
                          : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      <Camera className="w-3 h-3" />
                      <span>Photo Studio</span>
                    </button>
                    <button
                      onClick={() => setStep2SubTab('scanner')}
                      className={`flex-1 py-1 px-2 rounded-full text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${step2SubTab === 'scanner'
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
                <>
                  <ONDCPublishModal
                    product={scannedCraft}
                    pricing={pricing}
                    isOnline={isOnline}
                    onPublishSuccess={handlePublishSuccess}
                    onViewCatalogue={() => setActiveStep(5)}
                  />
                  <StoryCertificate craft={scannedCraft} />
                  <OfflineSyncQueue isOnline={isOnline} />
                </>
              )}
              {activeStep === 5 && (
                <ArtisanCatalogue
                  products={catalogueProducts}
                  onAddProduct={handleAddProduct}
                  onRemoveProduct={handleRemoveProduct}
                  onEditProduct={handleEditProduct}
                  onToggleOndcStatus={handleToggleOndcStatus}
                  onCreateNewListing={() => setActiveStep(1)}
                  pricing={pricing}
                  onPriceCalculated={setPricing}
                  scannedCraft={scannedCraft}
                  isOnline={isOnline}
                />
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
              <span className="text-gray-500 font-mono text-[11px]">Step {activeStep} of 5</span>
              <button
                disabled={activeStep === 5}
                onClick={() => setActiveStep(prev => Math.min(5, prev + 1))}
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <VoicePromptCapture language={selectedLang} onVoiceExtracted={handleVoiceExtracted} />
                </div>
                <div>
                  <OfflineSyncQueue isOnline={isOnline} />
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center glass-pill p-1 gap-1">
                    <button
                      onClick={() => setStep2SubTab('studio')}
                      className={`py-1.5 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${step2SubTab === 'studio'
                          ? 'bg-[var(--color-terracotta)] text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Camera & Hard Drive Photo Studio</span>
                    </button>
                    <button
                      onClick={() => setStep2SubTab('scanner')}
                      className={`py-1.5 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${step2SubTab === 'scanner'
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ONDCPublishModal
                  product={scannedCraft}
                  pricing={pricing}
                  isOnline={isOnline}
                  onPublishSuccess={handlePublishSuccess}
                  onViewCatalogue={() => setActiveStep(5)}
                />
                <div className="space-y-6">
                  <StoryCertificate craft={scannedCraft} />
                  <OfflineSyncQueue isOnline={isOnline} />
                </div>
              </div>
            )}

            {activeStep === 5 && (
              <ArtisanCatalogue
                products={catalogueProducts}
                onAddProduct={handleAddProduct}
                onRemoveProduct={handleRemoveProduct}
                onEditProduct={handleEditProduct}
                onToggleOndcStatus={handleToggleOndcStatus}
                onCreateNewListing={() => setActiveStep(1)}
                pricing={pricing}
                onPriceCalculated={setPricing}
                scannedCraft={scannedCraft}
                isOnline={isOnline}
              />
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
