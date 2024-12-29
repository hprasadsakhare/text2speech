import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Download, Play, Square, Rewind, FastForward } from 'lucide-react';
import AudioTimeline from './AudioTimeline';
import AudioControls from './AudioControls';
import { useVoiceSelection } from '../hooks/useVoiceSelection';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { downloadAudio } from '../utils/audioDownload';

function TextToSpeech() {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const { selectedLanguage, setSelectedLanguage, availableLanguages } = useVoiceSelection();
  const { 
    isPlaying, 
    currentTime, 
    duration,
    rate,
    pitch,
    setRate,
    setPitch,
    handleSpeak,
    handleSeek,
    skipTime,
    handleDownload
  } = useSpeechSynthesis(text, selectedLanguage, setError);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-800">Text to Speech Converter</h1>
            </div>
            <button
              onClick={() => handleDownload(text)}
              className="inline-flex items-center px-3 py-2 border border-purple-600 rounded-md text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              title="Download audio"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Language
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                value={selectedLanguage.code}
                onChange={(e) => setSelectedLanguage(availableLanguages.find(lang => lang.code === e.target.value) || availableLanguages[0])}
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Text
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 h-32"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Enter ${selectedLanguage.name} text here...`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speech Rate ({rate}x)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pitch ({pitch})
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <AudioTimeline
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onSeek={handleSeek}
            />

            <AudioControls
              isPlaying={isPlaying}
              onPlay={handleSpeak}
              onSkipBackward={() => skipTime(-10)}
              onSkipForward={() => skipTime(10)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextToSpeech;