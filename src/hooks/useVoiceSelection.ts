import { useState, useEffect } from 'react';
import { findBestVoiceForLanguage } from '../utils/voiceUtils';

interface Language {
  code: string;
  name: string;
  voice: string;
}

const defaultLanguages: Language[] = [
  { code: 'en-US', name: 'English (US)', voice: 'en-US-Standard-C' },
  { code: 'hi-IN', name: 'हिंदी (Hindi)', voice: 'hi-IN-Standard-A' },
  { code: 'mr-IN', name: 'मराठी (Marathi)', voice: 'mr-IN-Standard-A' }
];

export function useVoiceSelection() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(defaultLanguages[0]);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>(defaultLanguages);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    function updateVoices() {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Filter languages that have available voices
      const supported = defaultLanguages.filter(lang => 
        availableVoices.some(voice => voice.lang.startsWith(lang.code))
      );
      
      setAvailableLanguages(supported.length ? supported : defaultLanguages);
    }

    // Initial load
    updateVoices();
    
    // Handle dynamic voice loading
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Update voice when language changes
  useEffect(() => {
    const bestVoice = findBestVoiceForLanguage(voices, selectedLanguage.code);
    if (bestVoice) {
      setSelectedLanguage(prev => ({
        ...prev,
        voice: bestVoice.name
      }));
    }
  }, [selectedLanguage.code, voices]);

  return {
    selectedLanguage,
    setSelectedLanguage,
    availableLanguages,
    voices
  };
}