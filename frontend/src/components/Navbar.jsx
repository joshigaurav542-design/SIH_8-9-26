import React from 'react';
import { Globe, Wifi, WifiOff, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ selectedLang, onSelectLang, isOnline, onToggleOnline }) {
  const { language, setLanguage, languages, t } = useLanguage();
  
  const currentLang = selectedLang || language;
  const handleLangChange = (code) => {
    setLanguage(code);
    if (onSelectLang) onSelectLang(code);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#070b16]/85 backdrop-blur-md border-b border-white/8 px-4 py-3 mb-6 shadow-xl">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & SIH Identification */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-terracotta)] to-[var(--color-saffron)] flex items-center justify-center shadow-lg shadow-[var(--color-terracotta-glow)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-heading">
                {t('nav.title', 'Smart Artisan Companion')}
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-saffron)]/20 text-[var(--color-saffron)] border border-[var(--color-saffron)]/30">
                SIH26090
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <span>{t('nav.team', 'Team Bro Code')}</span>
              <span>•</span>
              <span className="text-[var(--color-gold)] flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> {t('nav.subtitle', 'PM Vishwakarma Aligned')}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls: Vernacular Language & Network Toggle */}
        <div className="flex items-center gap-2.5">
          
          {/* Vernacular Language Switcher */}
          <div className="flex items-center gap-1.5 glass-pill px-2.5 py-1.5 border border-amber-500/30 shadow-sm bg-[#131B2E]/90 hover:border-amber-400/50 transition-colors">
            <Globe className="w-4 h-4 text-[var(--color-saffron)] animate-pulse" />
            <select
              aria-label={t('nav.selectLanguage', 'Select language')}
              value={currentLang}
              onChange={(e) => handleLangChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white border-none outline-none cursor-pointer pr-1"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#0f172a] text-white py-1">
                  {lang.label} ({lang.sublabel})
                </option>
              ))}
            </select>
          </div>

          {/* Network State Simulator (Offline-First demonstration) */}
          <button
            onClick={onToggleOnline}
            title={isOnline ? t('nav.offline') : t('nav.online')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              isOnline
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('nav.online', 'Online (Cloud Sync)')}</span>
                <span className="sm:hidden">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('nav.offline', 'Offline (Edge SQLite)')}</span>
                <span className="sm:hidden">Offline</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
