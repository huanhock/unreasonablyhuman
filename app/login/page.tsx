'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  }

  async function handleDemoLogin() {
    setLoading(true);
    setError('');
    await fetch('/api/demo-user', { method: 'POST' });
    const demoEmail = 'aie-demo@unreasonablyhuman.app';
    const demoPassword = 'test1234';
    setEmail(demoEmail);
    setPassword(demoPassword);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      await fetch('/api/seed', { method: 'POST' });
      await fetch('/api/seed-more', { method: 'POST' });
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">
            Unreasonably<span className="text-orange-500">Human</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">AI-Augmented Relationship Management</p>
        </div>

        <form onSubmit={handleLogin} className="glass p-6 space-y-4">
          <h2 className="text-xl font-bold text-[#1a1a2e]">Sign in</h2>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-3 rounded-lg border border-orange-200 bg-white focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-3 rounded-lg border border-orange-200 bg-white focus:border-orange-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="relative flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3 bg-[#1a1a2e] text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Try Demo
          </button>

          <p className="text-sm text-center text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-orange-500 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
