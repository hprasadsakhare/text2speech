export function findBestVoiceForLanguage(
  voices: SpeechSynthesisVoice[],
  languageCode: string
): SpeechSynthesisVoice | null {
  // First try to find a native/local voice
  const nativeVoice = voices.find(
    voice => voice.lang.startsWith(languageCode) && voice.localService
  );
  if (nativeVoice) return nativeVoice;

  // Then try any voice for the language
  const anyVoice = voices.find(
    voice => voice.lang.startsWith(languageCode)
  );
  if (anyVoice) return anyVoice;

  return null;
}

export function isVoiceSupported(languageCode: string): boolean {
  const voices = window.speechSynthesis.getVoices();
  return voices.some(voice => voice.lang.startsWith(languageCode));
}