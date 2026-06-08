'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'motion/react';
import { 
  Building2, 
  Briefcase, 
  Coins, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  TrendingDown,
  BarChart3,
  Globe,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

const INDUSTRIES = [
  'REIT - Retail',
  'REIT - Residential',
  'REIT - Office/Commercial',
  'Retail Trade',
  'E-commerce & D2C',
  'Software & SaaS',
  'Manufacturing & Logistics',
  'Financial Services',
  'Healthcare & Pharma',
  'Other Services'
];

const CURRENCIES = [
  { code: 'AUD', name: 'AUD - Australian Dollar' },
  { code: 'USD', name: 'USD - US Dollar' },
  { code: 'EUR', name: 'EUR - Euro' },
  { code: 'GBP', name: 'GBP - British Pound' },
  { code: 'CAD', name: 'CAD - Canadian Dollar' },
  { code: 'NZD', name: 'NZD - New Zealand Dollar' },
  { code: 'SGD', name: 'SGD - Singapore Dollar' }
];

export default function SignUpPage() {
  const router = useRouter();
  const { signup, login } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    company_name: '',
    industry: 'REIT - Retail',
    base_currency: 'AUD',
    reporting_currency: 'AUD',
    name: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.company_name.trim()) return setError('Company name is required');
    if (!formData.name.trim()) return setError('Full name is required');
    if (!formData.email.trim()) return setError('Email is required');
    if (!formData.password || formData.password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setLoading(true);
    try {
      const profile = {
        company_name: formData.company_name,
        industry: formData.industry,
        base_currency: formData.base_currency,
        reporting_currency: formData.reporting_currency,
        name: formData.name,
        email: formData.email,
      };

      const success = await signup(profile, formData.password);
      if (success) {
        // Automatically perform login and head to upload page
        const loginSuccess = await login(formData.email, formData.password);
        if (loginSuccess) {
          router.push('/upload');
        } else {
          router.push('/login');
        }
      } else {
        setError('This email is already registered. Please login or use a different email.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
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
            REAL-TIME ACCRUAL INTELLIGENCE
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            High Performance Financial Metrics.
          </h2>
          <p className="text-sm text-zinc-300 font-medium leading-relaxed">
            Gain immediate visibility into revenues, operational expenses, capital requirements, and enterprise analytics formatted specifically for your sector.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Interactive Tools</p>
              <p className="text-sm text-zinc-100 font-semibold">Scenario & COGS Models</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Tailored Ratios</p>
              <p className="text-sm text-zinc-100 font-semibold">REIT & Enterprise KPIs</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-400 font-medium relative z-10">
          &copy; 2026 FinSight. Standard sandbox environments.
        </div>
      </div>

      {/* Actionable Form (Right Column) */}
      <div className="w-full lg:col-span-7 flex flex-col justify-center items-center py-12 px-6 sm:px-12 md:px-16 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[540px] space-y-8 bg-white dark:bg-zinc-900/50 p-8 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/30 dark:shadow-none"
        >
          {/* Headline */}
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">FinSight</span>
            </div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Create your account</h1>
            <p className="text-sm text-zinc-500 font-semibold mt-1">Get started with our enterprise-ready financial system.</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Contact Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="w-4 h-4 text-zinc-400" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Arka Raha"
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100/50 dark:hover:bg-zinc-850/50 focus:bg-white dark:focus:bg-black border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all"
                  />
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Company Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Building2 className="w-4 h-4 text-zinc-400" />
                  </span>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="FF Corp"
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100/50 dark:hover:bg-zinc-850/50 focus:bg-white dark:focus:bg-black border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Industry */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Industry Selector</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Briefcase className="w-4 h-4 text-zinc-400" />
                </span>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                >
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Currency Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Base Currency */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Base Currency</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Coins className="w-4 h-4 text-zinc-400" />
                  </span>
                  <select
                    name="base_currency"
                    value={formData.base_currency}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>{curr.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reporting Currency */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Reporting Currency</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Coins className="w-4 h-4 text-zinc-400" />
                  </span>
                  <select
                    name="reporting_currency"
                    value={formData.reporting_currency}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>{curr.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="arka@ff.com"
                  className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all"
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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all"
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
              id="signup_submit_btn"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-xs font-extrabold hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <span>CREATING ACCOUNT...</span>
              ) : (
                <>
                  <span>CREATE ACCOUNT & START</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Prompt to Login */}
          <div className="text-center">
            <span className="text-xs text-zinc-500 font-semibold">Already have an account? </span>
            <Link href="/login" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 hover:underline">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
