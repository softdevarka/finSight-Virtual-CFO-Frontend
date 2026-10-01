'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Coins
} from 'lucide-react';
import Link from 'next/link';
import { fetchWithRetry } from '@/lib/utils';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) return setError('Invalid or missing invitation token.');
    if (!name.trim()) return setError('Name is required');
    if (!password) return setError('Password is required');

    setLoading(true);
    try {
      const res = await fetchWithRetry('https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/auth/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          name,
          password
        })
      });

      if (res.ok) {
        // Now automatically log them in by fetching their data or redirecting to login page
        // Since we don't have the login endpoint auto-called, let's redirect to login page
        router.push('/login?message=Account+created.+Please+log+in.');
      } else {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to accept invitation');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100">
      
      {/* Visual Welcome Board */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-tr from-indigo-900 via-indigo-950 to-[#0e0024] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background elements */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BarChart3 className="w-96 h-96 -mr-20 -mt-20 text-white" />
        </div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        
        {/* Header */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">FinSight</span>
        </div>

        {/* Hero Copy */}
        <div className="space-y-6 relative z-10">
          <span className="px-3 py-1 text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            SECURE COLLABORATION
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Accept Your Invitation.
          </h2>
          <p className="text-sm text-zinc-300 font-medium leading-relaxed">
            Join your team to gain full control of working capital indices, DSO, DIO, and scenario planning tools inside a unified operational window.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">State Protection</p>
              <p className="text-sm text-zinc-100 font-semibold">Local Storage Sandboxing</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">High Accuracy</p>
              <p className="text-sm text-zinc-100 font-semibold">Zero Telemetry Logging</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-400 font-medium relative z-10">
          &copy; 2026 FinSight. Standard sandbox environments.
        </div>
      </div>

      {/* Form Section */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-2"
          >
            <h1 className="text-3xl font-extrabold tracking-tight">Complete Profile</h1>
            <p className="text-sm font-medium text-zinc-500">Set up your name and secure password to join.</p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold leading-relaxed"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!token}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">
                  Secure Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!token}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-zinc-900/10"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  Accept Invitation
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Return to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
