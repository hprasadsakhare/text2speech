import React from 'react';
import { Play, Square, Rewind, FastForward } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
}

export default function AudioControls({
  isPlaying,
  onPlay,
  onSkipBackward,
  onSkipForward
}: AudioControlsProps) {
  return (
    <div className="flex items-center justify-center space-x-4">
      <button
        onClick={onSkipBackward}
        className="p-2 text-gray-600 hover:text-purple-600 focus:outline-none"
        title="Rewind 10 seconds"
      >
        <Rewind className="w-5 h-5" />
      </button>
      
      <button
        onClick={onPlay}
        className="flex-1 max-w-[200px] inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        {isPlaying ? (
          <>
            <Square className="w-5 h-5 mr-2" />
            Stop
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            Play
          </>
        )}
      </button>

      <button
        onClick={onSkipForward}
        className="p-2 text-gray-600 hover:text-purple-600 focus:outline-none"
        title="Forward 10 seconds"
      >
        <FastForward className="w-5 h-5" />
      </button>
    </div>
  );
}