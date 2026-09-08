import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

const PRESETS = {
  'hi-IN': {
    label: 'हिन्दी उदाहरण (Hindi)',
    text: 'मैंने यह टेराकोटा का बड़ा फूलदान बनाया है। गंगा किनारे की चिकनी मिट्टी इस्तेमाल की है। बनाने में 8 घंटे लगे और मिट्टी और रंग का 160 रुपया खर्च हुआ।',
    hint: 'कारीगर अपनी स्थानीय बोली में बोलें'
  },
  'bn-IN': {
    label: 'বাংলা উদাহরণ (Bengali)',
    text: 'আমি বাঁকুড়ার পোড়ামাটির ঘোড়া বানিয়েছি। বিশুদ্ধ মাটি দিয়ে হাতে গড়েছি। বানাতে 10 ঘণ্টা সময় লেগেছে, কাঁচামালের খরচ 150 টাকা।',
    hint: 'গ্রামীণ কারিগররা মুখে বললেই লিস্টিং তৈরি হবে'
  },
  'ta-IN': {
    label: 'தமிழ் உதாரணம் (Tamil)',
    text: 'நான் இந்த மதுரை சுங்கடி சேலையை கையால் நெய்துள்ளேன். தூய பருத்தி நூல் பயன்படுத்தப்பட்டுள்ளது. நெசவு செய்ய 14 மணிநேரம் ஆனது மற்றும் மூலப்பொருள் 450 ரூபாய்.',
    hint: 'குரல் வழியே விவரங்களை பதிவு செய்யுங்கள்'
  },
  'en-IN': {
    label: 'English Sample',
    text: 'I have handcrafted this brass Dhokra tribal figurine using traditional lost-wax casting. It took 12 hours of delicate filigree work and raw material cost of 320 rupees.',
    hint: 'Natural speech entity extraction via AI'
  }
};

export default function VoicePromptCapture({ language, onVoiceExtracted }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPreset = PRESETS[language] || PRESETS['hi-IN'];

  useEffect(() => {
    // Reset or update transcript preview when language changes
    setTranscript(currentPreset.text);
    setExtractedData(null);
  }, [language]);

  const handleSimulateRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    setIsProcessing(true);
    setExtractedData(null);

    // Simulate real-time speech-to-text processing (Bhashini/Whisper pipeline)
    setTimeout(() => {
      setIsRecording(false);
      setIsProcessing(false);
      
      const hoursMatch = transcript.match(/(\d+)\s*(hour|घंटे|ঘণ্টা|மணிநேரம்)/i);
      const costMatch = transcript.match(/(\d+)\s*(rupee|रुपया|টাকা|ரூபாய்)/i);
      
      const parsedHours = hoursMatch ? parseFloat(hoursMatch[1]) : 8.0;
      const parsedCost = costMatch ? parseFloat(costMatch[1]) : 160.0;

      const result = {
        language,
        spokenText: transcript,
        extracted: {
          craftType: language === 'ta-IN' ? 'Handloom & Madurai Cotton' : (language === 'en-IN' ? 'Dhokra Brass Casting' : 'Pottery & Terracotta'),
          rawMaterialCost: parsedCost,
          laborHours: parsedHours,
          material: language === 'ta-IN' ? 'Pure Organic Cotton' : (language === 'en-IN' ? 'Recycled Bell Metal & Beeswax' : 'Riverbed Alluvial Clay'),
          confidence: '98.4%'
        }
      };

      setExtractedData(result.extracted);
      if (onVoiceExtracted) {
        onVoiceExtracted(result);
      }
    }, 2200);
  };

  return (
    <div className="glass-panel p-5 relative overflow-hidden">
      
      {/* Step Banner */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[var(--color-terracotta)] text-white text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h2 className="text-base font-bold text-white font-heading">
            Multilingual Voice Input (BHASHINI / Whisper AI)
          </h2>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Zero Literacy Barrier
        </span>
      </div>

      <p className="text-xs text-[var(--text-muted)] mb-4">
        {currentPreset.hint}. Non-literate rural artisans can simply speak in their mother tongue to catalogue products in seconds.
      </p>

      {/* Voice Prompt Box */}
      <div className="p-4 rounded-xl bg-black/30 border border-[var(--border-glass)] mb-4 relative">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold text-[var(--color-saffron)] flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" /> Spoken Dialect Audio Stream
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            {language} • 16kHz
          </span>
        </div>
        
        <textarea
          aria-label="Spoken dialect text"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={3}
          className="w-full bg-transparent text-sm text-gray-200 resize-none border-none outline-none font-sans"
          placeholder="Speak or tap preset below..."
        />

        {/* Audio Wave Visualizer Simulation */}
        {isRecording && (
          <div className="flex items-center justify-center gap-1.5 py-2 my-1">
            {[35, 70, 45, 90, 60, 100, 50, 80, 40, 65, 30].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-[var(--color-terracotta)] to-[var(--color-saffron)] rounded-full transition-all duration-150 animate-pulse"
                style={{ height: `${h}%`, minHeight: '12px' }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateRecording}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              isRecording
                ? 'bg-rose-600 text-white recording-pulse'
                : 'btn-primary'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 animate-spin" />
                <span>Listening (बोल रहे हैं)...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Tap to Speak (बोलें)</span>
              </>
            )}
          </button>

          <button
            onClick={() => setTranscript(currentPreset.text)}
            className="btn-secondary px-3 py-2 text-xs"
            title="Load sample vernacular sentence"
          >
            Load Sample
          </button>
        </div>

        {isProcessing && (
          <div className="text-xs text-[var(--color-saffron)] animate-pulse flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Extracting craft attributes...
          </div>
        )}
      </div>

      {/* Extracted Structured Metadata Display */}
      {extractedData && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Structured Entities Extracted Automatically
            </span>
            <span className="text-[10px] text-emerald-300 font-mono">Accuracy: {extractedData.confidence}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-black/20">
              <div className="text-[10px] text-gray-400">Craft Category</div>
              <div className="font-semibold text-white truncate">{extractedData.craftType}</div>
            </div>
            <div className="p-2 rounded-lg bg-black/20">
              <div className="text-[10px] text-gray-400">Raw Material</div>
              <div className="font-semibold text-white truncate">{extractedData.material}</div>
            </div>
            <div className="p-2 rounded-lg bg-black/20">
              <div className="text-[10px] text-gray-400">Labor Invested</div>
              <div className="font-semibold text-[var(--color-saffron)]">{extractedData.laborHours} Hours</div>
            </div>
            <div className="p-2 rounded-lg bg-black/20">
              <div className="text-[10px] text-gray-400">Materials Cost</div>
              <div className="font-semibold text-emerald-400">₹{extractedData.rawMaterialCost}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
