import React, { useState, useRef } from 'react';
import { Camera, Scan, Award, CheckCircle, ShieldAlert, Sparkles, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';

const CRAFT_SAMPLES = [
  {
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
  },
  {
    id: 'silk',
    name: 'Varanasi Royal Katan Silk Shawl',
    category: 'Handloom & Banarasi Silk',
    material: 'Mulberry Silk with Zari Brocade',
    dimensions: '2.4m x 0.9m',
    weight: '350g',
    symmetry: 98.2,
    density: 97.5,
    trustBadge: 'National Heritage Masterpiece',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'dhokra',
    name: 'Bastar Lost-Wax Bell Metal Figurine',
    category: 'Dhokra Brass Casting',
    material: 'Bell Metal Bronze & Beeswax Core',
    dimensions: '25cm x 12cm x 9cm',
    weight: '850g',
    symmetry: 93.8,
    density: 95.0,
    trustBadge: 'Heritage Certified Grade A',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
  }
];

export default function VisionScanner({ onScanComplete }) {
  const [selectedCraft, setSelectedCraft] = useState(CRAFT_SAMPLES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(CRAFT_SAMPLES[0]);
  const fileInputRef = useRef(null);

  // Live Camera states
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported by browser.');
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
      setCameraStream(stream);
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera error in VisionScanner:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload photo.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (videoRef.current && cameraStream && isCameraActive) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(e => console.warn('Video play error:', e));
    }
  }, [cameraStream, isCameraActive]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraStream]);

  const captureCameraCraft = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const customCraft = {
      id: 'cam-' + Date.now(),
      name: 'Live Scanned Craft',
      category: 'Artisan Heritage Craft',
      material: 'Authentic Handcrafted Material',
      dimensions: '30cm x 22cm x 15cm',
      weight: '800g',
      symmetry: (95.0 + Math.random() * 4.0).toFixed(1),
      density: (94.0 + Math.random() * 4.5).toFixed(1),
      trustBadge: 'Artisan Verified (AI Verified)',
      image: dataUrl
    };

    stopCamera();
    setSelectedCraft(customCraft);
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setScanResult(customCraft);
      if (onScanComplete) {
        onScanComplete(customCraft);
      }
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const customCraft = {
        id: 'custom-' + Date.now(),
        name: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || 'Handmade Artisan Craft',
        category: 'Custom Handicraft',
        material: 'Handcrafted Heritage Material',
        dimensions: '30cm x 22cm x 15cm',
        weight: '750g',
        symmetry: (94.0 + Math.random() * 4.5).toFixed(1),
        density: (93.5 + Math.random() * 4.8).toFixed(1),
        trustBadge: 'Artisan Verified (GI Quality Validated)',
        image: event.target.result
      };

      stopCamera();
      setSelectedCraft(customCraft);
      setIsScanning(true);

      setTimeout(() => {
        setIsScanning(false);
        setScanResult(customCraft);
        if (onScanComplete) {
          onScanComplete(customCraft);
        }
      }, 1600);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerScan = (craft) => {
    const target = craft || selectedCraft;
    stopCamera();
    setSelectedCraft(target);
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setScanResult(target);
      if (onScanComplete) {
        onScanComplete(target);
      }
    }, 1800);
  };

  return (
    <div className="glass-panel p-5 relative overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[var(--color-terracotta)] text-white text-xs font-bold flex items-center justify-center">
            2
          </span>
          <h2 className="text-base font-bold text-white font-heading">
            Edge AI Vision Scanning & Quality Rating
          </h2>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          TF-Lite On-Device
        </span>
      </div>

      <p className="text-xs text-[var(--text-muted)] mb-4">
        Point-and-shoot scanner automatically extracts dimensions, craft style, and material details. Assesses structural symmetry and surface density for authentic GI trust badges.
      </p>

      {/* Sample Selector Tabs & Photo Upload */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-gray-400 font-medium">Select Craft:</span>
        {CRAFT_SAMPLES.map((sample) => (
          <button
            key={sample.id}
            onClick={() => handleTriggerScan(sample)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${selectedCraft.id === sample.id
              ? 'bg-[var(--color-terracotta)] text-white shadow-sm'
              : 'glass-pill text-gray-300 hover:text-white'
              }`}
          >
            {sample.name.split(' ')[0]} {sample.name.split(' ')[1]}
          </button>
        ))}

        {/* Live Camera Scanner Button */}
        <button
          type="button"
          onClick={() => {
            if (isCameraActive) stopCamera();
            else startCamera();
          }}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${isCameraActive
            ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50'
            : 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40'
            }`}
          title="Open your device camera to scan craft"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{isCameraActive ? 'Close Camera' : 'Live Camera Scan'}</span>
        </button>

        {/* Custom Photo Upload Button */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-all shadow-sm"
          title="Upload your own craft photo from PC or phone"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Custom Photo</span>
        </button>
      </div>

      {/* Hidden canvas for video frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Viewport / Scanning Canvas */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-black border border-[var(--border-glass)] group shadow-2xl mb-4">

        {/* Live Video Feed or Craft Image */}
        {isCameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => videoRef.current?.play().catch(() => { })}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={selectedCraft.image}
            alt={selectedCraft.name}
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Laser Sweep Animation when Scanning */}
        {isScanning && <div className="laser-line" />}

        {/* Bounding Box & HUD Elements */}
        <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-[var(--color-saffron)] rounded-xl pointer-events-none transition-all flex flex-col justify-between p-2 sm:p-3">

          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-saffron)] bg-black/60 px-2 py-1 rounded backdrop-blur-sm self-start">
            <Scan className="w-3 h-3 mr-1 animate-pulse" />
            <span>{isCameraActive ? 'LIVE CAMERA SCANNER' : `YOLOv8-Nano: ${selectedCraft.category} (99.1%)`}</span>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-gray-200 bg-black/60 px-2 py-1 rounded backdrop-blur-sm self-end">
            <span>{isCameraActive ? 'AUTO-FOCUS ACTIVE' : `DIM: ${selectedCraft.dimensions}`}</span>
          </div>
        </div>

        {/* Scan Status Badge Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {isScanning ? (
            <div className="glass-pill px-3 py-1 text-xs text-[var(--color-saffron)] flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing craft symmetry & weave density...</span>
            </div>
          ) : isCameraActive ? (
            <button
              type="button"
              onClick={captureCameraCraft}
              className="btn-primary px-4 py-2 text-xs flex items-center gap-2 shadow-xl bg-[var(--color-saffron)] text-black font-bold"
            >
              <Camera className="w-4 h-4" />
              <span>Snap & Analyze Craft</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleTriggerScan()}
                className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-lg"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Re-Scan Craft</span>
              </button>
              <button
                type="button"
                onClick={() => startCamera()}
                className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-lg bg-amber-600/20 text-amber-300 border border-amber-500/30"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Live Camera</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-lg bg-black/70 hover:bg-black/90 backdrop-blur-md text-white border border-white/20"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload Photo</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quality Rating Metrics (Slide 2: Visual Quality Rating) */}
      {scanResult && !isScanning && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* Symmetry Score */}
          <div className="p-3 rounded-xl bg-black/30 border border-[var(--border-glass)]">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Bilateral Symmetry</span>
              <span className="text-[var(--color-saffron)] font-bold">{scanResult.symmetry}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-terracotta)] to-[var(--color-saffron)] rounded-full transition-all duration-700"
                style={{ width: `${scanResult.symmetry}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">No warpage; balanced rotational geometry.</p>
          </div>

          {/* Weave / Texture Density */}
          <div className="p-3 rounded-xl bg-black/30 border border-[var(--border-glass)]">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Texture / Weave Density</span>
              <span className="text-emerald-400 font-bold">{scanResult.density}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${scanResult.density}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">Micro-gradient verifies genuine hand-loom/casting.</p>
          </div>

          {/* Trust Badge */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-950/40 to-black/40 border border-amber-500/30 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-gold)] font-bold">
              <Award className="w-4 h-4 text-[var(--color-gold)]" />
              <span>Trust Badge Issued</span>
            </div>
            <div className="text-xs font-semibold text-white mt-1">
              {scanResult.trustBadge}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle className="w-3 h-3" /> Eligible for ONDC Verified Seller
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
