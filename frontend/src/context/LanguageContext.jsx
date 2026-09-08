import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('artisan_language') || 'hi-IN';
    } catch {
      return 'hi-IN';
    }
  });

  const setLanguage = (langCode) => {
    if (TRANSLATIONS[langCode]) {
      setLanguageState(langCode);
      try {
        localStorage.setItem('artisan_language', langCode);
      } catch (err) {
        console.warn('Could not save language to localStorage:', err);
      }
    }
  };

  // Helper function to resolve dot-notation translation keys e.g. "nav.title"
  const t = (path, defaultVal = '') => {
    if (!path) return defaultVal;
    const keys = path.split('.');
    
    // 1. Try currently selected language
    let current = TRANSLATIONS[language];
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        current = undefined;
        break;
      }
    }
    if (current !== undefined) return current;

    // 2. Fallback to English (en-IN)
    let fallback = TRANSLATIONS['en-IN'];
    for (const k of keys) {
      if (fallback && fallback[k] !== undefined) {
        fallback = fallback[k];
      } else {
        fallback = undefined;
        break;
      }
    }
    if (fallback !== undefined) return fallback;

    // 3. Return provided default or key path
    return defaultVal || path;
  };

  const currentLangMeta = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      languages: SUPPORTED_LANGUAGES,
      currentLangMeta
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
