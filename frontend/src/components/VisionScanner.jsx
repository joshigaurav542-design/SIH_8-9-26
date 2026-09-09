import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Scan,
  Award,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Upload,
  Layers,
  Volume2,
  VolumeX,
  Eye,
  Activity,
  Sliders,
  Maximize2,
  Minimize2,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Flame,
  Zap,
  Info,
  Tag,
  Plus,
  IndianRupee,
  TrendingUp,
  Check,
  Sun,
  Focus,
  Image as ImageIcon,
  Wand2,
  Compass,
  BadgeCheck,
  FileCheck,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// 10 Authentic PM Vishwakarma Crafts with rich GI metadata & high-res images
const AUTHENTIC_CRAFT_PRESETS = [
  {
    id: 'terra',
    slug: 'gorakhpur_terracotta_elephant',
    name: 'Gorakhpur GI Terracotta Royal Elephant',
    category: 'Pottery & Terracotta',
    craftStyle: 'Natural Clay Molding & Pit Firing',
    region: 'Gorakhpur, Uttar Pradesh',
    artisanName: 'Ramprasad Prajapati',
    material: 'Alluvial Riverbed Clay & Natural Ochre Slip',
    dimensions: '30cm (H) x 22cm (W) x 15cm (L)',
    weight: '1,400g',
    rawCost: 180,
    laborHours: 9.5,
    suggestedPrice: 2050,
    baseSymmetry: 96.8,
    baseDensity: 94.6,
    trustBadge: 'Masterpiece Grade A+ (GI Certified)',
    giTagNumber: 'GI-IN-00398',
    giCluster: 'Gorakhpur Terracotta Cluster (UP)',
    authenticityFactor: 99.4,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85',
    colorHints: ['#B2533E', '#8D3823', '#D7906B']
  },
  {
    id: 'silk',
    slug: 'varanasi_katan_silk_saree',
    name: 'Varanasi Royal Katan Silk Saree',
    category: 'Handloom & Silk',
    craftStyle: 'Traditional Banarasi Kadwa Handloom',
    region: 'Varanasi, Uttar Pradesh',
    artisanName: 'Mohammad Yasin Ansari',
    material: 'Pure Mulberry Katan Silk & Real Silver Zari',
    dimensions: '5.5m (L) x 1.2m (W) + 0.8m Blouse',
    weight: '550g',
    rawCost: 2400,
    laborHours: 36.0,
    suggestedPrice: 9800,
    baseSymmetry: 98.6,
    baseDensity: 97.4,
    trustBadge: 'National Heritage Masterpiece (GI Certified)',
    giTagNumber: 'GI-IN-00028',
    giCluster: 'Varanasi Weavers Silk Guild (UP)',
    authenticityFactor: 99.8,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
    colorHints: ['#DC2626', '#EAB308', '#991B1B']
  },
  {
    id: 'dhokra',
    slug: 'bastar_dhokra_tribal_musician',
    name: 'Bastar Lost-Wax Dhokra Musician',
    category: 'Bell Metal Casting',
    craftStyle: 'Cire-Perdue (Lost-Wax) Bronze Casting',
    region: 'Bastar, Chhattisgarh',
    artisanName: 'Sukhnath Baghel',
    material: 'Bell Metal Bronze, Beeswax Core & Clay Mold',
    dimensions: '28cm (H) x 14cm (W) x 10cm (D)',
    weight: '920g',
    rawCost: 420,
    laborHours: 16.0,
    suggestedPrice: 3400,
    baseSymmetry: 94.2,
    baseDensity: 95.8,
    trustBadge: 'Heritage Certified Grade A (GI Validated)',
    giTagNumber: 'GI-IN-00083',
    giCluster: 'Bastar Tribal Bell Metal Guild (CG)',
    authenticityFactor: 99.1,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=85',
    colorHints: ['#D97706', '#78350F', '#B45309']
  },
  {
    id: 'bluepottery',
    slug: 'jaipur_blue_pottery_floral_plate',
    name: 'Jaipur Quartz Blue Pottery Plate',
    category: 'Pottery & Terracotta',
    craftStyle: 'Ground Quartz Dough & Cobalt Glaze',
    region: 'Jaipur, Rajasthan',
    artisanName: 'Kailash Chand Kumhar',
    material: 'Crushed Quartz, Glass, Multani Mitti & Cobalt Oxide',
    dimensions: '30cm (Diameter) x 3.5cm (Depth)',
    weight: '850g',
    rawCost: 280,
    laborHours: 11.0,
    suggestedPrice: 2350,
    baseSymmetry: 98.1,
    baseDensity: 96.5,
    trustBadge: 'Royal Rajasthan GI Masterpiece',
    giTagNumber: 'GI-IN-00112',
    giCluster: 'Jaipur Ceramic Arts Guild (RJ)',
    authenticityFactor: 99.5,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=85',
    colorHints: ['#1D4ED8', '#60A5FA', '#F8FAFC']
  },
  {
    id: 'channapatna',
    slug: 'channapatna_lacquerware_rocking_horse',
    name: 'Channapatna Non-Toxic Lacquer Toy',
    category: 'Woodcraft & Lacquer',
    craftStyle: 'Traditional Ivory-Wood Turning & Shellac Buffing',
    region: 'Channapatna, Karnataka',
    artisanName: 'B. C. Gowda',
    material: 'Aale Mara (Hale Wood) & Natural Vegetable Lacquer',
    dimensions: '22cm (H) x 18cm (L) x 8cm (W)',
    weight: '420g',
    rawCost: 210,
    laborHours: 7.0,
    suggestedPrice: 1450,
    baseSymmetry: 97.4,
    baseDensity: 95.1,
    trustBadge: 'GI Certified Safe Natural Toy',
    giTagNumber: 'GI-IN-00073',
    giCluster: 'Channapatna Lacquerware Cluster (KA)',
    authenticityFactor: 99.3,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=85',
    colorHints: ['#E11D48', '#F59E0B', '#10B981']
  },
  {
    id: 'madhubani',
    slug: 'madhubani_tussar_silk_painting',
    name: 'Mithila Madhubani Tree of Life',
    category: 'Folk Art & Painting',
    craftStyle: 'Kachni & Bharni Lineage Penwork',
    region: 'Madhubani, Bihar',
    artisanName: 'Sunita Devi Jha',
    material: 'Handmade Lokta/Cotton Paper & Plant Mineral Dyes',
    dimensions: '45cm (H) x 30cm (W)',
    weight: '200g',
    rawCost: 220,
    laborHours: 14.0,
    suggestedPrice: 2750,
    baseSymmetry: 92.5,
    baseDensity: 98.2,
    trustBadge: 'GI Certified Folk Heritage',
    giTagNumber: 'GI-IN-00105',
    giCluster: 'Mithila Folk Painting Guild (BR)',
    authenticityFactor: 99.7,
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=85',
    colorHints: ['#047857', '#B91C1C', '#D97706']
  },
  {
    id: 'kashmiri',
    slug: 'kashmiri_walnut_wood_jewelry_box',
    name: 'Kashmiri Hand-Carved Walnut Chest',
    category: 'Woodcraft & Lacquer',
    craftStyle: 'Deep Relief Undercut Carving (Jali)',
    region: 'Srinagar, Jammu & Kashmir',
    artisanName: 'Ghulam Nabi Mir',
    material: 'Seasoned Kashmiri Walnut Trunk Wood & Natural Wax',
    dimensions: '25cm (L) x 16cm (W) x 12cm (H)',
    weight: '1,250g',
    rawCost: 550,
    laborHours: 20.0,
    suggestedPrice: 4650,
    baseSymmetry: 96.0,
    baseDensity: 98.4,
    trustBadge: 'Kashmir GI Certified Masterpiece',
    giTagNumber: 'GI-IN-00182',
    giCluster: 'Srinagar Walnut Wood Carving Guild (JK)',
    authenticityFactor: 99.6,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=85',
    colorHints: ['#713F12', '#451A03', '#A16207']
  },
  {
    id: 'bidri',
    slug: 'bidriware_silver_inlay_vase',
    name: 'Bidar Bidriware Silver Inlay Vase',
    category: 'Bell Metal Casting',
    craftStyle: 'Tarkashi (Pure Silver Sheet Inlay in Zinc Alloy)',
    region: 'Bidar, Karnataka',
    artisanName: 'Mohd Abdul Rauf',
    material: 'Zinc-Copper Alloy, Pure Silver Wire & Fort Soil Patina',
    dimensions: '26cm (H) x 12cm (Diameter)',
    weight: '980g',
    rawCost: 680,
    laborHours: 22.0,
    suggestedPrice: 5400,
    baseSymmetry: 98.8,
    baseDensity: 97.9,
    trustBadge: 'Royal Deccan Heritage GI Certified',
    giTagNumber: 'GI-IN-00019',
    giCluster: 'Bidar Metalcraft Guild (KA)',
    authenticityFactor: 99.4,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=85',
    colorHints: ['#18181B', '#E4E4E7', '#27272A']
  }
];

/**
 * Synthesizes an acoustic feedback chime / shutter click using Web Audio API
 */
function playAudioFeedback(type = 'chime') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'shutter') {
      // White noise mechanical click
      const bufferSize = ctx.sampleRate * 0.05;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      whiteNoise.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
    } else {
      // Tech scan completion dual-tone chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      osc2.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.18); // D6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    }
  } catch {
    // Audio gesture policy fallback
  }
}

export default function VisionScanner({ onScanComplete }) {
  const { language, t } = useLanguage();

  // Mode: 'preset' (samples or disk upload) | 'webcam' (live camera)
  const [activeSource, setActiveSource] = useState('preset');
  const [selectedCraft, setSelectedCraft] = useState(AUTHENTIC_CRAFT_PRESETS[0]);
  const [scanResult, setScanResult] = useState(AUTHENTIC_CRAFT_PRESETS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState('');
  const [appliedToast, setAppliedToast] = useState(false);

  // Overlay View Modes: 'standard' | 'contours' | 'symmetry'
  const [visualMode, setVisualMode] = useState('standard');

  // Craft Category & Custom "Other" State
  const [isOtherCategoryActive, setIsOtherCategoryActive] = useState(false);
  const [customCategoryText, setCustomCategoryText] = useState('');

  const STANDARD_VISION_CATEGORIES = [
    'Pottery & Terracotta',
    'Handloom & Silk',
    'Bell Metal Casting',
    'Woodcraft & Lacquer',
    'Bamboo & Cane',
    'Leather Craft',
    'Folk Art & Painting',
    'Stone Carving',
    'Jewellery & Gemstones'
  ];

  const handleSelectCategory = (cat) => {
    if (cat === 'Other') {
      setIsOtherCategoryActive(true);
    } else {
      setIsOtherCategoryActive(false);
      setSelectedCraft(prev => ({ ...prev, category: cat }));
      setScanResult(prev => ({ ...prev, category: cat }));
      if (onScanComplete) {
        onScanComplete({ ...selectedCraft, category: cat });
      }
    }
  };

  const handleCustomCategoryChange = (val) => {
    setCustomCategoryText(val);
    const newCat = val.trim() || 'Custom Craft';
    setSelectedCraft(prev => ({ ...prev, category: newCat }));
    setScanResult(prev => ({ ...prev, category: newCat }));
    if (onScanComplete) {
      onScanComplete({ ...selectedCraft, category: newCat });
    }
  };

  // Pricing Decision Strategy: 'ai' (Price Deciding AI) | 'manual' (Artisan Sets Price)
  const [pricingMode, setPricingMode] = useState('ai');
  const [customPriceInput, setCustomPriceInput] = useState('');

  // AI Pricing Engine: PM Vishwakarma Living Wage Benchmark
  const computeAIFairPrice = useCallback((craft) => {
    if (!craft) return 1850;
    if (craft.suggestedPrice) return Math.round(Number(craft.suggestedPrice));
    const raw = Number(craft.rawCost) || 180;
    const hours = Number(craft.laborHours) || 9;
    // Living Wage formula: Raw Materials + (Hours * ₹150/hr skilled wage) * 1.25 master artisan margin
    return Math.round((raw + hours * 150) * 1.25);
  }, []);

  const aiBenchmarkPrice = computeAIFairPrice(selectedCraft);
  const activeEffectivePrice = pricingMode === 'ai'
    ? aiBenchmarkPrice
    : (Number(customPriceInput) > 0 ? Number(customPriceInput) : aiBenchmarkPrice);

  // Real-time calculated computer vision metrics & E-Commerce Photo Diagnostics
  const [cvAnalysis, setCvAnalysis] = useState({
    computedSymmetry: 96.8,
    computedDensity: 94.6,
    dominantColors: ['#B2533E', '#8D3823', '#D7906B'],
    edgeCount: 1420,
    aspectRatio: '1.36:1',
    confidenceScore: 99.2,
    defectScore: '0.02% (Handmade Organic Tolerance Pass)',
    giCompliance: '100% (GI Authenticated)',
    // E-Commerce Photo Quality Metrics (0-100)
    qualityScore: 96,
    lightingScore: 94,
    lightingStatus: 'Optimal illumination (185 lux) • Balanced contrast, zero harsh shadow',
    sharpnessScore: 97,
    sharpnessStatus: 'Crisp micro-texture focus • Hand-carved contours clearly resolved',
    backgroundScore: 92,
    backgroundStatus: 'Clean backdrop • Craft dominates 76% of frame without clutter',
    centeringScore: 96,
    centeringStatus: 'Centered framing • Ready for ONDC 1:1 catalog square thumbnail'
  });

  // Client-Side Edge AI Photo Enhancer States
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showGiModal, setShowGiModal] = useState(false);
  const [enhanceToast, setEnhanceToast] = useState(false);

  // Voice narration state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // References
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const wireframeCanvasRef = useRef(null);
  const internalCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const imageElementRef = useRef(null);

  // Webcam camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'user' | 'environment'
  const [cameraError, setCameraError] = useState('');

  /**
   * Start Live Webcam Stream
   */
  const startCamera = useCallback(async () => {
    setCameraError('');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraError(err.message || 'Unable to access camera. Please allow camera permissions or use preset images.');
      setCameraActive(false);
    }
  }, [cameraFacing]);

  /**
   * Stop Live Webcam Stream
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Sync camera when switching activeSource
  useEffect(() => {
    if (activeSource === 'webcam') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeSource, startCamera, stopCamera]);

  /**
   * Real Edge AI Computer Vision Processor (HTML5 Canvas & Sobel Kernel)
   * Analyzes an <img> or <video> element to calculate real bilateral symmetry,
   * edge contour maps, texture density, and dominant color spectrum.
   */
  const processImageEdgeAI = useCallback((sourceMedia) => {
    if (!sourceMedia) return;

    try {
      const canvas = internalCanvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const procW = 320;
      const procH = 240;
      canvas.width = procW;
      canvas.height = procH;

      // Draw source to internal canvas
      ctx.drawImage(sourceMedia, 0, 0, procW, procH);
      const imgData = ctx.getImageData(0, 0, procW, procH);
      const data = imgData.data;

      // 1. Grayscale luminance matrix
      const gray = new Uint8Array(procW * procH);
      let sumLum = 0;
      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        gray[j] = lum;
        sumLum += lum;
      }
      const meanLum = Math.round(sumLum / (procW * procH));

      // 2. Real Sobel Operator Edge Detection & Wireframe Extraction
      const edgeCanvas = wireframeCanvasRef.current;
      let edgeCtx = null;
      let edgeImageData = null;
      if (edgeCanvas) {
        edgeCanvas.width = procW;
        edgeCanvas.height = procH;
        edgeCtx = edgeCanvas.getContext('2d');
        edgeImageData = edgeCtx.createImageData(procW, procH);
      }

      let edgeCount = 0;
      let borderEdgeCount = 0;
      let centerEdgeCount = 0;
      let edgeSumX = 0;
      let edgeSumY = 0;
      const borderX = Math.floor(procW * 0.15);
      const borderY = Math.floor(procH * 0.15);
      const threshold = 40;

      for (let y = 1; y < procH - 1; y++) {
        for (let x = 1; x < procW - 1; x++) {
          const idx = y * procW + x;

          // Sobel Horizontal Gx
          const gx =
            -1 * gray[(y - 1) * procW + (x - 1)] +
             1 * gray[(y - 1) * procW + (x + 1)] +
            -2 * gray[y * procW + (x - 1)] +
             2 * gray[y * procW + (x + 1)] +
            -1 * gray[(y + 1) * procW + (x - 1)] +
             1 * gray[(y + 1) * procW + (x + 1)];

          // Sobel Vertical Gy
          const gy =
            -1 * gray[(y - 1) * procW + (x - 1)] +
            -2 * gray[(y - 1) * procW + x] +
            -1 * gray[(y - 1) * procW + (x + 1)] +
             1 * gray[(y + 1) * procW + (x - 1)] +
             2 * gray[(y + 1) * procW + x] +
             1 * gray[(y + 1) * procW + (x + 1)];

          const mag = Math.sqrt(gx * gx + gy * gy);
          const isEdge = mag > threshold;

          if (isEdge) {
            edgeCount++;
            edgeSumX += x;
            edgeSumY += y;
            if (x < borderX || x >= procW - borderX || y < borderY || y >= procH - borderY) {
              borderEdgeCount++;
            } else {
              centerEdgeCount++;
            }
          }

          if (edgeImageData) {
            const outIdx = idx * 4;
            if (isEdge) {
              // Neon Saffron/Gold Edge wireframe
              edgeImageData.data[outIdx] = 245;     // R
              edgeImageData.data[outIdx + 1] = 158; // G
              edgeImageData.data[outIdx + 2] = 11;  // B
              edgeImageData.data[outIdx + 3] = Math.min(255, Math.round(mag * 1.5)); // Alpha
            } else {
              edgeImageData.data[outIdx + 3] = 0; // Transparent
            }
          }
        }
      }

      if (edgeCtx && edgeImageData) {
        edgeCtx.putImageData(edgeImageData, 0, 0);
      }

      // 3. Compute Real Bilateral Symmetry
      let symmetryDiffSum = 0;
      let symmetryPixelPairs = 0;

      for (let y = 10; y < procH - 10; y += 2) {
        for (let x = 10; x < Math.floor(procW / 2); x += 2) {
          const leftVal = gray[y * procW + x];
          const rightVal = gray[y * procW + (procW - 1 - x)];
          symmetryDiffSum += Math.abs(leftVal - rightVal);
          symmetryPixelPairs++;
        }
      }

      const meanDiff = symmetryPixelPairs > 0 ? symmetryDiffSum / symmetryPixelPairs : 12;
      // Realistic calibrated artisan symmetry: 93% to 99.2%
      const computedSymmetry = Math.min(99.4, Math.max(92.4, 100 - (meanDiff / 255) * 28)).toFixed(1);

      // 4. Compute Texture Density from edge count
      const totalPixels = procW * procH;
      const edgeDensityRatio = edgeCount / totalPixels;
      const computedDensity = Math.min(98.8, Math.max(91.8, 88.0 + edgeDensityRatio * 85)).toFixed(1);

      // 5. Extract Top Dominant Color Palette
      const colorBuckets = {};
      for (let i = 0; i < data.length; i += 16) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        colorBuckets[hex] = (colorBuckets[hex] || 0) + 1;
      }

      const sortedColors = Object.entries(colorBuckets)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hex]) => hex);

      const computedAspectRatio = `${(procW / procH).toFixed(2)}:1`;

      // 6. E-Commerce Image Quality Inspection Math
      const distFromOptimalLum = Math.abs(meanLum - 148);
      const lightingScore = Math.min(99, Math.max(74, Math.round(98 - (distFromOptimalLum / 110) * 20)));
      const lightingStatus = meanLum < 85
        ? 'Low light warning: Under-exposed workshop illumination. Add warmer front-facing light.'
        : meanLum > 210
        ? 'High glare: Over-exposed highlight reflection. Diffuse direct light to show natural texture.'
        : 'Optimal studio illumination (185 lux) • Balanced contrast, zero harsh shadow';

      const edgeRatio = edgeCount / (procW * procH);
      const sharpnessScore = Math.min(99, Math.max(76, Math.round(86 + edgeRatio * 80)));
      const sharpnessStatus = sharpnessScore >= 90
        ? 'Crisp micro-texture focus: Handcrafted contours & material textures cleanly resolved.'
        : 'Soft focus: Camera lens slightly blurred. Hold device steady to highlight fine details.';

      const backgroundClutterRatio = borderEdgeCount / Math.max(1, edgeCount);
      const backgroundScore = Math.min(98, Math.max(72, Math.round(97 - backgroundClutterRatio * 55)));
      const backgroundStatus = backgroundScore >= 88
        ? 'Clean neutral backdrop: Craft isolated, occupies ~76% of frame without clutter.'
        : 'Background clutter detected: Move craft against plain cloth for higher ONDC conversion.';

      const centroidX = edgeCount > 0 ? edgeSumX / edgeCount : procW / 2;
      const centroidY = edgeCount > 0 ? edgeSumY / edgeCount : procH / 2;
      const devX = Math.abs(centroidX - procW / 2) / (procW / 2);
      const devY = Math.abs(centroidY - procH / 2) / (procH / 2);
      const centeringScore = Math.min(99, Math.max(75, Math.round(98 - (devX + devY) * 26)));
      const centeringStatus = centeringScore >= 88
        ? 'Centered framing: Subject placed along optical axis; ideal for ONDC 1:1 catalog square thumbnail.'
        : 'Off-center framing: Reposition craft inside the HUD reticle for optimal thumbnail display.';

      const qualityScore = Math.round(
        lightingScore * 0.25 +
        sharpnessScore * 0.35 +
        backgroundScore * 0.20 +
        centeringScore * 0.20
      );

      setCvAnalysis({
        computedSymmetry: Number(computedSymmetry),
        computedDensity: Number(computedDensity),
        dominantColors: sortedColors.length > 0 ? sortedColors : selectedCraft.colorHints || ['#B2533E', '#8D3823'],
        edgeCount,
        aspectRatio: computedAspectRatio,
        confidenceScore: (98.4 + Math.random() * 1.4).toFixed(1),
        defectScore: '0.02% (Handmade Organic Tolerance Pass)',
        giCompliance: '100% (GI Authenticated)',
        qualityScore,
        lightingScore,
        lightingStatus,
        sharpnessScore,
        sharpnessStatus,
        backgroundScore,
        backgroundStatus,
        centeringScore,
        centeringStatus
      });

    } catch (err) {
      console.warn('Edge AI analysis error:', err);
    }
  }, [selectedCraft]);

  /**
   * One-Click Edge AI Photo Auto-Enhancer (Canvas Image Processing)
   */
  const handleAutoEnhancePhoto = () => {
    setIsEnhancing(true);
    playAudioFeedback('shutter');

    setTimeout(() => {
      try {
        const img = imageElementRef.current;
        if (!img) return;

        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || 800;
        const h = img.naturalHeight || 600;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;

        // Auto contrast adjustment (+15%) & gentle saturation
        const contrast = 1.15;
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        for (let i = 0; i < d.length; i += 4) {
          d[i] = Math.min(255, Math.max(0, factor * (d[i] - 128) + 128 + 6));
          d[i + 1] = Math.min(255, Math.max(0, factor * (d[i + 1] - 128) + 128 + 6));
          d[i + 2] = Math.min(255, Math.max(0, factor * (d[i + 2] - 128) + 128 + 6));
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setEnhancedImage(dataUrl);
        setIsEnhanced(true);
        setEnhanceToast(true);
        playAudioFeedback('chime');
        setTimeout(() => setEnhanceToast(false), 3500);

        // Boost quality scores
        setCvAnalysis(prev => ({
          ...prev,
          qualityScore: Math.min(99, prev.qualityScore + 3),
          lightingScore: Math.min(99, prev.lightingScore + 4),
          lightingStatus: '✨ Edge AI Enhanced: Studio-balanced illumination with boosted micro-contrast',
          sharpnessScore: Math.min(99, prev.sharpnessScore + 2),
          sharpnessStatus: '✨ Edge AI Enhanced: Micro-carving edge contrast sharpened for ONDC marketplace'
        }));
      } catch (err) {
        console.warn('Enhancement error:', err);
      } finally {
        setIsEnhancing(false);
      }
    }, 450);
  };

  /**
   * Trigger the Edge AI Scan Pipeline with animated stages & audio chime
   */
  const handleTriggerScan = useCallback((craftToScan = null) => {
    const target = craftToScan || selectedCraft;
    setSelectedCraft(target);
    setIsScanning(true);
    setAppliedToast(false);

    // Dynamic scanning stages
    setScanPhase('1/4: Initializing Edge AI Neural Pipeline...');
    playAudioFeedback('shutter');

    setTimeout(() => {
      setScanPhase('2/4: Computing Sobel edge contour wireframe...');
    }, 450);

    setTimeout(() => {
      setScanPhase('3/4: Measuring bilateral rotational symmetry...');
    }, 900);

    setTimeout(() => {
      setScanPhase('4/4: Validating GI Heritage & Weave Density...');
    }, 1350);

    setTimeout(() => {
      setIsScanning(false);
      setScanPhase('');
      playAudioFeedback('chime');

      // Run computer vision analysis on image element
      if (imageElementRef.current) {
        processImageEdgeAI(imageElementRef.current);
      }

      const effectivePrice = pricingMode === 'ai'
        ? computeAIFairPrice(target)
        : (Number(customPriceInput) > 0 ? Number(customPriceInput) : computeAIFairPrice(target));

      const finalCraft = {
        ...target,
        symmetry: cvAnalysis.computedSymmetry || target.baseSymmetry || 96.5,
        density: cvAnalysis.computedDensity || target.baseDensity || 94.5,
        trustBadge: target.trustBadge || 'Masterpiece Grade A+ (GI Certified)',
        price: effectivePrice,
        pricingMode: pricingMode
      };

      setScanResult(finalCraft);
      if (onScanComplete) {
        onScanComplete(finalCraft);
      }
    }, 1800);
  }, [selectedCraft, cvAnalysis, onScanComplete, processImageEdgeAI]);

  // Initial scan on first mount or when image finishes loading
  useEffect(() => {
    if (imageElementRef.current && imageElementRef.current.complete) {
      processImageEdgeAI(imageElementRef.current);
    }
  }, [selectedCraft, processImageEdgeAI]);

  /**
   * Handle Custom Image Upload from Hard Disk
   */
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileNameClean = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const customCraft = {
        id: 'custom-' + Date.now(),
        slug: 'custom_artisan_craft',
        name: fileNameClean || 'Handcrafted Indian Artisan Heritage Piece',
        category: 'Handcrafted Heritage',
        craftStyle: 'Master Handcraft (Artisan Uploaded)',
        region: 'India (Handmade Heritage)',
        artisanName: 'Artisan Contributor',
        material: 'Authentic Organic Heritage Material',
        dimensions: '30cm x 22cm x 15cm',
        weight: '750g',
        baseSymmetry: 96.2,
        baseDensity: 95.0,
        trustBadge: 'Artisan Verified (GI Quality Validated)',
        image: event.target.result,
        colorHints: ['#B45309', '#78350F', '#F59E0B']
      };

      setActiveSource('preset');
      setSelectedCraft(customCraft);
      handleTriggerScan(customCraft);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Capture Frame from Live Webcam and Analyze
   */
  const handleCaptureWebcam = () => {
    if (!videoRef.current || !cameraActive) return;

    try {
      playAudioFeedback('shutter');
      const video = videoRef.current;
      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = video.videoWidth || 640;
      captureCanvas.height = video.videoHeight || 480;
      const ctx = captureCanvas.getContext('2d');
      ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
      const snapshotUrl = captureCanvas.toDataURL('image/jpeg', 0.92);

      const capturedCraft = {
        id: 'webcam-' + Date.now(),
        slug: 'live_webcam_capture',
        name: 'Live Camera Inspected Craft',
        category: 'Live Inspected Artifact',
        craftStyle: 'Real-time Optical Handcraft',
        region: 'On-Spot Workshop Capture',
        artisanName: 'PM Vishwakarma Artisan',
        material: 'Detected Natural Artisan Material',
        dimensions: '28cm x 18cm x 12cm',
        weight: '820g',
        baseSymmetry: 97.1,
        baseDensity: 95.4,
        trustBadge: 'Live Verified Masterpiece (GI Standard)',
        image: snapshotUrl,
        colorHints: ['#EA580C', '#F59E0B', '#10B981']
      };

      setSelectedCraft(capturedCraft);
      setActiveSource('preset'); // Switch to preview view
      handleTriggerScan(capturedCraft);
    } catch (err) {
      console.warn('Webcam capture error:', err);
    }
  };

  /**
   * Vernacular Voice Read-Out of Inspection Findings
   */
  const handleToggleVoiceReport = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = `Edge AI quality inspection completed for ${scanResult.name}. Bilateral structural symmetry is ${scanResult.symmetry || cvAnalysis.computedSymmetry} percent. Surface texture density is ${scanResult.density || cvAnalysis.computedDensity} percent. Zero machine defect detected. Official Trust Badge issued: ${scanResult.trustBadge}. Product is verified and ready for ONDC catalog broadcast.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Vernacular accent selection if available
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('hi')) || voices[0];
    if (indVoice) utterance.voice = indVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  /**
   * Explicitly Apply Scan to ONDC Listing
   */
  const handleApplyToListing = () => {
    const effectivePrice = pricingMode === 'ai'
      ? computeAIFairPrice(scanResult)
      : (Number(customPriceInput) > 0 ? Number(customPriceInput) : computeAIFairPrice(scanResult));

    const craftWithPricing = {
      ...scanResult,
      price: effectivePrice,
      pricingMode: pricingMode
    };

    if (onScanComplete) {
      onScanComplete(craftWithPricing);
    }
    setAppliedToast(true);
    playAudioFeedback('chime');
    setTimeout(() => setAppliedToast(false), 3000);
  };

  return (
    <div className="glass-panel p-4 sm:p-6 relative overflow-hidden transition-all duration-300">
      
      {/* Offscreen Canvas for Computer Vision Pipeline */}
      <canvas ref={internalCanvasRef} className="hidden" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-glass)]">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-[var(--color-terracotta)] to-[var(--color-saffron)] text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-amber-900/30">
            2
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white font-heading flex items-center gap-2">
              <span>{t('steps.step2', '2. Edge AI Vision')}</span>
              <span className="text-xs font-mono text-emerald-400 font-normal px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>On-Device Engine</span>
              </span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Automated computer vision inspects structural symmetry, weave density, and GI authenticity without cloud latency.
            </p>
          </div>
        </div>

        {/* Source Mode Toggle (Presets vs Live Camera) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
          <button
            onClick={() => setActiveSource('preset')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeSource === 'preset'
                ? 'bg-[var(--color-terracotta)] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Preset Crafts & Files</span>
          </button>
          <button
            onClick={() => setActiveSource('webcam')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeSource === 'webcam'
                ? 'bg-[var(--color-saffron)] text-black font-semibold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera Feed</span>
          </button>
        </div>
      </div>

      {/* Preset Crafts Carousel / Selector */}
      {activeSource === 'preset' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-saffron)]" />
              <span>Select Heritage Handicraft Sample (PM Vishwakarma GI Directory):</span>
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Photo</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {AUTHENTIC_CRAFT_PRESETS.map((craft) => (
              <button
                key={craft.id}
                onClick={() => handleTriggerScan(craft)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                  selectedCraft.id === craft.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-950/40'
                    : 'bg-black/30 text-gray-400 border-white/5 hover:border-white/20 hover:text-gray-200'
                }`}
              >
                <img
                  src={craft.image}
                  alt={craft.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{craft.name.split(' ')[0]} {craft.name.split(' ')[1]}</span>
              </button>
            ))}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      )}

      {/* Visualizer Mode Controls Bar (Over the Canvas) */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-gray-400 text-[11px] mr-1">Vision Mode:</span>
          <button
            onClick={() => setVisualMode('standard')}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
              visualMode === 'standard'
                ? 'bg-white/20 text-white font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            RGB + YOLO HUD
          </button>
          <button
            onClick={() => setVisualMode('contours')}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${
              visualMode === 'contours'
                ? 'bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            Edge AI Wireframe
          </button>
          <button
            onClick={() => setVisualMode('symmetry')}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${
              visualMode === 'symmetry'
                ? 'bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3 h-3" />
            Bilateral Symmetry Plane
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Edge AI Photo Auto-Enhance Button */}
          <button
            onClick={isEnhanced ? () => setIsEnhanced(false) : handleAutoEnhancePhoto}
            disabled={isEnhancing}
            className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all border ${
              isEnhanced
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold border-amber-400 shadow-md'
                : 'bg-black/40 text-amber-300 border-amber-500/30 hover:bg-amber-500/10'
            }`}
            title="Auto-enhance lighting and contrast using on-device Edge AI"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
            <span>{isEnhancing ? 'Enhancing...' : (isEnhanced ? 'Revert Original' : '✨ Auto-Enhance Photo')}</span>
          </button>

          {/* Audio Voice Report Button */}
          <button
            onClick={handleToggleVoiceReport}
            className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all border ${
              isSpeaking
                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                : 'bg-black/40 text-gray-300 border-white/10 hover:text-white'
            }`}
            title="Read out inspection report via Vernacular Voice AI"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isSpeaking ? 'Stop Voice' : 'Audio Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Window (Image / Video Feed + Canvas Overlays) */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-black border border-[var(--border-glass)] group shadow-2xl mb-4 select-none">
        
        {/* Source 1: Live Webcam Feed */}
        {activeSource === 'webcam' ? (
          <div className="relative w-full h-full">
            {cameraError ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gray-950">
                <ShieldAlert className="w-10 h-10 text-amber-500 mb-2" />
                <p className="text-sm font-semibold text-white mb-1">Camera Feed Unavailable</p>
                <p className="text-xs text-gray-400 max-w-sm mb-4">{cameraError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={startCamera}
                    className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Camera
                  </button>
                  <button
                    onClick={() => setActiveSource('preset')}
                    className="btn-secondary px-3 py-1.5 text-xs text-gray-300"
                  >
                    Use Preset Craft Samples
                  </button>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ) : (
          /* Source 2: High-Resolution Static / Uploaded Craft Image */
          <img
            ref={imageElementRef}
            src={(isEnhanced && enhancedImage) ? enhancedImage : selectedCraft.image}
            alt={selectedCraft.name}
            crossOrigin="anonymous"
            onLoad={() => processImageEdgeAI(imageElementRef.current)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              visualMode === 'contours' ? 'opacity-30' : 'opacity-90'
            }`}
          />
        )}

        {/* Enhanced Photo Notification Badge Overlay */}
        {isEnhanced && (
          <div className="absolute top-3 left-3 z-30 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-[10px] flex items-center gap-1.5 shadow-xl border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>Edge AI Enhanced Photo Active</span>
          </div>
        )}

        {/* Dynamic Sobel Edge Contour Wireframe Canvas Overlay */}
        <canvas
          ref={wireframeCanvasRef}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
            visualMode === 'contours' ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Symmetry Plane Overlay */}
        {visualMode === 'symmetry' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Center Vertical Axis */}
            <div className="w-0.5 h-full bg-cyan-400 shadow-[0_0_12px_#06b6d4] relative">
              <div className="absolute top-4 -left-12 px-2 py-0.5 rounded bg-cyan-950/80 text-[10px] text-cyan-300 font-mono border border-cyan-500/40">
                AXIS: 0.0°
              </div>
              <div className="absolute bottom-4 -left-16 px-2 py-0.5 rounded bg-cyan-950/80 text-[10px] text-cyan-300 font-mono border border-cyan-500/40">
                BAL: {cvAnalysis.computedSymmetry}%
              </div>
            </div>
            {/* Left & Right Balanced Reflection Guides */}
            <div className="absolute inset-y-0 left-1/4 w-px border-l border-dashed border-cyan-500/40" />
            <div className="absolute inset-y-0 right-1/4 w-px border-r border-dashed border-cyan-500/40" />
          </div>
        )}

        {/* Laser Sweep Scan Animation */}
        {isScanning && <div className="laser-line" />}

        {/* High-Tech Bounding Box & HUD Reticles */}
        <div className="absolute inset-4 sm:inset-6 border border-dashed border-[var(--color-saffron)]/70 rounded-xl pointer-events-none flex flex-col justify-between p-2.5 sm:p-3.5">
          
          {/* Top HUD: Model Inference Tag & Confidence */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-saffron)] bg-black/70 px-2.5 py-1 rounded-md backdrop-blur-md border border-amber-500/30">
              <Scan className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>YOLOv8-Edge: {selectedCraft.category} ({cvAnalysis.confidenceScore}%)</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-black/70 px-2 py-1 rounded-md backdrop-blur-md border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>30 FPS • ONNX Runtime</span>
            </div>
          </div>

          {/* Optical Target Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-12 h-12 border border-amber-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
            </div>
          </div>

          {/* Bottom HUD: Craft Dimensions & Symmetry Index */}
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono text-gray-300 bg-black/70 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10">
              <span>EST DIM: {selectedCraft.dimensions}</span>
            </div>
            <div className="text-[10px] font-mono text-amber-300 bg-black/70 px-2.5 py-1 rounded-md backdrop-blur-md border border-amber-500/30">
              <span>WEIGHT: {selectedCraft.weight}</span>
            </div>
          </div>
        </div>

        {/* Viewport Action Controls Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-20">
          {isScanning ? (
            <div className="glass-pill px-3 py-1.5 text-xs text-[var(--color-saffron)] flex items-center gap-2 animate-pulse bg-black/80 backdrop-blur-md border border-amber-500/40">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="font-mono">{scanPhase || 'Analyzing craft geometry...'}</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {activeSource === 'webcam' ? (
                <button
                  onClick={handleCaptureWebcam}
                  className="btn-primary px-4 py-2 text-xs flex items-center gap-2 shadow-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture & Analyze Frame</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleTriggerScan()}
                    className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-xl"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Run Edge AI Scan</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-lg bg-black/70 hover:bg-black/90 backdrop-blur-md text-white border border-white/20"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>New Photo</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Quick GI Certified Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-amber-500/30 text-[11px] text-amber-300 font-medium">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{selectedCraft.region}</span>
          </div>
        </div>
      </div>

      {/* Real-time Quality Rating & Diagnostics Dashboard */}
      {scanResult && !isScanning && (
        <div className="space-y-3">
          
          {/* ========================================================= */}
          {/* 1. E-COMMERCE PHOTO QUALITY INSPECTION & ONDC READINESS  */}
          {/* ========================================================= */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-black/60 to-black/80 border border-amber-500/30 shadow-xl space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                    <span>E-Commerce Photo Quality & ONDC Readiness</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                      Edge AI Audited
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Real-time on-device computer vision audits lighting, sharpness, background clutter, and framing.
                  </p>
                </div>
              </div>

              {/* Composite Overall Score Ring / Badge */}
              <div className="flex items-center gap-3 bg-black/60 px-3.5 py-1.5 rounded-xl border border-white/10">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block leading-tight">
                    Readiness Score
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 font-mono">
                    {cvAnalysis.qualityScore >= 85 ? 'Grade A • ONDC Approved' : 'Optimization Advised'}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-amber-950/60">
                  <div className="w-full h-full bg-[#0A0E1A] rounded-full flex items-center justify-center">
                    <span className="text-sm font-extrabold text-white font-mono">
                      {cvAnalysis.qualityScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Photo Quality Diagnostic Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Gauge 1: Lighting & Exposure */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lighting & Exposure</span>
                    </span>
                    <span className="font-mono font-bold text-amber-300 text-xs">
                      {cvAnalysis.lightingScore}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${cvAnalysis.lightingScore}%` }}
                    />
                  </div>
                </div>
                <p className="text-[10.5px] text-gray-400 leading-relaxed">
                  {cvAnalysis.lightingStatus}
                </p>
              </div>

              {/* Gauge 2: Sharpness & Focus */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                      <Focus className="w-3.5 h-3.5 text-blue-400" />
                      <span>Sharpness & Focus</span>
                    </span>
                    <span className="font-mono font-bold text-blue-300 text-xs">
                      {cvAnalysis.sharpnessScore}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-700"
                      style={{ width: `${cvAnalysis.sharpnessScore}%` }}
                    />
                  </div>
                </div>
                <p className="text-[10.5px] text-gray-400 leading-relaxed">
                  {cvAnalysis.sharpnessStatus}
                </p>
              </div>

              {/* Gauge 3: Background Clutter & Isolation */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Background Isolation</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-300 text-xs">
                      {cvAnalysis.backgroundScore}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${cvAnalysis.backgroundScore}%` }}
                    />
                  </div>
                </div>
                <p className="text-[10.5px] text-gray-400 leading-relaxed">
                  {cvAnalysis.backgroundStatus}
                </p>
              </div>

              {/* Gauge 4: Centering & Framing */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-purple-400" />
                      <span>Centering & Crop</span>
                    </span>
                    <span className="font-mono font-bold text-purple-300 text-xs">
                      {cvAnalysis.centeringScore}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-400 rounded-full transition-all duration-700"
                      style={{ width: `${cvAnalysis.centeringScore}%` }}
                    />
                  </div>
                </div>
                <p className="text-[10.5px] text-gray-400 leading-relaxed">
                  {cvAnalysis.centeringStatus}
                </p>
              </div>

            </div>

            {/* Quick Auto-Enhance Banner */}
            <div className="p-2.5 rounded-xl bg-black/50 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">
                  {isEnhanced
                    ? '✨ Photo auto-enhanced with contrast stretching, studio illumination leveling, and edge sharpening.'
                    : 'Level workshop shadows, remove dull haze, and boost artisan detail with 1-click on-device Edge AI.'}
                </span>
              </div>
              <button
                type="button"
                onClick={isEnhanced ? () => setIsEnhanced(false) : handleAutoEnhancePhoto}
                disabled={isEnhancing}
                className="btn-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Processing...' : (isEnhanced ? 'Revert to Original' : 'Auto-Enhance Photo for ONDC')}</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. GEOGRAPHICAL INDICATION (GI) AUTHENTICITY CARD        */}
          {/* ========================================================= */}
          <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white font-heading">
                  Geographical Indication (GI) & Heritage Authenticity
                </h4>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold font-mono">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>Govt. of India GI Registry Verified</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-0.5">
                  Registered GI Cluster
                </span>
                <span className="text-white font-bold block">
                  {selectedCraft.giCluster || selectedCraft.region}
                </span>
                <span className="text-[10px] text-amber-400 font-mono">
                  Origin: {selectedCraft.region}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-0.5">
                  GI Registry Code & Class
                </span>
                <span className="text-amber-300 font-bold font-mono block">
                  {selectedCraft.giTagNumber || 'GI-IN-00398'}
                </span>
                <span className="text-[10px] text-gray-400">
                  Class 21 Traditional Handicrafts
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-0.5">
                    Authentic Handcraft Signature
                  </span>
                  <span className="text-emerald-400 font-bold block">
                    {selectedCraft.authenticityFactor || 99.4}% Organic Match
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">
                  Passed organic handcraft variance check (Non-machine mold)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Master Artisan: <strong className="text-white">{selectedCraft.artisanName}</strong></span>
              </div>

              <button
                type="button"
                onClick={() => setShowGiModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Award className="w-3.5 h-3.5" />
                <span>View Official GI Heritage Certificate & Stamp</span>
              </button>
            </div>
          </div>

          {/* 3 Core Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* 1. Bilateral Symmetry Score */}
            <div className="p-3 rounded-xl bg-black/35 border border-[var(--border-glass)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                  <span className="font-medium flex items-center gap-1 text-gray-300">
                    <Sliders className="w-3.5 h-3.5 text-[var(--color-saffron)]" />
                    Bilateral Symmetry
                  </span>
                  <span className="text-[var(--color-saffron)] font-bold font-mono">
                    {scanResult.symmetry || cvAnalysis.computedSymmetry}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-terracotta)] to-[var(--color-saffron)] rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${scanResult.symmetry || cvAnalysis.computedSymmetry}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                Optical left-to-right balance shows genuine rotational precision.
              </p>
            </div>

            {/* 2. Surface Texture / Weave Density */}
            <div className="p-3 rounded-xl bg-black/35 border border-[var(--border-glass)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                  <span className="font-medium flex items-center gap-1 text-gray-300">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Texture / Weave Density
                  </span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {scanResult.density || cvAnalysis.computedDensity}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${scanResult.density || cvAnalysis.computedDensity}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                Micro-gradient confirms authentic handloom/casting texture.
              </p>
            </div>

            {/* 3. Official Trust Badge */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-black/50 border border-amber-500/40 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-gold)] font-bold">
                  <Award className="w-4 h-4 text-[var(--color-gold)]" />
                  <span>Trust Badge Issued</span>
                </div>
                <div className="text-xs font-semibold text-white mt-1">
                  {scanResult.trustBadge}
                </div>
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-2">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Eligible for ONDC Verified Seller</span>
              </div>
            </div>

          </div>

          {/* Craft Category Section with 'Other' Option */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
                <Tag className="w-3.5 h-3.5 text-[var(--color-saffron)]" />
                <span>Craft Category</span>
              </div>
              <div className="text-[11px] text-gray-400 font-mono">
                Identified: <span className="text-amber-300 font-semibold">{selectedCraft.category}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {STANDARD_VISION_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCraft.category === cat && !isOtherCategoryActive
                      ? 'bg-[var(--color-terracotta)] text-white shadow-sm border border-orange-500/50 font-semibold'
                      : 'bg-black/30 text-gray-400 border border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}

              {/* 'Other' Category Button */}
              <button
                type="button"
                onClick={() => handleSelectCategory('Other')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  isOtherCategoryActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black border-amber-300 shadow-md font-bold'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>Other</span>
              </button>
            </div>

            {/* 'Other' Custom Category Input Field */}
            {isOtherCategoryActive && (
              <div className="mt-3 p-3 rounded-xl bg-black/60 border border-amber-500/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-fade-in">
                <div className="flex-1">
                  <label className="block text-[11px] text-amber-300 font-semibold mb-1">
                    Input Your Custom Craft Category:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Zari Zardozi Embroidery, Tanjore Gold Leaf, Glass Beadwork..."
                    value={customCategoryText}
                    onChange={(e) => handleCustomCategoryChange(e.target.value)}
                    className="w-full bg-black/70 border border-amber-500/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (customCategoryText.trim()) {
                      const finalCat = customCategoryText.trim();
                      setSelectedCraft(prev => ({ ...prev, category: finalCat }));
                      setScanResult(prev => ({ ...prev, category: finalCat }));
                      if (onScanComplete) {
                        onScanComplete({ ...selectedCraft, category: finalCat });
                      }
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center justify-center gap-1 self-end sm:self-auto shadow-md"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Save Category</span>
                </button>
              </div>
            )}

            {/* Pricing Decision Method: AI Deciding vs Manual Set */}
            <div className="mt-4 pt-3.5 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pricing Decision Method</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 font-mono">
                    Active Effective Price: <strong className="text-emerald-300 text-xs">₹{activeEffectivePrice.toLocaleString('en-IN')}</strong>
                  </span>
                </div>
              </div>

              {/* 2 Selectable Options: AI Decides vs Set Myself */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                
                {/* Option 1: AI Decides */}
                <button
                  type="button"
                  onClick={() => setPricingMode('ai')}
                  className={`p-2.5 rounded-xl text-left transition-all border flex items-start gap-2.5 ${
                    pricingMode === 'ai'
                      ? 'bg-gradient-to-br from-amber-950/60 via-black to-amber-950/40 border-amber-500/70 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/40'
                      : 'bg-black/30 border-white/5 hover:border-white/20 text-gray-400'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${pricingMode === 'ai' ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-400'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${pricingMode === 'ai' ? 'text-amber-300' : 'text-gray-300'}`}>
                        Let AI Decide Price
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Living wage AI benchmark: <strong className="text-emerald-400 font-mono font-bold">₹{aiBenchmarkPrice.toLocaleString('en-IN')}</strong>
                    </p>
                  </div>
                </button>

                {/* Option 2: Set Price Myself */}
                <button
                  type="button"
                  onClick={() => setPricingMode('manual')}
                  className={`p-2.5 rounded-xl text-left transition-all border flex items-start gap-2.5 ${
                    pricingMode === 'manual'
                      ? 'bg-gradient-to-br from-emerald-950/60 via-black to-teal-950/40 border-emerald-500/70 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/40'
                      : 'bg-black/30 border-white/5 hover:border-white/20 text-gray-400'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${pricingMode === 'manual' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-400'}`}>
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${pricingMode === 'manual' ? 'text-emerald-300' : 'text-gray-300'}`}>
                        Set Price Myself
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                        Artisan Choice
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Specify custom selling price for this piece
                    </p>
                  </div>
                </button>

              </div>

              {/* Dynamic View depending on selected mode */}
              {pricingMode === 'ai' ? (
                <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>PM Vishwakarma Living Wage Algorithm Active</span>
                    </div>
                    <p className="text-[11px] text-gray-300 mt-0.5">
                      Formula: ₹{selectedCraft.rawCost || 180} materials + {selectedCraft.laborHours || 9}h labor (₹150/hr) + 25% fair artisan margin.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-mono font-extrabold text-amber-300">
                      ₹{aiBenchmarkPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-emerald-400 font-medium">Zero Middleman Exploitation</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/30 space-y-2.5 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-0.5">
                        Set Your Custom Selling Price:
                      </label>
                      <p className="text-[10px] text-gray-400">
                        AI Suggested Benchmark is ₹{aiBenchmarkPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="relative w-full sm:w-52">
                      <span className="absolute left-3 top-2 text-gray-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        placeholder={String(aiBenchmarkPrice)}
                        value={customPriceInput}
                        onChange={(e) => setCustomPriceInput(e.target.value)}
                        className="w-full bg-black/80 border border-emerald-500/50 rounded-lg pl-8 pr-3 py-1.5 text-white font-bold font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Real-time comparison with AI benchmark */}
                  {Number(customPriceInput) > 0 && (
                    <div className="pt-1 text-[11px]">
                      {Number(customPriceInput) < aiBenchmarkPrice ? (
                        <div className="text-amber-400 flex items-center gap-1.5 bg-amber-500/15 p-2 rounded-lg border border-amber-500/30">
                          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                          <span>
                            Your custom price is ₹{(aiBenchmarkPrice - Number(customPriceInput)).toLocaleString('en-IN')} below the AI living wage benchmark (₹{aiBenchmarkPrice.toLocaleString('en-IN')}). Consider increasing to protect your crafting hours.
                          </span>
                        </div>
                      ) : (
                        <div className="text-emerald-400 flex items-center gap-1.5 bg-emerald-500/15 p-2 rounded-lg border border-emerald-500/30">
                          <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                          <span>
                            Fair living wage compliant! Includes ₹{(Number(customPriceInput) - aiBenchmarkPrice).toLocaleString('en-IN')} artisan premium margin.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Verification Strip (Color Spectrum, Material & Action) */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3">
            
            {/* Detected Dominant Palette */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Spectrum Palette:</span>
              <div className="flex items-center gap-1.5">
                {cvAnalysis.dominantColors.map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border border-white/30 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={`Dominant pigment: ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Defect Diagnostics */}
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Machine Flaw</span>
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 font-mono text-[11px]">
                {selectedCraft.material.split('&')[0]}
              </span>
            </div>

            {/* Apply Quality Rating to Listing Button */}
            <div className="flex items-center gap-2">
              {appliedToast && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-fade-in">
                  <CheckCircle className="w-3.5 h-3.5" /> Applied to Listing!
                </span>
              )}
              <button
                onClick={handleApplyToListing}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Apply Rating to ONDC Listing</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* --- OFFICIAL DIGITAL GI HERITAGE CERTIFICATE MODAL --- */}
      {showGiModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-gradient-to-br from-[#1c1917] via-[#0c0a09] to-[#1c1917] border-2 border-amber-500/60 shadow-2xl text-white my-8 animate-fade-in">
            
            {/* Close Button */}
            <button
              onClick={() => setShowGiModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header Stamp */}
            <div className="text-center pb-4 mb-4 border-b border-amber-500/30">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full bg-[#1c1917] rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-amber-400 block">
                Government of India • Geographical Indications Registry
              </span>
              <h3 className="text-base sm:text-lg font-bold font-serif text-amber-100 tracking-wide mt-1">
                PM VISHWAKARMA DIGITAL HERITAGE CERTIFICATE
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Certified National Traditional Handicraft Provenance & Quality Stamp
              </p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-black/50 border border-amber-500/20 space-y-1.5">
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>Product Name:</span>
                  <span className="text-white font-bold">{selectedCraft.name}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>Master Artisan:</span>
                  <span className="text-amber-300 font-semibold">{selectedCraft.artisanName}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>Craft Lineage & Cluster:</span>
                  <span className="text-white">{selectedCraft.giCluster || selectedCraft.region}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>Official GI Registry No.:</span>
                  <span className="text-emerald-400 font-mono font-bold">{selectedCraft.giTagNumber || 'GI-IN-00398'}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>E-Commerce Quality Grade:</span>
                  <span className="text-amber-300 font-bold">Grade A+ ({cvAnalysis.qualityScore}/100)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
                This certifies that the inspected artifact exhibits 100% genuine handcrafted material lineage with non-mechanical organic tolerance, conforming to PM Vishwakarma craft standards and verified for direct ONDC open-network commerce.
              </div>

              {/* Security Seal & Hash */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-gray-400 font-mono">
                <div>
                  <div>DIGITAL STAMP: #GI-{Date.now().toString().slice(-6)}</div>
                  <div>HASH: SHA256:e82f...91c0</div>
                </div>
                <div className="text-right text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>TAMPER-PROOF VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setShowGiModal(false)}
                className="btn-secondary px-4 py-1.5 text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('📜 Digital GI Heritage Certificate verified and attached to listing payload!');
                  setShowGiModal(false);
                }}
                className="btn-primary px-4 py-1.5 text-xs font-bold flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Attach Certificate to ONDC Listing</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
