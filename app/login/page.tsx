'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Coins
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) return setError('Email address is required');
    if (!password) return setError('Password is required');

    setLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email address or incorrect password. Please check your credentials or register a new account.');
      }
      // On success, the useAuth watcher will automatically handle redirection based on user role
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100">
      
      {/* Visual Welcome Board (Left Column on Large Screens) */}
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
            SECURE ACCESS PLATFORM
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Accrual-Based Insights for CFOs.
          </h2>
          <p className="text-sm text-zinc-300 font-medium leading-relaxed">
            Gain full control of working capital indices, DSO, DIO, and scenario planning tools inside a unified operational window.
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

      {/* Form Area */}
      <div className="w-full lg:col-span-7 flex flex-col justify-center items-center py-12 px-6 sm:px-12 md:px-16">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[460px] space-y-8 bg-white dark:bg-zinc-900/50 p-8 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/30 dark:shadow-none"
        >
          {/* Headline */}
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">FinSight</span>
            </div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Sign in to FinSight</h1>
            <p className="text-sm text-zinc-500 font-semibold mt-1">Enter your credentials to manage your business dashboard.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-4 h-4 text-zinc-400" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="arka@ff.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Password</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-4 h-4 text-zinc-400" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login_submit_btn"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-xs font-extrabold hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <span>SIGNING IN...</span>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Prompt to register */}
          <div className="text-center pt-2">
            <span className="text-xs text-zinc-500 font-semibold">Don&apos;t have an enterprise account? </span>
            <Link href="/signup" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 hover:underline">
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
