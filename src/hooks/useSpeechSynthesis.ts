import { useState, useRef, useEffect } from 'react';
import { estimateTextDuration } from '../utils/audioUtils';
import { configureSpeechUtterance } from '../utils/speechUtils';
import { findBestVoiceForLanguage } from '../utils/voiceUtils';

interface Language {
  code: string;
  name: string;
  voice: string;
}

export function useSpeechSynthesis(
  text: string,
  selectedLanguage: Language,
  setError: (error: string) => void
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (isPlaying) {
      stopSpeech();
    }
    setCurrentTime(0);
    setDuration(estimateTextDuration(text, selectedLanguage.code));
  }, [selectedLanguage, text]);

  useEffect(() => {
    const updateProgress = () => {
      if (isPlaying && startTimeRef.current) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setCurrentTime(Math.min(elapsed, duration));
        
        if (elapsed < duration) {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        } else {
          stopSpeech();
        }
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, duration]);

  const stopSpeech = () => {
    try {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentTime(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } catch (err) {
      console.error('Error stopping speech:', err);
      setError('Error stopping speech playback');
    }
  };

  const handleSpeak = () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }
    
    if (isPlaying) {
      stopSpeech();
      return;
    }

    try {
      setError('');
      const voices = window.speechSynthesis.getVoices();
      const bestVoice = findBestVoiceForLanguage(voices, selectedLanguage.code);
      
      if (!bestVoice) {
        setError(`No voice available for ${selectedLanguage.name}`);
        return;
      }

      utteranceRef.current = new SpeechSynthesisUtterance(text);
      utteranceRef.current.voice = bestVoice;
      utteranceRef.current.lang = selectedLanguage.code;
      utteranceRef.current.rate = rate;
      utteranceRef.current.pitch = pitch;
      
      utteranceRef.current.onend = () => {
        stopSpeech();
      };
      
      utteranceRef.current.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setError(`Error playing ${selectedLanguage.name} speech. Please try again.`);
        stopSpeech();
      };

      startTimeRef.current = Date.now();
      window.speechSynthesis.speak(utteranceRef.current);
      setIsPlaying(true);
      setCurrentTime(0);
    } catch (err) {
      console.error('Error initializing speech:', err);
      setError('Error initializing speech. Please try again.');
    }
  };

  const handleSeek = (time: number) => {
    if (time === duration) {
      stopSpeech();
      return;
    }

    setCurrentTime(time);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      
      const textPosition = Math.floor((time / duration) * text.length);
      const remainingText = text.substring(textPosition);
      
      utteranceRef.current = new SpeechSynthesisUtterance(remainingText);
      const voices = window.speechSynthesis.getVoices();
      const bestVoice = findBestVoiceForLanguage(voices, selectedLanguage.code);
      
      if (bestVoice) {
        utteranceRef.current.voice = bestVoice;
        utteranceRef.current.lang = selectedLanguage.code;
        utteranceRef.current.rate = rate;
        utteranceRef.current.pitch = pitch;
        
        utteranceRef.current.onend = () => {
          stopSpeech();
        };
        
        utteranceRef.current.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setError(`Error playing ${selectedLanguage.name} speech. Please try again.`);
          stopSpeech();
        };

        startTimeRef.current = Date.now() - (time * 1000);
        window.speechSynthesis.speak(utteranceRef.current);
      }
    }
  };

  const skipTime = (seconds: number) => {
    const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
    handleSeek(newTime);
  };

  const handleDownload = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }
    
    try {
      const voices = window.speechSynthesis.getVoices();
      const bestVoice = findBestVoiceForLanguage(voices, selectedLanguage.code);
      
      if (!bestVoice) {
        setError(`No voice available for ${selectedLanguage.name}`);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = bestVoice;
      utterance.lang = selectedLanguage.code;
      utterance.rate = rate;
      utterance.pitch = pitch;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = `speech_${selectedLanguage.code}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(audioUrl);
      };

      mediaRecorder.start();
      window.speechSynthesis.speak(utterance);

      utterance.onend = () => {
        mediaRecorder.stop();
        audioContext.close();
      };

      utterance.onerror = () => {
        mediaRecorder.stop();
        audioContext.close();
        setError('Error generating audio file');
      };
    } catch (err) {
      console.error('Error downloading audio:', err);
      setError('Error generating audio file');
    }
  };

  return {
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
  };
}