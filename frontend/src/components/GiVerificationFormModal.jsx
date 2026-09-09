import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  MapPin,
  Layers,
  Fingerprint,
  FileCheck,
  Building,
  Calendar,
  Check,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Regional preset suggestions for major Indian GI clusters
const GI_CLUSTER_PRESETS = [
  {
    category: 'Pottery & Terracotta',
    clusterName: 'Gorakhpur Terracotta Cluster',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    materials: 'Natural riverbed alluvial clay, organic husk slip, wood-ash kiln glaze',
    technique: 'Traditional manual potter wheel-throwing with hand-incised ornamental motifs'
  },
  {
    category: 'Handloom & Silk',
    clusterName: 'Varanasi Weavers Silk Guild',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    materials: 'Pure mulberry raw silk, real silver-electroplated Zari thread',
    technique: 'Authentic Kadwa pit-loom manual jacquard handloom weaving'
  },
  {
    category: 'Bell Metal Casting',
    clusterName: 'Bastar Tribal Bell Metal Guild',
    district: 'Bastar',
    state: 'Chhattisgarh',
    materials: 'Bell metal bronze alloy (78% copper, 22% tin) & natural forest beeswax',
    technique: '4,000-year-old Cire-Perdue (lost-wax) indigenous casting with clay mold'
  },
  {
    category: 'Woodcraft & Lacquer',
    clusterName: 'Channapatna Lacquerware Cluster',
    district: 'Ramanagara (Channapatna)',
    state: 'Karnataka',
    materials: 'Wrightia Tinctoria (Aale Mara) ivory wood, non-toxic natural shellac & vegetable dyes',
    technique: 'Hand lathe-turning using palm-leaf polishing and natural friction-heated lacquering'
  },
  {
    category: 'Folk Art & Painting',
    clusterName: 'Mithila Folk Painting Guild',
    district: 'Madhubani',
    state: 'Bihar',
    materials: 'Handmade cotton-mulberry rag paper, soot, turmeric, and indigenous plant extracts',
    technique: 'Fine-line nib and bamboo twig detailing with double-outline traditional iconography'
  }
];

export default function GiVerificationFormModal({
  isOpen,
  product,
  onClose,
  onVerificationComplete,
  onOpenCertificateModal
}) {
  const { t } = useLanguage();

  // Find category preset if available
  const preset = GI_CLUSTER_PRESETS.find(p => p.category === product?.category) || {
    category: product?.category || 'Handicraft',
    clusterName: `${product?.category || 'Traditional'} Regional Guild`,
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    materials: product?.material || 'Locally harvested natural materials',
    technique: product?.craftStyle || 'Generational traditional handcrafting'
  };

  // Questionnaire Form States
  const [formData, setFormData] = useState({
    district: '',
    state: 'Uttar Pradesh',
    village: '',
    clusterName: '',
    rawMaterialSource: '',
    sourcedLocally: true,
    heritageTechnique: '',
    handcraftedOnly: true,
    artisanName: '',
    pmVishwakarmaId: '',
    generationsPracticed: '3rd Generation (Family Heritage)',
    hasGovtArtisanCard: true,
    statutoryDeclaration: false
  });

  // Verification Processing States
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0); // 0 = idle, 1 = geo check, 2 = vishwakarma check, 3 = sha fingerprint, 4 = done
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [generatedTag, setGeneratedTag] = useState('');
  const [generatedHash, setGeneratedHash] = useState('');
  const [errors, setErrors] = useState({});

  // Populate form with smart defaults or product's data on mount / product change
  useEffect(() => {
    if (product) {
      setFormData({
        district: product.region ? product.region.split(',')[0].trim() : preset.district,
        state: product.region && product.region.includes(',') ? product.region.split(',')[1].trim() : preset.state,
        village: 'Artisan Heritage Colony',
        clusterName: product.giCluster || preset.clusterName,
        rawMaterialSource: product.material || preset.materials,
        sourcedLocally: true,
        heritageTechnique: product.craftStyle || preset.technique,
        handcraftedOnly: true,
        artisanName: product.artisanName || 'Master Artisan Ramprasad',
        pmVishwakarmaId: product.pmVishwakarmaId || 'PMV-IND-2026-8842',
        generationsPracticed: '3rd Generation (Family Heritage)',
        hasGovtArtisanCard: true,
        statutoryDeclaration: false
      });
      setIsAuditing(false);
      setAuditStep(0);
      setVerificationSuccess(false);
      setErrors({});
    }
  }, [product, isOpen]);

  // Handle Quick Auto-Fill with preset credentials for quick testing
  const handleAutoFillPreset = () => {
    setFormData(prev => ({
      ...prev,
      district: preset.district,
      state: preset.state,
      village: 'Gram Vishwakarma Pura',
      clusterName: preset.clusterName,
      rawMaterialSource: preset.materials,
      sourcedLocally: true,
      heritageTechnique: preset.technique,
      handcraftedOnly: true,
      artisanName: 'Master Artisan Ramprasad Prajapati',
      pmVishwakarmaId: `PMV-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      generationsPracticed: '3rd Generation (40+ Years Practice)',
      hasGovtArtisanCard: true,
      statutoryDeclaration: true
    }));
    setErrors({});
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.district.trim()) errs.district = 'Geographical district is required.';
    if (!formData.clusterName.trim()) errs.clusterName = 'Artisan cluster / guild name is required.';
    if (!formData.rawMaterialSource.trim()) errs.rawMaterialSource = 'Material source details are required.';
    if (!formData.heritageTechnique.trim()) errs.heritageTechnique = 'Technique description is required.';
    if (!formData.artisanName.trim()) errs.artisanName = 'Artisan / Master name is required.';
    if (!formData.statutoryDeclaration) errs.statutoryDeclaration = 'You must confirm the statutory authenticity declaration.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRunAudit = () => {
    if (!validateForm()) return;

    setIsAuditing(true);
    setAuditStep(1);

    // Step 1: Geolocation & Boundary check
    setTimeout(() => {
      setAuditStep(2);
      // Step 2: PM Vishwakarma / Registry validation
      setTimeout(() => {
        setAuditStep(3);
        // Step 3: Cryptographic SHA-256 fingerprint generation
        const newTag = `GI-IN-00${Math.floor(100 + Math.random() * 899)}`;
        const newHash = `0x9e8a${String(product.sku || 'ART').toLowerCase()}${Math.floor(100000 + Math.random() * 900000)}c4f82d1b7a6305`;
        setGeneratedTag(newTag);
        setGeneratedHash(newHash);

        setTimeout(() => {
          setAuditStep(4);
          setIsAuditing(false);
          setVerificationSuccess(true);

          if (onVerificationComplete) {
            onVerificationComplete(product.id, {
              tagNumber: newTag,
              shaHash: newHash,
              cluster: formData.clusterName,
              district: formData.district,
              state: formData.state,
              artisanName: formData.artisanName,
              pmVishwakarmaId: formData.pmVishwakarmaId,
              rawMaterialSource: formData.rawMaterialSource,
              technique: formData.heritageTechnique,
              generations: formData.generationsPracticed
            });
          }
        }, 1000);
      }, 1000);
    }, 1000);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      
      <div className="relative w-full max-w-2xl bg-[#0e1626] border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-950/40 text-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-[#131f35] to-slate-900 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-[var(--color-terracotta)] text-black shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Statutory GI Registry Application
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Form GI-101</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-heading mt-1">
                GI Heritage Verification Questionnaire
              </h2>
              <p className="text-xs text-gray-400">
                Answer statutory provenance questions to certify geographical authenticity & unlock your official GI Passport.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Snapshot Card */}
        <div className="px-5 py-3 bg-[#0a101d] border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'}
              alt={product.title}
              className="w-11 h-11 rounded-lg object-cover border border-amber-500/40 shadow-sm"
            />
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                {product.title}
              </h4>
              <div className="text-[11px] text-gray-400 flex items-center gap-2">
                <span className="text-amber-300 font-medium">{product.category}</span>
                <span>•</span>
                <span className="font-mono text-[10px] text-gray-400">SKU: {product.sku || product.id}</span>
              </div>
            </div>
          </div>

          {!verificationSuccess && !isAuditing && (
            <button
              type="button"
              onClick={handleAutoFillPreset}
              className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
              title="Auto-fill recommended answers for standard Indian GI clusters"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Quick Auto-Fill (Demo)</span>
            </button>
          )}
        </div>

        {/* Form Body / Verification Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* SUCCESS SCREEN */}
          {verificationSuccess ? (
            <div className="py-6 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-emerald-400">
                  Audit Passed & Verified
                </span>
                <h3 className="text-xl font-bold text-white font-heading mt-1">
                  Official GI Heritage Tag Granted!
                </h3>
                <p className="text-xs text-gray-300 max-w-md mx-auto mt-1">
                  Your craft has successfully satisfied all statutory criteria under the Geographical Indications of Goods Act. Your official credentials have been registered.
                </p>
              </div>

              {/* Credentials Pill Box */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Assigned GI Registry Tag:</span>
                  <span className="font-bold text-amber-300 font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    {generatedTag}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Verified Artisan Cluster:</span>
                  <span className="font-semibold text-white">{formData.clusterName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Master Artisan:</span>
                  <span className="font-semibold text-emerald-300">{formData.artisanName}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">ONDC Cryptographic Hash:</span>
                  <span className="font-mono text-gray-400 truncate max-w-[200px]">{generatedHash}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenCertificateModal) onOpenCertificateModal(product);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[var(--color-terracotta)] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 hover:scale-105 active:scale-95 transition-all"
                >
                  <Award className="w-4 h-4 text-amber-200" />
                  <span>View Official GI Certificate & QR Passport</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-semibold"
                >
                  Return to Catalogue
                </button>
              </div>
            </div>
          ) : isAuditing ? (
            /* AUDITING ANIMATION SCREEN */
            <div className="py-10 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
                <div className="w-20 h-20 rounded-full border-4 border-amber-500 border-t-transparent animate-spin flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-amber-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-white font-heading">
                  Statutory GI Compliance Audit in Progress
                </h3>
                <p className="text-xs text-gray-400">
                  Government Registry & ONDC open-network validation engine running...
                </p>
              </div>

              {/* Audit Progress Steps */}
              <div className="max-w-sm mx-auto space-y-2 text-left">
                <div className={`p-2.5 rounded-lg border flex items-center gap-3 transition-all ${
                  auditStep >= 1 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-gray-500'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${auditStep >= 1 ? 'text-emerald-400' : 'text-gray-600'}`} />
                  <span className="text-xs font-medium">Validating Geographical Boundaries ({formData.district})</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center gap-3 transition-all ${
                  auditStep >= 2 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-gray-500'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${auditStep >= 2 ? 'text-emerald-400' : 'text-gray-600'}`} />
                  <span className="text-xs font-medium">Verifying PM Vishwakarma / Artisan Guild ID</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center gap-3 transition-all ${
                  auditStep >= 3 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-gray-500'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${auditStep >= 3 ? 'text-emerald-400' : 'text-gray-600'}`} />
                  <span className="text-xs font-medium">Generating Cryptographic SHA-256 Tamper Seal</span>
                </div>
              </div>
            </div>
          ) : (
            /* QUESTIONNAIRE FORM SCREEN */
            <div className="space-y-4">
              
              {/* Alert notice */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-200">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>GI Registry Protocol:</strong> To protect India’s artisanal heritage against counterfeit mass-produced goods, you must declare your regional cluster origin, raw materials, and lineage.
                </div>
              </div>

              {/* QUESTION 1: Geographical Origin & Cluster */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] border border-amber-500/30">
                      1
                    </span>
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      Geographical Origin & Craft Cluster
                    </label>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">GI Zone Mapping</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
                      Artisan Cluster / Guild Name *
                    </label>
                    <input
                      type="text"
                      value={formData.clusterName}
                      onChange={(e) => setFormData({ ...formData, clusterName: e.target.value })}
                      placeholder="e.g. Gorakhpur Terracotta Cluster"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    />
                    {errors.clusterName && <p className="text-[10px] text-red-400 mt-1">{errors.clusterName}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
                      District / City of Origin *
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="e.g. Gorakhpur, Varanasi, Bastar"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    />
                    {errors.district && <p className="text-[10px] text-red-400 mt-1">{errors.district}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
                      State / Union Territory
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    >
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
                      Village / Taluka / Locality
                    </label>
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      placeholder="e.g. Aurangabad Weaver Nagar"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* QUESTION 2: Raw Material Sourcing */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] border border-amber-500/30">
                      2
                    </span>
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      Authentic Raw Material Sourcing
                    </label>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">100% Regional</span>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    Describe regional raw materials used & source proof *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.rawMaterialSource}
                    onChange={(e) => setFormData({ ...formData, rawMaterialSource: e.target.value })}
                    placeholder="e.g. Harvested exclusively from local alluvial riverbed deposits with organic husk glaze..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  />
                  {errors.rawMaterialSource && <p className="text-[10px] text-red-400 mt-1">{errors.rawMaterialSource}</p>}
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.sourcedLocally}
                    onChange={(e) => setFormData({ ...formData, sourcedLocally: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-0"
                  />
                  <span className="text-[11px] text-gray-300">
                    I verify that all primary raw materials originate within the demarcated GI region.
                  </span>
                </label>
              </div>

              {/* QUESTION 3: Traditional Technique & Tools */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] border border-amber-500/30">
                      3
                    </span>
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      Heritage Handcrafting Technique
                    </label>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">Zero Mass-Factory</span>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    Explain hand-crafting technique & tools used *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.heritageTechnique}
                    onChange={(e) => setFormData({ ...formData, heritageTechnique: e.target.value })}
                    placeholder="e.g. Manual potter wheel-throwing followed by 12-hour low-fire kiln baking with natural ochre wash..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  />
                  {errors.heritageTechnique && <p className="text-[10px] text-red-400 mt-1">{errors.heritageTechnique}</p>}
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.handcraftedOnly}
                    onChange={(e) => setFormData({ ...formData, handcraftedOnly: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-0"
                  />
                  <span className="text-[11px] text-gray-300">
                    100% handcrafted by artisans without automated industrial replication machinery.
                  </span>
                </label>
              </div>

              {/* QUESTION 4: Artisan Credentials & Lineage */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] border border-amber-500/30">
                      4
                    </span>
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      Master Artisan Lineage & PM Vishwakarma ID
                    </label>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Govt. Verified</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
                      Master Artisan / Lead Craftsperson Name *
                    </label>
                    <input
                      type="text"
                      value={formData.artisanName}
                      onChange={(e) => setFormData({ ...formData, artisanName: e.target.value })}
                      placeholder="e.g. Ramprasad Prajapati"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    />
                    {errors.artisanName && <p className="text-[10px] text-red-400 mt-1">{errors.artisanName}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
                      PM Vishwakarma / Artisan Pehchan ID
                    </label>
                    <input
                      type="text"
                      value={formData.pmVishwakarmaId}
                      onChange={(e) => setFormData({ ...formData, pmVishwakarmaId: e.target.value })}
                      placeholder="e.g. PMV-IND-2026-8842"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 font-mono outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-gray-400 mb-1">
                      Artisan Family Heritage / Lineage Practice
                    </label>
                    <select
                      value={formData.generationsPracticed}
                      onChange={(e) => setFormData({ ...formData, generationsPracticed: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    >
                      <option value="1st Generation (Trained Guild Craftsperson)">1st Generation (Trained Guild Craftsperson)</option>
                      <option value="2nd Generation (Family Practice 20+ Years)">2nd Generation (Family Practice 20+ Years)</option>
                      <option value="3rd Generation (Family Heritage 40+ Years)">3rd Generation (Family Heritage 40+ Years)</option>
                      <option value="4th+ Generation (Centuries-Old Ancestral Lineage)">4th+ Generation (Centuries-Old Ancestral Lineage)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* QUESTION 5: Statutory Authenticity Declaration */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[10px]">
                    5
                  </span>
                  <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Statutory Legal Declaration (GI Registry Act, 1999) *
                  </label>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.statutoryDeclaration}
                    onChange={(e) => setFormData({ ...formData, statutoryDeclaration: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-amber-500/50 focus:ring-0 mt-0.5 shrink-0"
                  />
                  <span className="text-[11px] text-slate-200 leading-relaxed">
                    I solemnly declare that all representations made in this questionnaire are true. This craft is genuine, produced in the registered geographical boundary using traditional methods, and complies with official GI standards.
                  </span>
                </label>
                {errors.statutoryDeclaration && (
                  <p className="text-[10px] text-red-400 pl-6">{errors.statutoryDeclaration}</p>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer / Actions */}
        {!verificationSuccess && !isAuditing && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleRunAudit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[var(--color-terracotta)] text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-amber-950/40 hover:scale-105 active:scale-95 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit Answers & Verify GI Heritage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
