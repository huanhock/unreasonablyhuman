'use client';

import { useState, useRef } from 'react';

const NAV_ITEMS = [
  { label: 'Daily Brief', path: '/' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Clients', path: '/clients' },
  { label: 'Extract Notes', path: '/scan' },
  { label: 'Meeting Notes', path: '/notes' },
];

export default function DemoPage() {
  const [currentPath, setCurrentPath] = useState('/');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function navigateTo(path: string) {
    setCurrentPath(path);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.location.replace(path);
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-white text-4xl font-bold mb-2">
          Unreasonably<span className="text-orange-400">Human</span>
        </h1>
        <p className="text-white/50 text-sm mb-8">AI-Augmented Relationship Management</p>

        <div className="relative inline-block">
          {/* Phone frame */}
          <div className="relative w-[375px] h-[812px] bg-black rounded-[55px] p-[14px] shadow-2xl shadow-orange-500/20 border-[3px] border-gray-700">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-2xl z-20" />

            {/* Status bar */}
            <div className="absolute top-[14px] left-[14px] right-[14px] h-[44px] bg-[#f8f6f3] rounded-t-[41px] z-10 flex items-end justify-between px-8 pb-1">
              <span className="text-xs font-semibold text-[#1a1a2e]">9:41</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-[17px] h-[12px]" viewBox="0 0 17 12" fill="none">
                  <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#1a1a2e"/>
                  <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5" fill="#1a1a2e"/>
                  <rect x="9" y="3" width="3" height="9" rx="0.5" fill="#1a1a2e"/>
                  <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#1a1a2e"/>
                </svg>
                <svg className="w-[25px] h-[12px]" viewBox="0 0 25 12" fill="none">
                  <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="#1a1a2e" strokeWidth="1"/>
                  <rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="#1a1a2e"/>
                  <rect x="2" y="2" width="15" height="8" rx="1" fill="#1a1a2e"/>
                </svg>
              </div>
            </div>

            {/* Screen */}
            <div className="w-full h-full rounded-[41px] overflow-hidden bg-[#f8f6f3] flex flex-col">
              <div className="shrink-0 h-[44px]" />
              <iframe
                ref={iframeRef}
                src={currentPath}
                className="w-full flex-1 border-0"
                title="UnreasonablyHuman App"
              />
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-gray-600 rounded-full z-20" />
          </div>
        </div>

        {/* Presenter controls */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-xl">
          {NAV_ITEMS.map((nav) => (
            <button
              key={nav.path}
              onClick={() => navigateTo(nav.path)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                currentPath === nav.path
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </div>
        <p className="text-white/30 text-xs mt-4">Presenter controls — also navigate within the phone</p>
      </div>
    </div>
  );
}
