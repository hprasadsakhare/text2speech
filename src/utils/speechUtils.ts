interface SpeechConfig {
  lang: string;
  rate: number;
  pitch: number;
  onEnd: () => void;
  onError: () => void;
}

export function configureSpeechUtterance(
  utterance: SpeechSynthesisUtterance,
  config: SpeechConfig
): void {
  utterance.lang = config.lang;
  utterance.rate = config.rate;
  utterance.pitch = config.pitch;
  utterance.onend = config.onEnd;
  utterance.onerror = config.onError;
  
  // Improve voice quality settings
  utterance.volume = 1;
  
  // Try to get a more natural voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    voice => voice.lang === config.lang && voice.localService
  );
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
}