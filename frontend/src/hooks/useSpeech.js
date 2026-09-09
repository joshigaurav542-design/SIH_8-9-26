import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Mapping of SIH / PM Vishwakarma language codes to Google TTS engine language codes
 */
const LANG_TO_TTS_CODE = {
  'hi-IN': 'hi',
  'bn-IN': 'bn',
  'ta-IN': 'ta',
  'te-IN': 'te',
  'mr-IN': 'mr',
  'gu-IN': 'gu',
  'kn-IN': 'kn',
  'ml-IN': 'ml',
  'pa-IN': 'pa',
  'or-IN': 'hi', // Odia audio fallback to Indic phonetic or hi
  'en-IN': 'en'
};

/**
 * Keyword matchers for finding local browser SpeechSynthesis voices across OS variants
 */
const VERNACULAR_VOICE_KEYWORDS = {
  'hi-IN': ['hindi', 'hi-in', 'hi_in', 'heera', 'kalpana', 'hemant', 'hi'],
  'bn-IN': ['bengali', 'bangla', 'bn-in', 'bn_in', 'bn-bd', 'bn'],
  'ta-IN': ['tamil', 'ta-in', 'ta_in', 'valluvar', 'ta-lk', 'ta'],
  'te-IN': ['telugu', 'te-in', 'te_in', 'chitra', 'mohan', 'te'],
  'mr-IN': ['marathi', 'mr-in', 'mr_in', 'aarohi', 'mr'],
  'gu-IN': ['gujarati', 'gu-in', 'gu_in', 'dhwani', 'gu'],
  'kn-IN': ['kannada', 'kn-in', 'kn_in', 'sapna', 'kn'],
  'ml-IN': ['malayalam', 'ml-in', 'ml_in', 'midhun', 'ml'],
  'pa-IN': ['punjabi', 'pa-in', 'pa_in', 'gurmukhi', 'pa'],
  'or-IN': ['odia', 'oriya', 'or-in', 'or_in', 'or'],
  'en-IN': ['en-in', 'en_in', 'india', 'ravi', 'neerja', 'prabhat']
};

/**
 * Custom hook for Speech-to-Text (STT) utilizing Web Speech API with
 * immediate user-gesture activation, real-time volume analysis, and fail-safe recovery.
 */
export function useSpeechToText({ lang = 'hi-IN', onResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0); // 0 to 100
  const [error, setError] = useState(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isEdgeFallback, setIsEdgeFallback] = useState(false);

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const isListeningRef = useRef(false);
  const manualStopRef = useRef(false);
  const edgeModeRef = useRef(false);

  const isSupported = typeof window !== 'undefined' && 
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Stop microphone audio analysis
  const stopAudioAnalysis = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      } catch {
        // ignore
      }
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    setVolumeLevel(0);
  }, []);

  // Start microphone stream & live volume analysis
  const startAudioAnalysis = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return true;

      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current || !isListeningRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setVolumeLevel(normalized);
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
      return true;
    } catch (err) {
      console.warn('Microphone audio stream analysis warning:', err);
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      stopAudioAnalysis();
    };
  }, [stopAudioAnalysis]);

  // Start speech recognition immediately within the user-gesture callstack
  const startListening = useCallback(async () => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setIsNetworkError(false);
    setIsEdgeFallback(false);
    manualStopRef.current = false;
    edgeModeRef.current = false;
    isListeningRef.current = true;
    setIsListening(true);

    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (SpeechRecognition) {
      try {
        // Abort existing instance if any
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {
            // ignore
          }
        }

        // Create a FRESH instance on each click to prevent Chrome InvalidStateError
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = lang || 'hi-IN';

        recognition.onstart = () => {
          setIsListening(true);
          isListeningRef.current = true;
          setError(null);
        };

        recognition.onresult = (event) => {
          let currentFinal = '';
          let currentInterim = '';

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              currentFinal += result[0].transcript + ' ';
            } else {
              currentInterim += result[0].transcript;
            }
          }

          if (currentFinal) {
            const trimmed = currentFinal.trim();
            setTranscript(trimmed);
            if (onResult) onResult(trimmed, true);
          }
          setInterimTranscript(currentInterim);
          if (currentInterim && onResult) {
            onResult(currentInterim, false);
          }
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition event:', event.error);

          // Handle Google cloud speech disconnection / Brave ad-blocker silently without alarming the user
          if (event.error === 'network') {
            setIsNetworkError(false);
            setIsEdgeFallback(true);
            edgeModeRef.current = true;
            setError(null);
            return;
          }

          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setError('Microphone permission was denied. Please allow microphone access in browser settings.');
            if (onError) onError('not-allowed');
            setIsListening(false);
            isListeningRef.current = false;
            stopAudioAnalysis();
            return;
          }

          if (event.error !== 'no-speech') {
            console.info('Speech recognition status:', event.error);
          }
        };

        recognition.onend = () => {
          // If stopped naturally but user didn't hit stop and not in edge fallback, attempt restart
          if (isListeningRef.current && !manualStopRef.current && !edgeModeRef.current) {
            try {
              recognition.start();
              return;
            } catch {
              // ignore
            }
          }

          if (!edgeModeRef.current) {
            setIsListening(false);
            isListeningRef.current = false;
            setInterimTranscript('');
            stopAudioAnalysis();
          }
        };

        recognitionRef.current = recognition;
        
        // CRITICAL: Call recognition.start() synchronously to maintain browser user gesture activation!
        recognition.start();
      } catch (err) {
        console.warn('Native SpeechRecognition startup exception, activating Edge AI mic fallback:', err);
        edgeModeRef.current = true;
        setIsEdgeFallback(true);
      }
    } else {
      // Browser does not support Web Speech API natively (e.g., Firefox Desktop)
      edgeModeRef.current = true;
      setIsEdgeFallback(true);
    }

    // Start audio visualizer in parallel without blocking synchronous user gesture
    startAudioAnalysis();
    return true;
  }, [lang, onResult, onError, startAudioAnalysis, stopAudioAnalysis]);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    manualStopRef.current = true;
    isListeningRef.current = false;
    edgeModeRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    stopAudioAnalysis();
    setIsListening(false);
    setInterimTranscript('');
  }, [stopAudioAnalysis]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    volumeLevel,
    error,
    isNetworkError,
    isEdgeFallback,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript
  };
}

/**
 * Custom hook for Text-to-Speech (TTS) supporting ALL 11 Indian regional languages.
 * Automatically utilizes browser native voices where available, and seamlessly bridges
 * to authentic high-fidelity Indic audio streaming whenever local voices are absent.
 */
export function useTextToSpeech({ defaultRate = 0.9, defaultPitch = 1.0 } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);

  const audioPlayerRef = useRef(null);
  const isSupported = typeof window !== 'undefined';

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Cleanup audio player on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        try {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        } catch {
          // ignore
        }
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Find genuine matching native voice for an Indic language
  const getBestVoice = useCallback((langCode) => {
    if (!availableVoices.length) return null;

    const code = (langCode || 'hi-IN').toLowerCase();
    const shortCode = code.split('-')[0];
    const keywords = VERNACULAR_VOICE_KEYWORDS[langCode] || [shortCode];

    // 1. Exact match e.g. "hi-IN" or "hi_IN"
    let match = availableVoices.find(v => {
      if (!v.lang) return false;
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang === code || vLang.startsWith(code);
    });
    if (match) return match;

    // 2. Keyword match in voice name or lang code
    match = availableVoices.find(v => {
      const vName = (v.name || '').toLowerCase();
      const vLang = (v.lang || '').toLowerCase();
      return keywords.some(kw => vName.includes(kw) || vLang.includes(kw));
    });
    if (match) return match;

    // 3. Short code match (only if short code matches language prefix)
    match = availableVoices.find(v => v.lang && v.lang.toLowerCase().startsWith(shortCode));
    if (match) return match;

    // Return null so fallback stream can provide authentic pronunciation instead of an English voice
    return null;
  }, [availableVoices]);

  // Play authentic Indic audio stream for languages without local voices
  const speakViaAudioStream = useCallback((text, langCode) => {
    const tlCode = LANG_TO_TTS_CODE[langCode] || 'hi';
    const cleanText = text.substring(0, 190); // safe query parameter length
    const streamUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${tlCode}&client=tw-ob`;

    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      } catch {
        // ignore
      }
    }

    const audio = new Audio(streamUrl);
    audioPlayerRef.current = audio;

    audio.onplay = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentText(text);
    };

    audio.onended = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentText('');
      audioPlayerRef.current = null;
    };

    audio.onerror = (e) => {
      console.warn('Audio stream TTS error, falling back to browser synthesis:', e);
      // Fallback to standard speech synthesis if network blocks stream
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = langCode;
          utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentText('');
          };
          window.speechSynthesis.speak(utterance);
        } catch {
          setIsSpeaking(false);
        }
      } else {
        setIsSpeaking(false);
      }
    };

    audio.play().catch(err => {
      console.warn('Audio playback error:', err);
      setIsSpeaking(false);
    });
  }, []);

  // Main Speak function
  const speak = useCallback((text, langCode = 'hi-IN', options = {}) => {
    if (!text || typeof window === 'undefined') return;

    // Stop any existing playback
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      } catch {
        // ignore
      }
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }

    const matchedVoice = getBestVoice(langCode);

    // If browser has a genuine native voice for this language, use it
    if (matchedVoice && window.speechSynthesis) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.voice = matchedVoice;
        utterance.rate = options.rate || defaultRate;
        utterance.pitch = options.pitch || defaultPitch;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
          setCurrentText(text);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentText('');
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentText('');
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('Native speechSynthesis error, falling back to audio stream:', err);
      }
    }

    // For all regional languages without installed offline OS voices, play authentic native audio!
    speakViaAudioStream(text, langCode);
  }, [defaultRate, defaultPitch, getBestVoice, speakViaAudioStream]);

  const stop = useCallback(() => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      } catch {
        // ignore
      }
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentText('');
  }, []);

  const pause = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPaused(true);
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.play().catch(() => {});
      setIsPaused(false);
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  return {
    isSpeaking,
    isPaused,
    currentText,
    isSupported,
    availableVoices,
    speak,
    stop,
    pause,
    resume
  };
}
