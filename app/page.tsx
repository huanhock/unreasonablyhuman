'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDemoLogin() {
    setLoading(true);
    await fetch('/api/demo-user', { method: 'POST' });
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: 'aie-demo@unreasonablyhuman.app',
      password: 'test1234',
    });
    if (!error) {
      await fetch('/api/seed', { method: 'POST' });
      await fetch('/api/seed-more', { method: 'POST' });
      router.push('/brief');
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#f8f6f3]">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-[#1a1a2e] tracking-tight">
            Unreasonably<span className="text-orange-500">Human</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            Let AI manage the details, so you can focus on being human.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-2xl font-semibold text-lg hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-orange-200"
          >
            {loading ? 'Loading demo...' : 'Try Demo'}
          </button>

          <button
            onClick={() => router.push('/login')}
            className="w-full py-4 bg-[#1a1a2e] text-white rounded-2xl font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Login / Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
