'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Settings, 
  HelpCircle,
  LogOut,
  ChevronRight,
  X,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { icon: LayoutDashboard, label: 'Revenue & Expense', href: '/' },
  { icon: Wallet, label: 'Working Capital', href: '/working-capital' },
  { icon: BarChart3, label: 'Forecasting', href: '/forecasting' },
  { icon: PieChart, label: 'Revenue by Customer', href: '/revenue-by-customer' },
  { icon: TrendingUp, label: 'Trends', href: '/trends' },
];

const secondaryItems = [
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Support' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-50 w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-screen bg-white dark:bg-[#09090b] transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">FinSight</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 md:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 px-3">
              Main Menu
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" 
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-4 h-4", isActive ? "text-indigo-600 dark:text-indigo-400" : "group-hover:text-indigo-600 dark:group-hover:text-indigo-400")} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-zinc-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-zinc-200 dark:border-zinc-800">
          <nav className="space-y-1 mb-6">
            {secondaryItems.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-3 py-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AR'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-zinc-900 dark:text-white">{user?.name || 'Arka Raha'}</p>
              <p className="text-[10px] text-zinc-500 truncate">CFO, {user?.company_name || 'FF Corp'}</p>
            </div>
            <button 
              onClick={() => logout()}
              title="Logout"
              className="p-1 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 animate-out" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
