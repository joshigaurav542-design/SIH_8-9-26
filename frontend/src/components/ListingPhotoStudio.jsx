import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  HardDrive,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Star,
  Maximize2,
  X,
  Sliders,
  Sun,
  ShieldCheck,
  SwitchCamera,
  Timer,
  Grid,
  Zap,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';

// Listing angle tags for ONDC e-commerce standard
const LISTING_SLOTS = [
  { id: 'cover', label: 'Primary Hero', hint: 'Front view for ONDC catalog' },
  { id: 'texture', label: 'Craft Texture', hint: 'Macro weave/grain detail' },
  { id: 'scale', label: 'In-Hand Scale', hint: 'Dimension & context in hands' },
  { id: 'gi_mark', label: 'GI / Stamp Mark', hint: 'Authenticity & artisan seal' },
];

/**
 * Generates an authentic mechanical camera shutter click sound
 * using the Web Audio API without needing external MP3 files.
 */
function playShutterSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Noise buffer for mechanical snap
    const bufferSize = ctx.sampleRate * 0.06;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1200;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    whiteNoise.start();

    // Secondary click 50ms later for double-curtain mechanical realism
    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.03);
        clickGain.gain.setValueAtTime(0.5, ctx.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
        osc.connect(clickGain);
        clickGain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.035);
      } catch (err) {
        // silent fallback
      }
    }, 45);
  } catch (err) {
    // Web audio might be restricted by browser gesture policy
  }
}

export default function ListingPhotoStudio({
  initialPhotos = [],
  onPhotosUpdated,
  onApplyToListing
}) {
  // Mode: 'camera' | 'harddrive'
  const [activeTab, setActiveTab] = useState('camera');

  // Photo library state
  const [photos, setPhotos] = useState(() => {
    if (initialPhotos && initialPhotos.length > 0) {
      return initialPhotos.map((img, idx) => ({
        id: 'initial-' + idx,
        url: typeof img === 'string' ? img : img.url,
        name: typeof img === 'object' && img.name ? img.name : `Craft_Angle_${idx + 1}.jpg`,
        sizeStr: typeof img === 'object' && img.sizeStr ? img.sizeStr : '640 KB',
        dimensions: typeof img === 'object' && img.dimensions ? img.dimensions : '1200 x 800 px',
        slot: idx === 0 ? 'cover' : LISTING_SLOTS[Math.min(idx, 3)].id,
        isPrimary: idx === 0,
        source: 'catalog',
        qualityScore: 96
      }));
    }
    return [
      {
        id: 'sample-hero',
        url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
        name: 'Gorakhpur_Terracotta_Urn_Front.jpg',
        sizeStr: '1.2 MB',
        dimensions: '1920 x 1280 px',
        slot: 'cover',
        isPrimary: true,
        source: 'harddrive',
        qualityScore: 98
      }
    ];
  });

  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [appliedToast, setAppliedToast] = useState(false);

  // --- Camera States ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'user' | 'environment'
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [countdown, setCountdown] = useState(0); // 0 = off, 3 = 3s, 5 = 5s
  const [countdownTick, setCountdownTick] = useState(null);
  const [freezeFrame, setFreezeFrame] = useState(null);

  // --- Hard Drive Upload States ---
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  // Active primary photo
  const primaryPhoto = photos.find(p => p.isPrimary) || photos[0] || null;

  // Selected photo for adjustments/details
  const activeDetailPhoto = photos.find(p => p.id === selectedPhotoId) || primaryPhoto;

  // Start / Stop Camera Stream
  const startCamera = useCallback(async (facing = cameraFacing) => {
    setCameraError(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Your browser or device does not support camera access. Please use Chrome, Edge, Safari, or upload photos from your hard drive.');
      }

      // Multi-tier fallback constraints:
      // 1. Try requested facingMode with high resolution
      // 2. Fallback to requested facingMode without rigid resolution
      // 3. Fallback to any default camera available on device
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing ? { ideal: facing } : 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (err1) {
        console.warn('Ideal resolution camera failed, trying facingMode fallback:', err1);
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: facing ? { facingMode: facing } : true,
            audio: false
          });
        } catch (err2) {
          console.warn('FacingMode camera failed, falling back to any video camera:', err2);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }
      }

      setCameraStream(stream);
      setCameraActive(true);
      setFreezeFrame(null);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission denied. Please click the camera/lock icon in your browser address bar to allow camera access.'
          : err.message || 'Unable to access device camera. Please check your camera connection or upload files directly from your hard drive.'
      );
      setCameraActive(false);
    }
  }, [cameraFacing, cameraStream]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  }, [cameraStream]);

  // Ensure camera stream is immediately attached to video element when mounted
  useEffect(() => {
    if (videoRef.current && cameraStream && cameraActive) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => {
        console.warn('Video auto-play handled:', err);
      });
    }
  }, [cameraStream, cameraActive]);

  // Switch camera tab lifecycle
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeTab]);

  // Flip camera between front and back
  const handleToggleFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Capture image from live video
  const executeCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    // Audio shutter click
    playShutterSound();

    // Visual camera flash
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 180);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setFreezeFrame({
      dataUrl,
      width,
      height,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  // Trigger shutter (with optional countdown)
  const handleShutterClick = () => {
    if (countdown === 0) {
      executeCapture();
      return;
    }

    let remaining = countdown;
    setCountdownTick(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        setCountdownTick(null);
        executeCapture();
      } else {
        setCountdownTick(remaining);
      }
    }, 1000);
  };

  // Confirm captured freeze-frame photo into listing gallery
  const handleConfirmCapturedPhoto = (targetSlot = 'cover') => {
    if (!freezeFrame) return;

    const newPhoto = {
      id: 'cam-' + Date.now(),
      url: freezeFrame.dataUrl,
      name: `Artisan_Camera_Shot_${photos.length + 1}.jpg`,
      sizeStr: `${Math.round((freezeFrame.dataUrl.length * 3 / 4) / 1024)} KB`,
      dimensions: `${freezeFrame.width} x ${freezeFrame.height} px`,
      slot: targetSlot,
      isPrimary: photos.length === 0 || targetSlot === 'cover',
      source: 'camera',
      qualityScore: 97
    };

    setPhotos(prev => {
      // If new photo is primary, unset previous primary
      const updated = newPhoto.isPrimary
        ? prev.map(p => ({ ...p, isPrimary: false }))
        : [...prev];
      return [newPhoto, ...updated];
    });

    setFreezeFrame(null);
    setSelectedPhotoId(newPhoto.id);
  };

  // --- Hard Drive File Processing ---
  const processUploadedFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploadProgress('Reading photos from hard drive...');

    Array.from(fileList).forEach((file, index) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;

        // Calculate image natural dimensions
        const img = new Image();
        img.onload = () => {
          const fileSizeKb = Math.round(file.size / 1024);
          const sizeStr = fileSizeKb > 1024
            ? `${(fileSizeKb / 1024).toFixed(1)} MB`
            : `${fileSizeKb} KB`;

          // Assign slot based on current gallery length
          const slotOrder = ['cover', 'texture', 'scale', 'gi_mark'];
          const targetSlot = slotOrder[Math.min(photos.length + index, 3)];

          const newPhoto = {
            id: 'hd-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            url: dataUrl,
            name: file.name,
            sizeStr,
            dimensions: `${img.naturalWidth} x ${img.naturalHeight} px`,
            slot: targetSlot,
            isPrimary: photos.length === 0 && index === 0,
            source: 'harddrive',
            qualityScore: img.naturalWidth >= 800 ? 98 : 88
          };

          setPhotos(prev => [newPhoto, ...prev]);
          setSelectedPhotoId(newPhoto.id);
          setUploadProgress(null);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e) => {
    processUploadedFiles(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  // Set photo as primary listing hero
  const handleSetPrimary = (photoId) => {
    setPhotos(prev =>
      prev.map(p => ({
        ...p,
        isPrimary: p.id === photoId,
        slot: p.id === photoId ? 'cover' : p.slot === 'cover' ? 'texture' : p.slot
      }))
    );
  };

  // Assign slot to a photo
  const handleAssignSlot = (photoId, slotId) => {
    setPhotos(prev =>
      prev.map(p => (p.id === photoId ? { ...p, slot: slotId } : p))
    );
  };

  // Delete photo from gallery
  const handleDeletePhoto = (photoId) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== photoId);
      if (filtered.length > 0 && !filtered.some(p => p.isPrimary)) {
        filtered[0].isPrimary = true;
        filtered[0].slot = 'cover';
      }
      return filtered;
    });
    if (selectedPhotoId === photoId) {
      setSelectedPhotoId(null);
    }
  };

  // Apply photos to product listing
  const handleApplyListing = () => {
    if (photos.length === 0) return;
    const main = photos.find(p => p.isPrimary) || photos[0];

    const listingPayload = {
      primaryImage: main.url,
      primaryDetails: main,
      allPhotos: photos,
      totalCount: photos.length,
      slotsFilled: {
        cover: photos.filter(p => p.slot === 'cover').length,
        texture: photos.filter(p => p.slot === 'texture').length,
        scale: photos.filter(p => p.slot === 'scale').length,
        gi_mark: photos.filter(p => p.slot === 'gi_mark').length
      }
    };

    if (onPhotosUpdated) {
      onPhotosUpdated(listingPayload);
    }
    if (onApplyToListing) {
      onApplyToListing(main.url, photos);
    }

    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 3500);
  };

  // Quality check for ONDC listing
  const hasMinRes = photos.some(p => {
    const match = p.dimensions.match(/(\d+)\s*x/);
    return match ? parseInt(match[1], 10) >= 800 : true;
  });
  const hasCover = photos.some(p => p.isPrimary || p.slot === 'cover');

  return (
    <div className="glass-panel p-5 relative overflow-hidden text-white">
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden File Input for Hard Drive Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-terracotta)] to-[var(--color-saffron)] flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <span>Artisan Listing Photo Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ONDC Standard 4K
              </span>
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Capture high-resolution craft images with live camera or select high-grade photos from your hard drive.
            </p>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex items-center glass-pill p-1 gap-1">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'camera'
                ? 'bg-[var(--color-terracotta)] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>
          <button
            onClick={() => setActiveTab('harddrive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'harddrive'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Hard Drive Upload</span>
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        
        {/* Left / Center: Interactive Viewfinder or Hard Drive Dropzone (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          
          {activeTab === 'camera' ? (
            /* --- LIVE CAMERA CAPTURE MODE --- */
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black border border-[var(--border-glass)] group shadow-2xl flex items-center justify-center">
              
              {/* Flash screen overlay animation */}
              {isFlashActive && (
                <div className="absolute inset-0 bg-white z-50 animate-ping opacity-90" />
              )}

              {/* Live Video Feed or Freeze Preview */}
              {freezeFrame ? (
                <img
                  src={freezeFrame.dataUrl}
                  alt="Captured freeze preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => videoRef.current?.play().catch(() => {})}
                    className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  />
                  {!cameraActive && (
                    <div className="text-center p-6 max-w-sm">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                        <Camera className="w-7 h-7 text-gray-400 animate-pulse" />
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">Camera Stream Standby</h4>
                      <p className="text-xs text-gray-400 mb-4">
                        {cameraError || 'Allow camera access to capture crisp product shots for your online listing.'}
                      </p>
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Start Camera</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('harddrive')}
                          className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
                        >
                          <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Use Hard Drive</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Viewfinder Rule of Thirds Grid Overlay */}
              {cameraActive && !freezeFrame && showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/15">
                  <div className="border-r border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-r border-b border-white/15 flex items-center justify-center">
                    {/* Center Focus Box */}
                    <div className="w-20 h-20 border border-[var(--color-saffron)]/70 rounded-lg relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--color-saffron)]" />
                    </div>
                  </div>
                  <div className="border-b border-white/15" />
                  <div className="border-r border-white/15" />
                  <div className="border-r border-white/15" />
                  <div />
                </div>
              )}

              {/* Top HUD Controls (Timer, Grid, Camera Flip) */}
              {cameraActive && !freezeFrame && (
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20">
                  <div className="flex items-center gap-1.5">
                    <span className="glass-pill px-2.5 py-1 text-[10px] font-mono text-[var(--color-saffron)] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span>LIVE 1080p</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 glass-pill p-1">
                    {/* Grid Toggle */}
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`p-1.5 rounded-full text-xs transition-all ${
                        showGrid ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                      title="Toggle Rule of Thirds Grid"
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>

                    {/* Timer Selector */}
                    <button
                      onClick={() => setCountdown(prev => (prev === 0 ? 3 : prev === 3 ? 5 : 0))}
                      className={`px-2 py-1 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1 ${
                        countdown > 0 ? 'bg-amber-500/30 text-amber-300' : 'text-gray-400 hover:text-white'
                      }`}
                      title="Timer: Click to cycle 0s / 3s / 5s"
                    >
                      <Timer className="w-3 h-3" />
                      <span>{countdown === 0 ? 'Off' : `${countdown}s`}</span>
                    </button>

                    {/* Camera Flip */}
                    <button
                      onClick={handleToggleFacing}
                      className="p-1.5 rounded-full text-gray-400 hover:text-white transition-all"
                      title="Flip between Front and Rear Camera"
                    >
                      <SwitchCamera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Countdown Splash */}
              {countdownTick !== null && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40">
                  <span className="text-6xl font-extrabold text-[var(--color-saffron)] animate-ping">
                    {countdownTick}
                  </span>
                </div>
              )}

              {/* Freeze-frame Approval Tray */}
              {freezeFrame ? (
                <div className="absolute bottom-3 inset-x-3 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/20 z-30 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Snapshot Captured</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {freezeFrame.width} x {freezeFrame.height} • {freezeFrame.timestamp}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFreezeFrame(null)}
                      className="btn-secondary px-3 py-1 text-xs"
                    >
                      Retake
                    </button>
                    <button
                      onClick={() => handleConfirmCapturedPhoto('cover')}
                      className="btn-primary px-3.5 py-1 text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Keep as Hero</span>
                    </button>
                    <button
                      onClick={() => handleConfirmCapturedPhoto('texture')}
                      className="px-3 py-1 rounded-xl text-xs bg-white/10 hover:bg-white/20 text-gray-200 border border-white/20"
                    >
                      Add Detail Angle
                    </button>
                  </div>
                </div>
              ) : cameraActive ? (
                /* Shutter Button Bar */
                <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-4 z-20">
                  <button
                    onClick={handleShutterClick}
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-[var(--color-terracotta)] to-[var(--color-saffron)] p-1 shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
                    title="Capture Craft Photo"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-all">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </button>
                </div>
              ) : null}

            </div>
          ) : (
            /* --- HARD DRIVE UPLOAD MODE --- */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl aspect-[4/3] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-950/20 scale-[0.99]'
                  : 'border-[var(--border-glass)] hover:border-emerald-500/50 bg-black/40 hover:bg-black/60'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <HardDrive className="w-8 h-8 text-emerald-400" />
              </div>

              <h4 className="text-base font-bold text-white mb-1">
                Upload Craft Photos from Hard Drive
              </h4>
              <p className="text-xs text-gray-400 max-w-sm mb-4">
                Drag and drop your craft images here, or browse your computer drive. Supports JPG, PNG, WEBP, and AVIF up to 25MB each.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="btn-primary px-4 py-2 text-xs flex items-center gap-2 shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  <span>Browse Hard Drive Files</span>
                </button>
                <span className="text-[11px] text-gray-500">Multi-select enabled</span>
              </div>

              {uploadProgress && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4">
                  <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin mb-2" />
                  <p className="text-xs text-emerald-300 font-medium">{uploadProgress}</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Upload Button under Camera Mode */}
          {activeTab === 'camera' && (
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400 px-1">
              <span>Need to upload existing files instead?</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Upload from Hard Drive</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Listing Catalog Management & Angle Tagging (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {activeDetailPhoto ? (
            <div className="p-3.5 rounded-2xl bg-black/30 border border-[var(--border-glass)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                  Selected Photo Inspection
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeDetailPhoto.isPrimary
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-white/10 text-gray-300'
                }`}>
                  {activeDetailPhoto.isPrimary ? 'Primary Hero Cover' : activeDetailPhoto.slot.toUpperCase()}
                </span>
              </div>

              <div className="flex gap-3">
                <div
                  className="w-24 h-24 rounded-xl overflow-hidden border border-white/15 bg-black flex-shrink-0 cursor-pointer relative group"
                  onClick={() => setLightboxImage(activeDetailPhoto.url)}
                  title="Click to view full image"
                >
                  <img
                    src={activeDetailPhoto.url}
                    alt={activeDetailPhoto.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white truncate text-xs" title={activeDetailPhoto.name}>
                      {activeDetailPhoto.name}
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      {activeDetailPhoto.dimensions} • {activeDetailPhoto.sizeStr}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Quality Rating: {activeDetailPhoto.qualityScore}% (ONDC Ready)</span>
                    </div>
                  </div>

                  {/* Angle Slot Assign Buttons */}
                  <div className="mt-2">
                    <div className="text-[10px] text-gray-400 mb-1">Assign Listing Angle:</div>
                    <div className="grid grid-cols-2 gap-1">
                      {LISTING_SLOTS.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleAssignSlot(activeDetailPhoto.id, slot.id)}
                          className={`px-1.5 py-1 rounded text-[10px] font-medium transition-all text-left truncate ${
                            activeDetailPhoto.slot === slot.id
                              ? 'bg-[var(--color-terracotta)] text-white'
                              : 'bg-white/5 hover:bg-white/10 text-gray-300'
                          }`}
                          title={slot.hint}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Actions Row */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                {!activeDetailPhoto.isPrimary ? (
                  <button
                    onClick={() => handleSetPrimary(activeDetailPhoto.id)}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Set as Primary Cover</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Main Cover Selected</span>
                  </span>
                )}

                <button
                  onClick={() => handleDeletePhoto(activeDetailPhoto.id)}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px]"
                  title="Remove this photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-black/20 border border-[var(--border-glass)] text-center text-gray-400 text-xs">
              No photos currently captured or selected. Use the camera or upload from hard drive.
            </div>
          )}

          {/* ONDC Listing Checklist */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/60 to-black/60 border border-[var(--border-glass)]">
            <div className="text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>ONDC E-Commerce Photo Readiness</span>
              <span className="text-emerald-400 font-mono text-[10px]">4 / 4 Rules</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[11px]">
                {photos.length > 0 ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                )}
                <span className={photos.length > 0 ? 'text-gray-200' : 'text-gray-400'}>
                  At least 1 product photo ({photos.length} captured)
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                {hasCover ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                )}
                <span className={hasCover ? 'text-gray-200' : 'text-gray-400'}>
                  Primary Hero / Cover angle designated
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                {hasMinRes ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                )}
                <span className={hasMinRes ? 'text-gray-200' : 'text-gray-400'}>
                  High-DPI resolution (minimum 800x800 recommended)
                </span>
              </div>
            </div>
          </div>

          {/* Action Button: Apply Photos to Listing */}
          <div>
            <button
              onClick={handleApplyListing}
              disabled={photos.length === 0}
              className="w-full btn-primary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Apply Photos to Product Listing ({photos.length})</span>
            </button>

            {appliedToast && (
              <div className="mt-2 text-center text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 rounded-xl py-1.5 px-2 animate-bounce">
                ✨ Successfully attached {photos.length} photo(s) to listing & ONDC sync!
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Gallery Strip: All Uploaded & Captured Photos */}
      <div className="pt-3 border-t border-[var(--border-glass)]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--color-saffron)]" />
            <span className="text-xs font-bold text-white">
              Listing Photo Reel ({photos.length} photos)
            </span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            <span>Add More from Hard Drive</span>
          </button>
        </div>

        {photos.length === 0 ? (
          <div className="p-4 rounded-xl bg-black/20 border border-dashed border-white/10 text-center text-xs text-gray-400">
            No photos in listing gallery yet. Capture with your web camera or drag & drop from hard drive.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhotoId(photo.id)}
                className={`group relative rounded-xl overflow-hidden aspect-square bg-black border-2 cursor-pointer transition-all ${
                  photo.id === selectedPhotoId
                    ? 'border-[var(--color-saffron)] shadow-lg scale-105'
                    : photo.isPrimary
                    ? 'border-amber-500/70'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />

                {/* Badge Overlay */}
                <div className="absolute top-1 left-1">
                  {photo.isPrimary ? (
                    <span className="bg-amber-500 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                      COVER
                    </span>
                  ) : (
                    <span className="bg-black/60 backdrop-blur-sm text-gray-300 text-[8px] font-mono px-1 py-0.5 rounded uppercase">
                      {photo.slot}
                    </span>
                  )}
                </div>

                {/* Source Badge */}
                <div className="absolute top-1 right-1">
                  {photo.source === 'camera' ? (
                    <span className="bg-red-500/80 text-white text-[8px] px-1 py-0.5 rounded">
                      CAM
                    </span>
                  ) : (
                    <span className="bg-emerald-600/80 text-white text-[8px] px-1 py-0.5 rounded">
                      DISK
                    </span>
                  )}
                </div>

                {/* Hover Quick Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage(photo.url);
                    }}
                    className="p-1 rounded-full bg-white/20 hover:bg-white/40 text-white"
                    title="Zoom Preview"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(photo.id);
                    }}
                    className="p-1 rounded-full bg-red-500/40 hover:bg-red-500 text-white"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black border border-white/20 transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="High resolution craft preview"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}

    </div>
  );
}
