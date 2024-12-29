import React from 'react';
import { formatTime } from '../utils/timeFormat';

interface AudioTimelineProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
}

export default function AudioTimeline({ currentTime, duration, isPlaying, onSeek }: AudioTimelineProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onSeek(time);
  };

  return (
    <div className="space-y-2">
      <div className="relative w-full h-2 bg-gray-200 rounded-full">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute h-full bg-purple-600 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}