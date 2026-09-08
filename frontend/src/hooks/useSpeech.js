import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Speech-to-Text (STT) utilizing Web Speech API with
 * real-time microphone volume detection and fallback support.
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
  const edgeModeRef = useRef(false);

  const isSupported = typeof window !== 'undefined' && 
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Initialize Speech Recognition instance
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // continuous: false avoids cloud websocket drops
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          currentFinal += result[0].transcript;
        } else {
          currentInterim += result[0].transcript;
        }
      }

      if (currentFinal) {
        setTranscript(prev => (prev ? `${prev} ${currentFinal.trim()}` : currentFinal.trim()));
        if (onResult) onResult(currentFinal.trim(), true);
      }
      setInterimTranscript(currentInterim);
      if (currentInterim && onResult) {
        onResult(currentInterim, false);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition event error:', event.error);
      
      // Handle Google cloud speech disconnection (common in Brave, ad-blockers, offline)
      if (event.error === 'network') {
        setIsNetworkError(true);
        setIsEdgeFallback(true);
        edgeModeRef.current = true;
        setError('Browser speech cloud is unreachable or blocked. Live microphone is running in Edge AI Mode.');
        if (onError) onError('network');
        // Do NOT stop microphone analysis or disable isListening!
        return;
      }

      let errorMsg = event.error;
      if (event.error === 'not-allowed') {
        errorMsg = 'Microphone permission was denied. Please allow microphone access.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech was detected. Please try speaking again.';
      }
      setError(errorMsg);
      if (onError) onError(errorMsg);
      stopAudioAnalysis();
      setIsListening(false);
    };

    recognition.onend = () => {
      // If we are in Edge AI fallback mode, keep microphone analysis alive
      if (!edgeModeRef.current) {
        setIsListening(false);
        setInterimTranscript('');
        stopAudioAnalysis();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      stopAudioAnalysis();
    };
  }, [lang, isSupported]);

  // Audio stream & volume level analysis
  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
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
      console.warn('Mic audio analysis unavailable:', err);
      return false;
    }
  };

  const stopAudioAnalysis = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
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
  };

  const startListening = useCallback(async () => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setIsNetworkError(false);
    setIsEdgeFallback(false);
    edgeModeRef.current = false;

    const micOk = await startAudioAnalysis();
    setIsListening(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = lang;
        recognitionRef.current.start();
        return true;
      } catch (err) {
        console.warn('Recognition start exception, using Edge AI mic:', err);
        edgeModeRef.current = true;
        setIsEdgeFallback(true);
        return micOk;
      }
    } else {
      edgeModeRef.current = true;
      setIsEdgeFallback(true);
      return micOk;
    }
  }, [lang]);

  const stopListening = useCallback(() => {
    edgeModeRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    stopAudioAnalysis();
    setIsListening(false);
  }, []);

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
 * Custom hook for Text-to-Speech (TTS) utilizing browser window.speechSynthesis
 * with regional voice selection, speed control, and status tracking.
 */
export function useTextToSpeech({ defaultRate = 0.9, defaultPitch = 1.0 } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);

  const isSupported = typeof window !== 'undefined' && Boolean(window.speechSynthesis);

  // Load available speech synthesis voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      setAvailableVoices(voices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [isSupported]);

  // Find best matching voice for a language code (e.g. 'hi-IN', 'ta-IN', 'bn-IN')
  const getBestVoice = useCallback((langCode) => {
    if (!availableVoices.length) return null;

    const code = (langCode || 'hi-IN').toLowerCase();
    const shortCode = code.split('-')[0];

    // 1. Exact match e.g. "hi-IN"
    let match = availableVoices.find(v => v.lang && v.lang.toLowerCase() === code);
    if (match) return match;

    // 2. Short prefix match e.g. "hi"
    match = availableVoices.find(v => v.lang && v.lang.toLowerCase().startsWith(shortCode));
    if (match) return match;

    // 3. Indian English or default
    match = availableVoices.find(v => v.lang && v.lang.toLowerCase().includes('in'));
    if (match) return match;

    return availableVoices[0] || null;
  }, [availableVoices]);

  const speak = useCallback((text, langCode = 'hi-IN', options = {}) => {
    if (!isSupported || !text) return;

    try {
      // Cancel previous speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = options.rate || defaultRate;
      utterance.pitch = options.pitch || defaultPitch;

      const matchedVoice = getBestVoice(langCode);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

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

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentText('');
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Failed to invoke speech synthesis:', err);
      setIsSpeaking(false);
    }
  }, [isSupported, defaultRate, defaultPitch, getBestVoice]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentText('');
    } catch {
      // ignore
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } catch {
      // ignore
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } catch {
      // ignore
    }
  }, [isSupported]);

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
