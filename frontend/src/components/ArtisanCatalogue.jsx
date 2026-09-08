import React, { useState, useRef, useEffect } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Globe,
  Tag,
  Award,
  Layers,
  Sparkles,
  ArrowUpRight,
  Upload,
  HardDrive,
  Camera,
  X,
  AlertTriangle,
  Grid,
  List,
  ExternalLink,
  ShieldCheck,
  IndianRupee,
  RefreshCw,
  Edit3,
  Database
} from 'lucide-react';
import { INITIAL_CATALOGUE, getSuggestedPrice } from '../data/catalogueData';
import OfflineSyncQueue from './OfflineSyncQueue';
import PricingCalculator from './PricingCalculator';
import { useLanguage } from '../context/LanguageContext';

export { INITIAL_CATALOGUE, getSuggestedPrice };

export default function ArtisanCatalogue({
  products = [],
  onAddProduct,
  onRemoveProduct,
  onEditProduct,
  onToggleOndcStatus,
  onCreateNewListing,
  pricing,
  onPriceCalculated,
  scannedCraft,
  isOnline = true
}) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ONDC_LIVE' | 'DRAFT'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    title: '',
    category: 'Pottery & Terracotta',
    craftStyle: 'Traditional Handmade',
    material: '',
    dimensions: '',
    weight: '',
    rawCost: '',
    laborHours: '',
    price: '',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    ondcPublished: true,
    giCertified: true
  });
  const fileInputRef = useRef(null);

  // Edit Product Modal State
  const [productToEdit, setProductToEdit] = useState(null);
  const editFileInputRef = useRef(null);

  // Spot Camera Modal State (Click photo on the spot)
  const [isSpotCameraOpen, setIsSpotCameraOpen] = useState(false);
  const [spotCameraTarget, setSpotCameraTarget] = useState('new'); // 'new' | 'edit' | 'quick-snap'
  const spotVideoRef = useRef(null);
  const spotCanvasRef = useRef(null);
  const [spotCameraStream, setSpotCameraStream] = useState(null);
  const [spotCameraActive, setSpotCameraActive] = useState(false);
  const [spotCameraError, setSpotCameraError] = useState(null);

  // Embedded Pricing Suggestion Advisor State
  const [showPricingAdvisor, setShowPricingAdvisor] = useState(false);
  const [showSyncQueue, setShowSyncQueue] = useState(true);
  const [advisorRawCost, setAdvisorRawCost] = useState(160);
  const [advisorLaborHours, setAdvisorLaborHours] = useState(9);

  // Delete Confirmation Modal State
  const [productToDelete, setProductToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Live On-the-spot Camera Methods ---
  const startSpotCamera = async () => {
    setSpotCameraError(null);
    try {
      if (spotCameraStream) {
        spotCameraStream.getTracks().forEach(t => t.stop());
      }
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Your browser or device does not support camera access.');
      }

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch (e1) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
          });
        } catch (e2) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }
      }

      setSpotCameraStream(stream);
      setSpotCameraActive(true);
    } catch (err) {
      console.warn('Spot camera access error:', err);
      setSpotCameraError('Could not access camera. Please allow camera permissions in your browser or choose photo from your hard drive.');
      setSpotCameraActive(false);
    }
  };

  const stopSpotCamera = () => {
    if (spotCameraStream) {
      spotCameraStream.getTracks().forEach(t => t.stop());
      setSpotCameraStream(null);
    }
    setSpotCameraActive(false);
  };

  const openSpotCamera = (target = 'new') => {
    setSpotCameraTarget(target);
    setIsSpotCameraOpen(true);
    setTimeout(() => {
      startSpotCamera();
    }, 100);
  };

  const closeSpotCamera = () => {
    stopSpotCamera();
    setIsSpotCameraOpen(false);
  };

  // Bind spot camera stream to video element
  useEffect(() => {
    if (spotVideoRef.current && spotCameraStream && isSpotCameraOpen) {
      spotVideoRef.current.srcObject = spotCameraStream;
      spotVideoRef.current.play().catch(e => console.warn('Spot video playback:', e));
    }
  }, [spotCameraStream, isSpotCameraOpen]);

  // Clean up spot camera on unmount
  useEffect(() => {
    return () => {
      if (spotCameraStream) {
        spotCameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [spotCameraStream]);


  const captureSpotPhoto = () => {
    if (!spotVideoRef.current || !spotCanvasRef.current) return;
    const video = spotVideoRef.current;
    const canvas = spotCanvasRef.current;
    const width = video.videoWidth || 800;
    const height = video.videoHeight || 600;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    if (spotCameraTarget === 'new') {
      setNewProductForm(prev => ({
        ...prev,
        image: dataUrl,
        title: prev.title || `Captured Craft Shot ${Date.now().toString().slice(-4)}`
      }));
      showToast('📷 Photo captured and attached to new product!');
    } else if (spotCameraTarget === 'edit') {
      setProductToEdit(prev => ({
        ...prev,
        image: dataUrl
      }));
      showToast('📷 Photo captured and updated on product!');
    } else if (spotCameraTarget === 'quick-snap') {
      setNewProductForm(prev => ({
        ...prev,
        image: dataUrl,
        title: `Captured Craft Shot ${Date.now().toString().slice(-4)}`
      }));
      setIsAddModalOpen(true);
      showToast('📷 Photo snapped! Fill craft details to finish listing.');
    }

    closeSpotCamera();
  };

  // Categories for filtering
  const categories = ['ALL', 'Pottery & Terracotta', 'Handloom & Silk', 'Bell Metal Casting', 'Woodcraft & Lacquer'];

  // Filter products
  const filteredProducts = products.filter(prod => {
    const matchesSearch =
      prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || prod.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ONDC_LIVE' && prod.ondcPublished) ||
      (statusFilter === 'DRAFT' && !prod.ondcPublished);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Analytics Metrics
  const totalValue = products.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
  const ondcLiveCount = products.filter(p => p.ondcPublished).length;
  const giCertifiedCount = products.filter(p => p.giCertified).length;

  // Handle Photo Upload in Add Modal
  const handleModalPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewProductForm(prev => ({
        ...prev,
        image: event.target.result,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
      }));
    };
    reader.readAsDataURL(file);
  };

  // Submit Add Product Form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newProductForm.title) {
      alert('Please provide a product title');
      return;
    }

    const calculatedPrice = Number(newProductForm.price) ||
      (Number(newProductForm.rawCost || 150) + Number(newProductForm.laborHours || 8) * 140 * 1.25);

    const newProd = {
      id: 'prod-' + Date.now(),
      sku: `ART-${(newProductForm.category.split(' ')[0] || 'CRAFT').toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
      title: newProductForm.title,
      category: newProductForm.category,
      craftStyle: newProductForm.craftStyle || 'Artisan Handcrafted',
      material: newProductForm.material || 'Authentic Regional Materials',
      dimensions: newProductForm.dimensions || '25cm x 15cm x 10cm',
      weight: newProductForm.weight || '650g',
      rawCost: Number(newProductForm.rawCost) || 160,
      laborHours: Number(newProductForm.laborHours) || 8,
      price: Math.round(calculatedPrice),
      ondcPublished: Boolean(newProductForm.ondcPublished),
      giCertified: Boolean(newProductForm.giCertified),
      trustBadge: 'Artisan Verified (PM Vishwakarma)',
      image: newProductForm.image,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    if (onAddProduct) {
      onAddProduct(newProd);
    }
    setIsAddModalOpen(false);
    setNewProductForm({
      title: '',
      category: 'Pottery & Terracotta',
      craftStyle: 'Traditional Handmade',
      material: '',
      dimensions: '',
      weight: '',
      rawCost: '',
      laborHours: '',
      price: '',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      ondcPublished: true,
      giCertified: true
    });
    showToast(`✨ Product "${newProd.title}" successfully added to your catalogue!`);
  };

  // Handle Photo Upload in Edit Modal
  const handleEditPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !productToEdit) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setProductToEdit(prev => ({
        ...prev,
        image: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // One-click apply AI pricing suggestion in edit modal
  const handleApplySuggestedPriceInEdit = () => {
    if (!productToEdit) return;
    const suggested = getSuggestedPrice(productToEdit);
    setProductToEdit(prev => ({
      ...prev,
      price: suggested
    }));
    showToast(`💡 Applied AI Pricing Suggestion: ₹${suggested.toLocaleString('en-IN')}`);
  };

  // Save Edit Product Form
  const handleEditFormSubmit = (e) => {
    e.preventDefault();
    if (!productToEdit) return;

    const updated = {
      ...productToEdit,
      price: Number(productToEdit.price) || getSuggestedPrice(productToEdit),
      rawCost: Number(productToEdit.rawCost) || 0,
      laborHours: Number(productToEdit.laborHours) || 0
    };

    if (onEditProduct) {
      onEditProduct(updated);
    }
    showToast(`✏️ "${updated.title}" updated successfully!`);
    setProductToEdit(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    if (onRemoveProduct) {
      onRemoveProduct(productToDelete.id);
    }
    showToast(`🗑️ "${productToDelete.title}" removed from catalogue.`);
    setProductToDelete(null);
  };

  return (
    <div className="theme-main-panel p-5 sm:p-8 space-y-5">

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-900/90 border border-emerald-400 text-white px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md animate-bounce text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header with exact matching style from picture */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/35 flex-shrink-0">
            <Edit3 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
              Step 5: My Artisan Catalogue & Pricing
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct ONDC Inventory, Fair Living Wage Pricing Advisor & Edge Local Database
            </p>
          </div>
        </div>

        {/* Action Buttons from picture */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowPricingAdvisor(!showPricingAdvisor)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#182032] hover:bg-[#202b44] text-amber-300 border border-amber-500/25 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pricing Advisor</span>
          </button>

          <button
            onClick={() => openSpotCamera('quick-snap')}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#122438] hover:bg-[#18314e] text-cyan-300 border border-cyan-500/35 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Spot Camera Snap</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Embedded Pricing Advisor Modal / Drawer */}
      {showPricingAdvisor && (
        <div className="p-4 rounded-2xl bg-[#090e1b] border border-amber-500/30">
          <PricingCalculator
            initialCost={advisorRawCost}
            initialHours={advisorLaborHours}
            onPriceCalculated={(res) => {
              if (onPriceCalculated) onPriceCalculated(res);
            }}
          />
        </div>
      )}

      {/* Edge Offline-First SQLite Sync (Only in My Catalogue) */}
      {showSyncQueue && (
        <div className="pt-1">
          <OfflineSyncQueue isOnline={isOnline} />
        </div>
      )}

      {/* 2. Search & View Filter Bar from picture */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Search Input Pill with Cyan Magnifier */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title, SKU, craft category, materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0f1d] border border-slate-700/60 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70 transition-colors"
          />
        </div>

        {/* Status & View Mode Filters */}
        <div className="flex items-center gap-2.5">
          
          {/* Status Pill: All • Live Draft */}
          <div className="bg-[#0a0f1d] border border-slate-700/60 rounded-full p-1 flex items-center gap-1 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('ONDC_LIVE')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                statusFilter === 'ONDC_LIVE'
                  ? 'bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Live</span>
            </button>
            <button
              onClick={() => setStatusFilter('DRAFT')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                statusFilter === 'DRAFT'
                  ? 'bg-slate-800 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Draft
            </button>
          </div>

          {/* Grid | Table View Pill */}
          <div className="bg-[#0a0f1d] border border-slate-700/60 rounded-full p-1 flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. Category Filter Chips from picture */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'bg-[#0e1628] border border-slate-700/60 text-slate-300 hover:text-white'
          }`}
        >
          All Crafts ({products.length})
        </button>
        {categories.filter(c => c !== 'ALL').map(cat => {
          const count = products.filter(p => p.category === cat).length;
          const emojiMap = {
            'Pottery & Terracotta': '🏺',
            'Handloom & Silk': '👘',
            'Bell Metal Casting': '🔔',
            'Woodcraft & Lacquer': '🪵',
            'Blue Pottery': '🍶',
            'Traditional Painting': '🎨',
            'Metalcraft & Inlay': '⚔️',
            'Temple Arts & Gold Leaf': '✨',
            'Leathercraft': '👞',
            'Textile Art': '🧵'
          };
          const emoji = emojiMap[cat] || '✨';
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'bg-[#0e1628] border border-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              <span>{emoji}</span>
              <span>{cat} {count > 0 ? `(${count})` : ''}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Product List: Empty State or Exact Grid from picture */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#090e1b] border border-slate-800">
          <Package className="w-12 h-12 text-gray-500 mx-auto mb-3 animate-pulse" />
          <h4 className="text-base font-bold text-white mb-1">{t('catalogue.noProductsFound', 'No Listed Products Found')}</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            {searchQuery || selectedCategory !== 'ALL' || statusFilter !== 'ALL'
              ? 'No products matched your search filters. Try clearing your search or category filter.'
              : 'Your catalogue is currently empty. Click below to add your first handcrafted product!'}
          </p>
          <div className="flex justify-center gap-2">
            {(searchQuery || selectedCategory !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setStatusFilter('ALL');
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 hover:text-white"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-black flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Product</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* EXACT PRODUCT CARDS GRID FROM PICTURE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="artisan-product-card flex flex-col justify-between"
            >
              <div>
                {/* Product Image Area with exact floating badges */}
                <div className="relative h-48 sm:h-52 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1626] via-transparent to-black/35" />

                  {/* Top Floating Badges from picture */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    {product.giCertified ? (
                      <span className="bg-amber-500 text-black font-extrabold text-[10px] tracking-wide px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow uppercase">
                        <span>🏷️</span> GI Tagged
                      </span>
                    ) : <div />}

                    <button
                      onClick={() => onToggleOndcStatus && onToggleOndcStatus(product.id)}
                      className={`pointer-events-auto text-[10px] font-extrabold tracking-wide px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow transition-all ${
                        product.ondcPublished
                          ? 'bg-[#10b981] text-black'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                      title="Toggle ONDC live broadcast"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${product.ondcPublished ? 'bg-black' : 'bg-amber-400'}`} />
                      <span>{product.ondcPublished ? 'ONDC LIVE' : 'DRAFT'}</span>
                    </button>
                  </div>

                  {/* Bottom Overlays on Image from picture */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="bg-black/85 backdrop-blur-sm text-amber-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-white/5">
                      {product.sku}
                    </span>
                    <span className="bg-black/85 backdrop-blur-sm text-slate-300 text-[10px] px-2 py-0.5 rounded border border-white/5">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Card Title & Specs Details from picture */}
                <div className="px-3 pt-3">
                  <h3 className="font-bold text-sm text-white line-clamp-1" title={product.title}>
                    {product.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {product.material || product.craftStyle || 'Natural Artisanal Material'}
                  </p>

                  {/* Specs Line with Emoji Icons */}
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span>📐</span> {product.dimensions || 'Standard'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span>⚖️</span> {product.weight || '1,000g'}
                    </span>
                  </div>

                  {/* Cost / Labor Breakdown Box from picture */}
                  <div className="bg-[#0a0f1d] border border-slate-800/90 rounded-xl p-2.5 mt-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Raw Cost</div>
                      <div className="text-xs font-bold text-slate-200 font-mono">₹{product.rawCost || 160}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Labor Time</div>
                      <div className="text-xs font-bold text-cyan-400 font-mono">{product.laborHours || 8} Hours</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Verified Fair Price & Actions from picture */}
              <div className="px-3 pt-2.5 pb-3">
                <div className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                  VERIFIED FAIR PRICE
                </div>
                <div className="flex items-end justify-between mt-0.5">
                  <div className="text-xl font-bold text-[#e5a93c] font-serif font-heading">
                    ₹{Number(product.price || product.suggestedPrice || 1500).toLocaleString('en-IN')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Edit Product"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/70 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl bg-[#090e1b] border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300 border-collapse">
            <thead className="bg-black/40 text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-3">Craft & SKU</th>
                <th className="p-3">Category & Material</th>
                <th className="p-3">Dimensions / Weight</th>
                <th className="p-3">Price & AI Suggestion</th>
                <th className="p-3">ONDC Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((product) => {
                const suggested = getSuggestedPrice(product);
                const isBelowFair = Number(product.price) < suggested;
                return (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-white truncate max-w-[200px]" title={product.title}>
                            {product.title}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {product.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-200">{product.category}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[180px]">{product.material}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      <div>{product.dimensions}</div>
                      <div className="text-gray-500 text-[10px]">{product.weight}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-white font-heading text-xs">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">Listed</span>
                      </div>
                      <div className="text-[11px] text-amber-300 font-mono flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3 h-3 text-[var(--color-saffron)]" />
                        <span>AI Sug: ₹{suggested.toLocaleString('en-IN')}</span>
                        {isBelowFair && (
                          <span className="text-[9px] text-amber-400 bg-amber-500/15 px-1 py-0.2 rounded border border-amber-500/30">
                            Below Fair
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => onToggleOndcStatus && onToggleOndcStatus(product.id)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${product.ondcPublished
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-amber-300 border-amber-500/40'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${product.ondcPublished ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span>{product.ondcPublished ? 'Live on ONDC' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setProductToEdit({ ...product })}
                          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-all"
                          title="Edit product details & pricing"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Remove product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ADD NEW PRODUCT MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-xl p-6 relative border border-white/20 shadow-2xl my-8">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-terracotta)] flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    Add Product to Artisan Catalogue
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Create a new verified craft listing for ONDC marketplace
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">

              {/* Image Upload / Preview Box */}
              <div>
                <label className="block text-gray-300 font-medium mb-1.5">
                  Product Image (Camera snapshot or Hard Drive photo)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleModalPhotoUpload}
                />
                <div className="flex gap-3 items-center">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-black border border-white/20 flex-shrink-0 relative">
                    <img
                      src={newProductForm.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openSpotCamera('new')}
                        className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-md font-semibold"
                        title="Open device camera to snap product photo on the spot"
                      >
                        <Camera className="w-3.5 h-3.5 text-white" />
                        <span>Click Photo on Spot</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
                        title="Choose an existing image file from your computer"
                      >
                        <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Upload from Hard Disk</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Snap on the spot with camera or select a high-res photo from your hard disk.
                    </p>
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GI-Tagged Terracotta Vase"
                    value={newProductForm.title}
                    onChange={(e) => setNewProductForm({ ...newProductForm, title: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--color-saffron)]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Craft Category
                  </label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--color-saffron)]"
                  >
                    <option value="Pottery & Terracotta">Pottery & Terracotta</option>
                    <option value="Handloom & Silk">Handloom & Silk</option>
                    <option value="Bell Metal Casting">Bell Metal Casting</option>
                    <option value="Woodcraft & Lacquer">Woodcraft & Lacquer</option>
                    <option value="Bamboo & Cane">Bamboo & Cane</option>
                    <option value="Leather Craft">Leather Craft</option>
                  </select>
                </div>
              </div>

              {/* Material & Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Material Used
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alluvial River Clay"
                    value={newProductForm.material}
                    onChange={(e) => setNewProductForm({ ...newProductForm, material: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--color-saffron)]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Dimensions & Weight
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 30cm x 18cm"
                      value={newProductForm.dimensions}
                      onChange={(e) => setNewProductForm({ ...newProductForm, dimensions: e.target.value })}
                      className="w-2/3 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--color-saffron)]"
                    />
                    <input
                      type="text"
                      placeholder="e.g. 900g"
                      value={newProductForm.weight}
                      onChange={(e) => setNewProductForm({ ...newProductForm, weight: e.target.value })}
                      className="w-1/3 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--color-saffron)]"
                    />
                  </div>
                </div>
              </div>

              {/* Cost & Price Calculation */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-black/30 border border-white/10">
                <div>
                  <label className="block text-gray-400 text-[11px] mb-1">
                    Raw Cost (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="160"
                    value={newProductForm.rawCost}
                    onChange={(e) => setNewProductForm({ ...newProductForm, rawCost: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[11px] mb-1">
                    Labor Hours
                  </label>
                  <input
                    type="number"
                    placeholder="8"
                    value={newProductForm.laborHours}
                    onChange={(e) => setNewProductForm({ ...newProductForm, laborHours: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[11px] mb-1 font-semibold text-emerald-400">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="1850"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                    className="w-full bg-black/40 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-emerald-300 font-bold"
                  />
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="checkbox"
                    checked={newProductForm.ondcPublished}
                    onChange={(e) => setNewProductForm({ ...newProductForm, ondcPublished: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Publish directly to ONDC Open Network</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="checkbox"
                    checked={newProductForm.giCertified}
                    onChange={(e) => setNewProductForm({ ...newProductForm, giCertified: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>GI Certified / Heritage Stamp</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5 font-bold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save to Catalogue</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-5 border border-red-500/30 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Remove Product from Catalogue?
                </h4>
                <p className="text-xs text-gray-400">
                  This action will unpublish the craft from ONDC and delete it from your active catalogue.
                </p>
              </div>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/10 my-3 flex items-center gap-3">
              <img
                src={productToDelete.image}
                alt={productToDelete.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="text-xs truncate">
                <div className="font-bold text-white truncate">{productToDelete.title}</div>
                <div className="text-gray-400 font-mono text-[10px]">{productToDelete.sku} • ₹{productToDelete.price}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-4">
              <button
                onClick={() => setProductToDelete(null)}
                className="btn-secondary px-3.5 py-1.5 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all"
              >
                Yes, Remove Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL --- */}
      {productToEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-xl p-6 relative border border-amber-500/30 shadow-2xl my-8">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                    <span>Edit Product Listing</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                      {productToEdit.sku}
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Update craft specifications, pricing suggestions, and ONDC status
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProductToEdit(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditFormSubmit} className="space-y-4 text-xs">

              {/* Image Preview & Upload */}
              <div>
                <label className="block text-gray-300 font-medium mb-1.5">
                  Product Image
                </label>
                <input
                  type="file"
                  ref={editFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditPhotoUpload}
                />
                <div className="flex gap-3 items-center">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-black border border-white/20 flex-shrink-0 relative">
                    <img
                      src={productToEdit.image}
                      alt={productToEdit.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openSpotCamera('edit')}
                        className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-md font-semibold"
                        title="Open device camera to update product photo on the spot"
                      >
                        <Camera className="w-3.5 h-3.5 text-white" />
                        <span>Click Photo on Spot</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
                        title="Select a replacement image file from your computer"
                      >
                        <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Change from Hard Disk</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Click a live photo using your camera or choose a high-resolution photo from your hard disk.
                    </p>
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={productToEdit.title}
                    onChange={(e) => setProductToEdit({ ...productToEdit, title: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--color-saffron)]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Craft Category
                  </label>
                  <select
                    value={productToEdit.category}
                    onChange={(e) => setProductToEdit({ ...productToEdit, category: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--color-saffron)]"
                  >
                    <option value="Pottery & Terracotta">Pottery & Terracotta</option>
                    <option value="Handloom & Silk">Handloom & Silk</option>
                    <option value="Bell Metal Casting">Bell Metal Casting</option>
                    <option value="Woodcraft & Lacquer">Woodcraft & Lacquer</option>
                    <option value="Bamboo & Cane">Bamboo & Cane</option>
                    <option value="Leather Craft">Leather Craft</option>
                  </select>
                </div>
              </div>

              {/* Material & Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Material Used
                  </label>
                  <input
                    type="text"
                    value={productToEdit.material || ''}
                    onChange={(e) => setProductToEdit({ ...productToEdit, material: e.target.value })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--color-saffron)]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Dimensions & Weight
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={productToEdit.dimensions || ''}
                      onChange={(e) => setProductToEdit({ ...productToEdit, dimensions: e.target.value })}
                      className="w-2/3 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--color-saffron)]"
                    />
                    <input
                      type="text"
                      value={productToEdit.weight || ''}
                      onChange={(e) => setProductToEdit({ ...productToEdit, weight: e.target.value })}
                      className="w-1/3 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--color-saffron)]"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Suggestion & Cost Inputs */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3">

                {/* AI Pricing Suggestion Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--color-saffron)]" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-300 block">
                        AI Pricing Suggestion
                      </span>
                      <span className="text-sm font-extrabold text-white font-mono">
                        ₹{getSuggestedPrice(productToEdit).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-1.5">
                        (Raw ₹{productToEdit.rawCost || 0} + {productToEdit.laborHours || 0}h @ ₹145/hr + 25%)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplySuggestedPriceInEdit}
                    className="btn-primary px-3 py-1 text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Apply Suggestion</span>
                  </button>
                </div>

                {/* Cost Inputs */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">
                      Raw Cost (₹)
                    </label>
                    <input
                      type="number"
                      value={productToEdit.rawCost || ''}
                      onChange={(e) => setProductToEdit({ ...productToEdit, rawCost: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">
                      Labor Hours
                    </label>
                    <input
                      type="number"
                      value={productToEdit.laborHours || ''}
                      onChange={(e) => setProductToEdit({ ...productToEdit, laborHours: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1 font-semibold text-emerald-400">
                      Listed Price (₹)
                    </label>
                    <input
                      type="number"
                      value={productToEdit.price || ''}
                      onChange={(e) => setProductToEdit({ ...productToEdit, price: e.target.value })}
                      className="w-full bg-black/60 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-emerald-300 font-bold"
                    />
                  </div>
                </div>

              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="checkbox"
                    checked={productToEdit.ondcPublished}
                    onChange={(e) => setProductToEdit({ ...productToEdit, ondcPublished: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Active on ONDC Network</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="checkbox"
                    checked={productToEdit.giCertified}
                    onChange={(e) => setProductToEdit({ ...productToEdit, giCertified: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>GI Certified Seal</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setProductToEdit(null)}
                  className="btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5 font-bold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- SPOT CAMERA MODAL (CLICK PHOTO ON THE SPOT) --- */}
      {isSpotCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-lg p-5 relative border border-amber-500/40 shadow-2xl space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-terracotta)] flex items-center justify-center text-white">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                    <span>Click Photo on the Spot</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live Camera
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {spotCameraTarget === 'edit'
                      ? 'Updating photo for current product'
                      : spotCameraTarget === 'quick-snap'
                        ? 'Snapping craft to create new catalogue listing'
                        : 'Attaching photo to new catalogue product'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeSpotCamera}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Viewfinder Box */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/15 aspect-[4/3] flex items-center justify-center">
              {spotCameraError ? (
                <div className="text-center p-6 space-y-3">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-xs text-red-300 max-w-xs mx-auto">
                    {spotCameraError}
                  </p>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={startSpotCamera}
                      className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera</span>
                    </button>
                    <button
                      onClick={() => {
                        closeSpotCamera();
                        if (spotCameraTarget === 'edit') editFileInputRef.current?.click();
                        else fileInputRef.current?.click();
                      }}
                      className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t('studio.uploadDisk', 'Upload from Hard Disk')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={spotVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Visual Guide Overlay */}
                  <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-2xl">
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] text-emerald-400 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>LIVE FEED</span>
                    </div>

                    {/* Corner Reticles */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[var(--color-saffron)]" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[var(--color-saffron)]" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[var(--color-saffron)]" />
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[var(--color-saffron)]" />

                    {/* Center Focus Box */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 border border-white/30 rounded-xl" />
                    </div>
                  </div>
                </>
              )}

              {/* Hidden canvas for snapshot capture */}
              <canvas ref={spotCanvasRef} className="hidden" />
            </div>

            {/* Instruction Tip */}
            <p className="text-[11px] text-gray-400 text-center">
              {t('camera.subtitle', 'Position your craft in the center. Ensure good lighting for highest quality marketplace listing.')}
            </p>

            {/* Shutter / Capture Button */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={closeSpotCamera}
                className="btn-secondary px-4 py-2 text-xs"
              >
                {t('common.cancel', 'Cancel')}
              </button>

              <button
                type="button"
                onClick={captureSpotPhoto}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-[var(--color-terracotta)] text-white font-bold text-xs flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>{t('camera.captureBtn', 'Click Photo Now (Capture)')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
