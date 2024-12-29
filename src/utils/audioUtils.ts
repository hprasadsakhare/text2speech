interface LanguageConfig {
  wordsPerMinute: number;
  avgCharsPerWord: number;
}

const languageConfigs: Record<string, LanguageConfig> = {
  'en-US': { wordsPerMinute: 150, avgCharsPerWord: 5 },
  'hi-IN': { wordsPerMinute: 125, avgCharsPerWord: 4 },
  'mr-IN': { wordsPerMinute: 130, avgCharsPerWord: 4.5 } // Adjusted for Marathi
};

export function estimateTextDuration(text: string, languageCode: string): number {
  if (!text) return 0;
  
  const config = languageConfigs[languageCode] || languageConfigs['en-US'];
  const words = text.length / config.avgCharsPerWord;
  const minutes = words / config.wordsPerMinute;
  
  return Math.max(minutes * 60, 1); // Return at least 1 second
}