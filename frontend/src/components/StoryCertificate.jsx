import React, { useState } from 'react';
import { Sparkles, Copy, Check, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTextToSpeech } from '../hooks/useSpeech';

export default function StoryCertificate({ craft, artisanName = "Ramprasad Prajapati", region = "Gorakhpur / Varanasi, Uttar Pradesh" }) {
  const { currentLanguage, t } = useLanguage();
  const { isSpeaking, speak, stop } = useTextToSpeech();
  const [copied, setCopied] = useState(false);
  
  const craftStory = (
    `Handcrafted in the historic clusters of ${region} by master artisan ${artisanName}. ` +
    `Utilizing indigenous techniques preserved across generations, this ${craft?.name || 'piece'} ` +
    `is shaped with sustainable, locally-harvested materials. Aligned with PM Vishwakarma ` +
    `heritage craft traditions with automated visual quality verification (Symmetry: ${craft?.symmetry || 96.4}%, Density: ${craft?.density || 94.1}%).`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(`Craft Heritage Story - ${craft?.name || 'Craft'}:\n${craftStory}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-5 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[var(--color-terracotta)] text-white text-xs font-bold flex items-center justify-center">
            3b
          </span>
          <h2 className="text-base font-bold text-white font-heading">
            Generative Storytelling & Cultural Narrative
          </h2>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[var(--color-gold)] border border-amber-500/30 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> GenAI Narrative
        </span>
      </div>

      <p className="text-xs text-[var(--text-muted)] mb-4">
        Conscious luxury buyers value craft heritage. GenAI crafts compelling cultural narratives in local languages. (Official Government GI Heritage Certificate is issued post-registration in My Catalogue).
      </p>

      {/* Story Narrative Card Preview */}
      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-[#1F1710] via-[#141A29] to-[#0D121F] border-2 border-[var(--color-gold)]/40 shadow-2xl overflow-hidden">
        
        {/* Decorative Gold Corner Borders */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[var(--color-gold)]" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[var(--color-gold)]" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[var(--color-gold)]" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[var(--color-gold)]" />

        {/* Story Title & Badge */}
        <div className="text-center pb-4 border-b border-[var(--border-glass)]">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)] mb-1">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-base font-bold tracking-wider text-[var(--color-gold)] uppercase font-heading">
            Craft Heritage & Artisan Lineage Story
          </h3>
          <p className="text-[10px] text-gray-400">
            Multilingual E-Commerce Storytelling • Ready for ONDC Listing Description
          </p>
        </div>

        {/* Main Content & Story */}
        <div className="py-4 space-y-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase text-[var(--color-saffron)] font-bold">Generative Craft Narrative:</span>
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) {
                    stop();
                  } else {
                    speak(craftStory, currentLanguage);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSpeaking
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-amber-500/15 text-[var(--color-gold)] border border-amber-500/30 hover:bg-amber-500/25'
                }`}
                title="Listen to story narrative in current language"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    <span>{t('voice.stopAudio', 'Stop Audio')}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                    <span>{t('voice.listenStory', 'Listen to Heritage Story')}</span>
                  </>
                )}
              </button>
            </div>
            <p className={`text-gray-200 leading-relaxed italic bg-black/30 p-3 rounded-xl border transition-all ${
              isSpeaking ? 'border-[var(--color-gold)]/60 bg-amber-950/20 shadow-lg' : 'border-white/5'
            }`}>
              "{craftStory}"
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
            <div className="p-2 rounded-lg bg-black/30">
              <span className="text-[9px] text-gray-400 block">Master Artisan</span>
              <span className="font-semibold text-white">{artisanName}</span>
            </div>
            <div className="p-2 rounded-lg bg-black/30">
              <span className="text-[9px] text-gray-400 block">Regional Lineage</span>
              <span className="font-semibold text-white">{region.split(',')[0]}</span>
            </div>
            <div className="p-2 rounded-lg bg-black/30 col-span-2 sm:col-span-1">
              <span className="text-[9px] text-gray-400 block">Craft Style</span>
              <span className="font-mono text-[var(--color-gold)] font-bold">{craft?.craftStyle || craft?.category || 'Handicraft'}</span>
            </div>
          </div>
        </div>

        {/* Footer: Story Copy & Verification Notice */}
        <div className="pt-3 border-t border-[var(--border-glass)] flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Official GI Certificate & Provenance Passport issued post-registration in <strong>My Catalogue</strong>.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Story'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
