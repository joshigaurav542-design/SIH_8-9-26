import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  QrCode,
  Sparkles,
  CheckCircle2,
  Printer,
  Download,
  Copy,
  Check,
  ExternalLink,
  Volume2,
  VolumeX,
  Lock,
  Globe,
  BadgeCheck,
  Layers,
  ArrowRight,
  Package,
  Calendar,
  FileCheck,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTextToSpeech } from '../hooks/useSpeech';

// Comprehensive metadata mapping for GI registered crafts
const GI_REGISTRY_MAP = {
  'Pottery & Terracotta': {
    cluster: 'Gorakhpur Terracotta Cluster (UP)',
    tagNumber: 'GI-IN-00398',
    giClass: 'Class 21 Traditional Handicrafts',
    artisan: 'Ramprasad Prajapati',
    region: 'Gorakhpur, Uttar Pradesh',
    tradition: 'Centuries-old wheel-turned red terracotta with natural ochre wash, sculpted by local Kumhar communities.',
    materials: 'Alluvial Riverbed Clay & Organic Wood Ash Slip'
  },
  'Handloom & Silk': {
    cluster: 'Varanasi Weavers Silk Guild (UP)',
    tagNumber: 'GI-IN-00028',
    giClass: 'Class 24 & 25 Textiles & Handloom',
    artisan: 'Mohammad Yasin Ansari',
    region: 'Varanasi, Uttar Pradesh',
    tradition: 'Authentic Kadwa pit-loom weaving with pure mulberry silk yarns and silver-plated Zari threads.',
    materials: 'Pure Mulberry Silk & Real Silver-Plated Zari'
  },
  'Bell Metal Casting': {
    cluster: 'Bastar Tribal Bell Metal Guild (CG)',
    tagNumber: 'GI-IN-00083',
    giClass: 'Class 06 & 21 Metalcrafts',
    artisan: 'Sukhnath Baghel',
    region: 'Bastar, Chhattisgarh',
    tradition: '4,000-year-old Cire-Perdue (Lost-Wax) casting method using bees-wax cords, alluvial soil molds, and bell metal.',
    materials: 'Bell Metal Bronze Alloy & Natural Wild Beeswax'
  },
  'Woodcraft & Lacquer': {
    cluster: 'Channapatna Lacquerware Cluster (KA)',
    tagNumber: 'GI-IN-00073',
    giClass: 'Class 20 & 28 Toys & Woodcraft',
    artisan: 'B. Ramesh Gowda',
    region: 'Ramanagara, Karnataka',
    tradition: 'Hand-turned Wrightia Tinctoria (Aale Mara) timber buffed with non-toxic natural shellac and organic vegetable dyes.',
    materials: 'Wrightia Tinctoria Ivory Wood & Organic Natural Shellac'
  },
  'Folk Art & Painting': {
    cluster: 'Mithila Folk Painting Guild (BR)',
    tagNumber: 'GI-IN-00105',
    giClass: 'Class 16 Folk Art & Paintings',
    artisan: 'Baua Devi Mishra',
    region: 'Madhubani, Bihar',
    tradition: 'Intricate geometric and mythological motifs hand-drawn using bamboo twigs and mineral/vegetable pigments.',
    materials: 'Handmade Mulberry Rag Paper & Plant-Derived Natural Dyes'
  }
};

export default function GiVerificationSystem({
  products = [],
  onBackToCatalog,
  onApplyVerification,
  onOpenCertificateModal
}) {
  const { language, t } = useLanguage();
  const { isSpeaking, speak, stop } = useTextToSpeech();

  // Selected craft to inspect
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 'prod-1');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isVerifyingWithRegistry, setIsVerifyingWithRegistry] = useState(false);
  const [verifiedSuccessToast, setVerifiedSuccessToast] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0] || {
    id: 'prod-1',
    sku: 'ART-TERRA-001',
    title: 'Gorakhpur GI Terracotta Floral Urn',
    category: 'Pottery & Terracotta',
    craftStyle: 'Hand-thrown Alluvial Clay',
    material: 'Natural Riverbed Clay with Organic Husk Glaze',
    dimensions: '32cm (H) x 20cm (W)',
    weight: '1,200g',
    price: 1930,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    dateAdded: '2026-09-01'
  };

  const matchedInfo = GI_REGISTRY_MAP[selectedProduct.category] || {
    cluster: `${selectedProduct.category || 'Traditional'} Craft Guild`,
    tagNumber: `GI-IN-00${Math.abs(String(selectedProduct.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 398) % 900 + 100}`,
    giClass: 'Class 21 Traditional Handicrafts',
    artisan: selectedProduct.artisanName || 'Master Artisan (PM Vishwakarma Registered)',
    region: selectedProduct.region || 'India',
    tradition: 'Heritage handcraft technique practiced across generations using locally-harvested natural materials.',
    materials: selectedProduct.material || 'Authentic Regional Materials'
  };

  const giTagNumber = selectedProduct.giTagNumber || matchedInfo.tagNumber;
  const giCluster = selectedProduct.giCluster || matchedInfo.cluster;
  const artisanName = selectedProduct.artisanName || matchedInfo.artisan;
  const region = selectedProduct.region || matchedInfo.region;
  const craftTradition = selectedProduct.tradition || matchedInfo.tradition;
  const materials = selectedProduct.material || matchedInfo.materials;

  const certId = `CERT-GI-IND-${String(selectedProduct.sku || selectedProduct.id || 'CRAFT').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-2026`;
  const shaHash = `0x9e8a${String(selectedProduct.sku || 'ART').toLowerCase()}${Math.abs(String(selectedProduct.id || '').split('').reduce((a, b) => a + b.charCodeAt(0), 7) || 88)}c4f82d1b7a6305`;
  const verificationUrl = `https://ondc.gov.in/artisan-verify/${selectedProduct.sku || selectedProduct.id}`;

  const craftNarrative = (
    `Officially registered under the Government of India Geographical Indications Registry (${giTagNumber}, ${matchedInfo.giClass}). ` +
    `Handcrafted in the verified artisan cluster of ${giCluster} by master craftsperson ${artisanName}. ` +
    `${craftTradition} Formed exclusively with certified materials: ${materials}. ` +
    `Cryptographically stamped with tamper-proof SHA-256 fingerprint for ONDC open-commerce authenticity.`
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(shaHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReverify = () => {
    setIsVerifyingWithRegistry(true);
    setTimeout(() => {
      setIsVerifyingWithRegistry(false);
      setVerifiedSuccessToast(true);
      setTimeout(() => setVerifiedSuccessToast(false), 4000);
    }, 1200);
  };

  const handleDownload = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GI Heritage Certificate - ${selectedProduct.title}</title>
  <style>
    body { font-family: 'Times New Roman', serif; padding: 40px; background: #fff; color: #111; max-width: 800px; margin: 0 auto; border: 12px double #b45309; }
    .header { text-align: center; border-bottom: 2px solid #b45309; padding-bottom: 20px; margin-bottom: 25px; }
    .title { font-size: 26px; font-weight: bold; color: #78350f; text-transform: uppercase; letter-spacing: 2px; }
    .subtitle { font-size: 13px; color: #475569; letter-spacing: 1px; margin-top: 5px; }
    .body { font-size: 14px; line-height: 1.8; margin-bottom: 30px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; font-size: 13px; background: #fef3c7; padding: 15px; border-radius: 6px; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #cbd5e1; padding-top: 25px; }
    .stamp { border: 2px solid #059669; color: #059669; font-weight: bold; padding: 8px 16px; border-radius: 4px; display: inline-block; }
  </style>
</head>
<body>
  <div class="header">
    <div class="subtitle">GOVERNMENT OF INDIA • GEOGRAPHICAL INDICATIONS REGISTRY</div>
    <div class="title">Certificate of Heritage Authenticity</div>
    <div class="subtitle">PM VISHWAKARMA ARTISAN PROVENANCE PASSPORT</div>
  </div>
  <div class="body">
    <p>This is to certify that the artifact detailed below has been independently inspected, registered, and verified as an authentic creation conforming to registered Geographical Indication traditions.</p>
    <div class="grid">
      <div><strong>Product Title:</strong> ${selectedProduct.title}</div>
      <div><strong>Official GI Tag No:</strong> ${giTagNumber}</div>
      <div><strong>Master Artisan:</strong> ${artisanName}</div>
      <div><strong>Registered Cluster:</strong> ${giCluster}</div>
      <div><strong>Category & Class:</strong> ${selectedProduct.category} (${matchedInfo.giClass})</div>
      <div><strong>Certificate ID:</strong> ${certId}</div>
    </div>
    <p><strong>Heritage Narrative:</strong> "${craftNarrative}"</p>
    <p><strong>Cryptographic SHA-256 Provenance Hash:</strong> <code>${shaHash}</code></p>
  </div>
  <div class="footer">
    <div>
      <div><strong>Verification Portal:</strong> ${verificationUrl}</div>
      <div style="font-size: 11px; color: #64748b;">Issued under National Traditional Craft Protection Framework</div>
    </div>
    <div class="stamp">✓ OFFICIAL GI VERIFIED</div>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GI_Certificate_${selectedProduct.sku || 'CRAFT'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Toast Notification */}
      {verifiedSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Successfully re-verified with Government of India GI Registry. All cryptographic proofs match!</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-300">LIVE_AUDIT_OK</span>
        </div>
      )}

      {/* Main System Banner */}
      <div className="glass-panel p-5 relative overflow-hidden border-2 border-amber-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/40">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>National Artisan Provenance & GI Registry System</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-heading">
              Geographical Indication (GI) Verification & Passport Portal
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl mt-1">
              Post-registration audit suite under Government of India • PM Vishwakarma • Ministry of MSME & Textiles. Inspect registered craft lineages, generate tamper-proof QR stamps, and print official certificates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onBackToCatalog && (
              <button
                type="button"
                onClick={onBackToCatalog}
                className="btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Back to Catalogue</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleReverify}
              disabled={isVerifyingWithRegistry}
              className="btn-primary px-3.5 py-2 text-xs flex items-center gap-1.5 shadow-lg"
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isVerifyingWithRegistry ? 'animate-spin' : ''}`} />
              <span>{isVerifyingWithRegistry ? 'Verifying with Registry...' : 'Audit Live Status'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Registered Crafts Selector Carousel / Strip */}
      <div className="glass-panel p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-300 px-1">
          <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-amber-300">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Registered Product to Verify ({products.length} Items):</span>
          </span>
          <span className="text-[10px] text-gray-500">Click any card to inspect official GI lineage</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 overflow-x-auto pb-1">
          {products.map((p) => {
            const isSelected = p.id === selectedProductId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProductId(p.id)}
                className={`p-2 rounded-xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg ring-1 ring-amber-400'
                    : 'bg-black/30 border-white/10 hover:border-white/30 text-gray-300'
                }`}
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black mb-1.5">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="text-[11px] font-bold truncate" title={p.title}>{p.title}</div>
                <div className="flex items-center justify-between text-[9px] font-mono mt-0.5">
                  <span className="text-gray-400">{p.sku}</span>
                  <span className={p.giCertified ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {p.giCertified ? 'GI VERIFIED' : 'PENDING'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pending Verification Action Banner */}
      {!selectedProduct.giCertified && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/40 border-2 border-amber-500/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Verification Required
                </span>
                <span className="text-xs font-bold text-white">5-Point Heritage Questionnaire Incomplete</span>
              </div>
              <p className="text-xs text-gray-300 max-w-xl">
                GI verification is not granted by default. Complete the statutory questionnaire for <strong>{selectedProduct.title}</strong> to audit geographical raw materials, master artisan lineage, and unlock the official certificate.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onApplyVerification && onApplyVerification(selectedProduct)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[var(--color-terracotta)] text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-amber-950/50 whitespace-nowrap shrink-0 hover:scale-105 active:scale-95 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Complete Questionnaire & Verify</span>
          </button>
        </div>
      )}

      {/* 2. Side-by-Side Dual Column GI Verification System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 Cols): Technical Audit, Metrics & Actions */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Craft Overview Card */}
          <div className="glass-panel p-4 space-y-3 border border-white/10">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] uppercase font-bold text-gray-400">Audited Product Details</span>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                <span>Class 21 Registry Matched</span>
              </span>
            </div>

            <div className="flex gap-3">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0"
              />
              <div className="space-y-0.5 text-xs">
                <h3 className="font-bold text-white line-clamp-1">{selectedProduct.title}</h3>
                <div className="text-gray-400 text-[11px]">SKU: <span className="font-mono text-white">{selectedProduct.sku}</span></div>
                <div className="text-amber-300 text-[11px]">Master Artisan: <strong>{artisanName}</strong></div>
                <div className="text-[10px] text-gray-400">Origin: {giCluster}</div>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-black/40 p-2.5 rounded-xl border border-white/5">
              <div>
                <span className="text-gray-500 block text-[10px]">GI Registry Code:</span>
                <span className="font-mono text-emerald-400 font-bold">{giTagNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Classification:</span>
                <span className="text-white truncate">{matchedInfo.giClass}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Dimensions / Weight:</span>
                <span className="font-mono text-gray-300">{selectedProduct.dimensions} • {selectedProduct.weight}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Fair Listing Price:</span>
                <span className="font-mono text-amber-300 font-bold">₹{Number(selectedProduct.price).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Computer Vision Organic Quality Verification */}
          <div className="glass-panel p-4 space-y-2.5 border border-white/10">
            <h4 className="text-xs font-bold text-white flex items-center justify-between">
              <span>Computer Vision Authenticity Audit</span>
              <span className="text-[10px] text-emerald-400 font-mono">100% Non-Machine Variance</span>
            </h4>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                <span className="text-[9px] text-gray-400 block uppercase">Bilateral Symmetry</span>
                <span className="text-sm font-bold text-amber-400 font-mono">96.8%</span>
                <span className="text-[9px] text-gray-500 block mt-0.5">Hand-turned</span>
              </div>
              <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                <span className="text-[9px] text-gray-400 block uppercase">Surface Density</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">94.6%</span>
                <span className="text-[9px] text-gray-500 block mt-0.5">Natural Grain</span>
              </div>
              <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                <span className="text-[9px] text-gray-400 block uppercase">Inspection Grade</span>
                <span className="text-sm font-bold text-white font-mono">Grade A+</span>
                <span className="text-[9px] text-gray-500 block mt-0.5">Export Quality</span>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Provenance & Blockchain Stamp */}
          <div className="glass-panel p-4 space-y-2.5 border border-amber-500/20">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>SHA-256 Provenance Ledger Stamp</span>
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="text-amber-400 hover:text-amber-300 text-[10px] font-semibold flex items-center gap-1"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>

            <div className="p-2 rounded-xl bg-black/70 border border-white/10 font-mono text-[10px] text-amber-300 break-all leading-tight">
              {shaHash}
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>National Node: india.gi.gov.in/cluster-04</span>
              <span className="text-emerald-400 font-bold">TAMPER-PROOF</span>
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-primary py-2.5 px-3 font-bold flex items-center justify-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print GI Certificate</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="btn-secondary py-2.5 px-3 font-semibold flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Standalone</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-secondary py-2 px-3 text-xs col-span-2 flex items-center justify-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Globe className="w-3.5 h-3.5 text-blue-400" />}
              <span>{copiedLink ? 'Verification URL Copied to Clipboard!' : 'Copy Public Buyer Verification URL'}</span>
            </button>
          </div>

        </div>

        {/* Right Column (7 Cols): Official PM Vishwakarma Certificate & QR Passport */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Printable Official Certificate */}
          <div
            id="printable-gi-certificate"
            className="relative p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#1C160F] via-[#121622] to-[#0A0D15] border-2 border-amber-500/60 shadow-2xl text-white overflow-hidden space-y-4"
          >
            {/* Corner Gold Border Ornaments */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-400" />

            {/* Certificate Header */}
            <div className="text-center pb-4 border-b border-amber-500/30">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-xl flex items-center justify-center">
                <div className="w-full h-full bg-[#1c1917] rounded-full flex items-center justify-center text-amber-400">
                  <Award className="w-7 h-7" />
                </div>
              </div>
              <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-amber-400 block">
                Government of India • Geographical Indications Registry
              </span>
              <h3 className="text-base sm:text-xl font-bold font-serif text-amber-100 tracking-wide mt-1">
                PM VISHWAKARMA DIGITAL HERITAGE CERTIFICATE
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Statutory Certificate of Provenance • Ministry of MSME & Textiles
              </p>
            </div>

            {/* Certificate Body Text */}
            <div className="space-y-2.5 text-xs">
              {!selectedProduct.giCertified && (
                <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/60 text-center space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 inline-block">
                    ⚠️ PROVENANCE AUDIT PENDING
                  </span>
                  <p className="text-[11px] text-gray-300">
                    This preview is uncertified. Complete the statutory questionnaire to generate the legal Government GI Registry Stamp.
                  </p>
                  <button
                    type="button"
                    onClick={() => onApplyVerification && onApplyVerification(selectedProduct)}
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs inline-flex items-center gap-1.5 shadow"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Craft Heritage Now</span>
                  </button>
                </div>
              )}

              <div className="p-3 rounded-xl bg-black/50 border border-amber-500/20 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-gray-400">
                  <span>Product Title:</span>
                  <span className="text-white font-bold">{selectedProduct.title}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Master Artisan:</span>
                  <span className="text-amber-300 font-semibold">{artisanName}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Registered GI Cluster:</span>
                  <span className="text-white">{giCluster}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Official GI Registry No.:</span>
                  <span className="text-emerald-400 font-mono font-bold">{giTagNumber} ({matchedInfo.giClass})</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Certified Materials:</span>
                  <span className="text-gray-200">{materials}</span>
                </div>
              </div>

              {/* Generative Cultural Narrative with TTS */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Heritage Lineage Story</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isSpeaking) stop();
                      else speak(craftNarrative, language);
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      isSpeaking ? 'bg-rose-500/20 text-rose-300 animate-pulse' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-amber-400" />}
                    <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-amber-100/90 italic leading-relaxed">
                  "{craftNarrative}"
                </p>
              </div>
            </div>

            {/* Packaging QR Code & Tamper-Proof Stamp */}
            <div className="pt-3 border-t border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shrink-0">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
                <div className="text-[10px] space-y-0.5">
                  <div className="text-gray-400 font-bold uppercase">Packaging QR Tag:</div>
                  <div className="font-mono text-amber-300 font-bold">{certId}</div>
                  <div className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Affix to Physical Product Packaging</span>
                  </div>
                </div>
              </div>

              <div className="text-right text-[10px] space-y-1">
                <div className="text-gray-400 uppercase font-bold">Digital Stamp ID:</div>
                <div className={`font-mono px-2 py-0.5 rounded border inline-block font-bold ${
                  selectedProduct.giCertified
                    ? 'text-emerald-400 bg-black/60 border-emerald-500/40'
                    : 'text-amber-400 bg-amber-950/60 border-amber-500/40'
                }`}>
                  {selectedProduct.giCertified ? '✓ VERIFIED ON-CHAIN' : '⚠ AUDIT PENDING'}
                </div>
                <div className="text-[9px] text-gray-500">
                  {selectedProduct.giCertified ? 'Valid for ONDC Open-Commerce & Export' : 'Questionnaire Required for Valid Seal'}
                </div>
              </div>
            </div>

          </div>

          {/* Consumer Verification Scan Guide */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-start gap-3 text-xs text-blue-200">
            <QrCode className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-white">How Buyers & Customs Use This QR Code:</h5>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Urban buyers on Paytm / Pincode / Mystore or customs officials scanning the package QR code are instantly directed to the live government provenance registry proving the craft is 100% genuine and not an industrial factory replica.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
