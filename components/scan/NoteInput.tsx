'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
    SpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface NoteInputProps {
  value: string;
  onChange: (v: string) => void;
  onExtract: () => void;
  onExtractImage: (file: File) => void;
  loading: boolean;
}

export default function NoteInput({ value, onChange, onExtract, onExtractImage, loading }: NoteInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [mode, setMode] = useState<'text' | 'image' | 'voice'>('text');
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  useEffect(() => {
    setIsSpeechSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionCtor = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let accumulated = '';
      for (let i = 0; i < event.results.length; i++) {
        accumulated += event.results[i][0].transcript;
      }
      setTranscript(accumulated);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setTranscript((prev) => {
        if (prev.trim()) {
          onChange(prev);
          setMode('text');
        }
        return prev;
      });
    };

    recognition.start();
    setIsRecording(true);
    setTranscript('');
  }, [isRecording, onChange]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('text')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
            mode === 'text' ? 'bg-orange-500 text-white' : 'bg-white/60 text-slate-600 ring-1 ring-white/80'
          }`}
        >
          ✍️ Type Notes
        </button>
        <button
          onClick={() => setMode('image')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
            mode === 'image' ? 'bg-orange-500 text-white' : 'bg-white/60 text-slate-600 ring-1 ring-white/80'
          }`}
        >
          📷 Photo / Upload
        </button>
        <button
          onClick={() => setMode('voice')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
            mode === 'voice' ? 'bg-orange-500 text-white' : 'bg-white/60 text-slate-600 ring-1 ring-white/80'
          }`}
        >
          🎙️ Voice
        </button>
      </div>

      {mode === 'text' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Paste or type your meeting notes here...

Example:
Met with Sarah Chen at The Roastery for coffee. Discussed Q3 portfolio — she wants to increase allocation to AI stocks. Mentioned her daughter won a science fair. She's finalizing Osaka trip plans for July. Need to send her the updated fund prospectus by Friday.`}
          className="w-full h-64 p-4 rounded-xl border-2 border-orange-200 bg-white focus:border-orange-400 focus:outline-none resize-none text-sm"
        />
      ) : mode === 'image' ? (
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          {preview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Meeting notes" className="w-full rounded-xl border-2 border-orange-200" />
              <button
                onClick={() => { setPreview(null); setSelectedFile(null); }}
                className="absolute top-2 right-2 bg-white/80 rounded-full px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-white"
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-48 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/50 flex flex-col items-center justify-center gap-2 hover:bg-orange-50 transition"
            >
              <span className="text-4xl">📷</span>
              <span className="text-sm text-slate-600 font-medium">Tap to take a photo or upload an image</span>
              <span className="text-xs text-slate-400">Supports handwritten or typed notes</span>
            </button>
          )}
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center rounded-xl border-2 border-orange-200 bg-white">
          {!isSpeechSupported ? (
            <p className="text-sm text-slate-500">Voice input is not supported in this browser.</p>
          ) : (
            <>
              <button
                onClick={toggleRecording}
                className={`w-24 h-24 rounded-full text-white text-4xl flex items-center justify-center mx-auto transition ${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
                }`}
              >
                {isRecording ? '🔴' : '🎙️'}
              </button>
              <p className="mt-3 text-sm text-slate-500 font-medium">
                {isRecording ? 'Tap to stop' : 'Tap to start recording'}
              </p>
              {transcript && (
                <div className="mt-4 p-3 bg-white/60 rounded-xl text-sm text-slate-700 max-h-32 overflow-y-auto w-full mx-4">
                  {transcript}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <button
        onClick={() => {
          if (mode === 'image' && selectedFile) {
            onExtractImage(selectedFile);
          } else {
            onExtract();
          }
        }}
        disabled={loading || (mode === 'text' || mode === 'voice' ? !value.trim() : !selectedFile)}
        className="mt-4 w-full py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl font-semibold text-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? '✨ Extracting with AI...' : '✨ Extract with AI'}
      </button>
    </div>
  );
}
