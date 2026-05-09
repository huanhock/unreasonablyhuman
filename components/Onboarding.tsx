'use client';

import { useState, useEffect } from 'react';

const STEPS = [
  {
    emoji: '👆',
    title: 'Swipe Your Daily Brief',
    desc: 'Swipe left and right to browse your morning cards — calendar, todos, birthdays, and more.',
  },
  {
    emoji: '👥',
    title: 'Know Your Clients',
    desc: 'Tap any client to see their full profile, meeting history, and preferences — all editable.',
  },
  {
    emoji: '📝',
    title: 'Capture Meeting Notes',
    desc: 'Type, snap a photo, or use voice to capture notes. AI extracts and organizes everything.',
  },
] as const;

const STORAGE_KEY = 'onboarding_done';

export default function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function finish() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white/90 rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-auto">
        {/* Emoji icon */}
        <div className="text-6xl text-center mb-6" aria-hidden="true">
          {current.emoji}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#1a1a2e] text-center mb-2">
          {current.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-600 text-center leading-snug mb-8 line-clamp-2">
          {current.desc}
        </p>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? '0.625rem' : '0.5rem',
                height: i === step ? '0.625rem' : '0.5rem',
                background:
                  i === step
                    ? 'linear-gradient(to right, #f97316, #fb923c)'
                    : 'rgb(203 213 225)',
                display: 'block',
              }}
            />
          ))}
        </div>

        {/* Next / Get Started button */}
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-2xl text-white font-semibold text-base shadow-md transition-opacity hover:opacity-90 active:opacity-80"
          style={{
            background: 'linear-gradient(to right, #f97316, #fb923c)',
          }}
        >
          {isLast ? 'Get Started' : 'Next'}
        </button>

        {/* Skip link */}
        {!isLast && (
          <button
            onClick={finish}
            className="w-full mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
