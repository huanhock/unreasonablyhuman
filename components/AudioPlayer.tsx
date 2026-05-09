'use client';

import { useState, useRef } from 'react';

export default function AudioPlayer() {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  async function generateAudio() {
    setLoading(true);
    try {
      const res = await fetch('/api/audio', { method: 'POST' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.playbackRate = speed;

      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      });
      audio.addEventListener('ended', () => {
        setPlaying(false);
        setProgress(0);
      });

      await audio.play();
      setPlaying(true);
    } catch (err) {
      console.error('Audio generation failed:', err);
    }
    setLoading(false);
  }

  async function togglePlay() {
    if (!audioRef.current && !audioUrlRef.current) {
      await generateAudio();
      return;
    }

    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        await audioRef.current.play();
        setPlaying(true);
      }
    }
  }

  function cycleSpeed() {
    const speeds = [1, 1.25, 1.5];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40">
      <div className="max-w-md mx-auto">
        <div className="mx-4 bg-gradient-to-r from-amber-400 via-orange-300 to-rose-300 rounded-2xl p-3 shadow-lg">
          <div className="h-1 bg-white/30 rounded-full mb-2 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={cycleSpeed}
              className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold text-white"
            >
              {speed}x
            </button>
            <button
              onClick={togglePlay}
              disabled={loading}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              {loading ? (
                <span className="animate-spin text-orange-500">⏳</span>
              ) : playing ? (
                <span className="text-orange-500 text-xl">⏸</span>
              ) : (
                <span className="text-orange-500 text-xl ml-0.5">▶️</span>
              )}
            </button>
            <div className="px-3 py-1 text-sm text-white/80">
              {loading ? 'Generating...' : playing ? '🔊 Playing' : '🎧 Listen'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
