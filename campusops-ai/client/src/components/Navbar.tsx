import React, { useEffect, useState } from 'react'
import {
  Activity,
  Bot,
  LayoutDashboard,
  Menu,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  X,
  Zap,
  BarChart3,
  Search,
  Bell,
  Cpu,
} from 'lucide-react'
import { fetchNotifications } from '../lib/api'

interface NavbarProps {
  activeTab: 'landing' | 'report' | 'admin' | 'analytics'
  onSelectTab: (tab: 'landing' | 'report' | 'admin' | 'analytics') => void
  onToggleMobileSidebar?: () => void
  onOpenCommandPalette?: () => void
  onOpenNotifications?: () => void
  onLaunchDemo?: () => void
  incidentCount?: number
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onToggleMobileSidebar,
  onOpenCommandPalette,
  onOpenNotifications,
  onLaunchDemo,
  incidentCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.ok)
      .then((ok) => setBackendOnline(ok))
      .catch(() => setBackendOnline(false))

    fetchNotifications().then((list) => {
      setUnreadNotifCount(list.filter((n: any) => !n.read).length)
    }).catch(() => {})
  }, [])

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.07] bg-[#05070D]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Sidebar Trigger + Brand */}
        <div className="flex items-center gap-3">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-300 hover:text-white"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => onSelectTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full bg-[#05070D] rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  CampusOps<span className="text-cyan-400">.AI</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full font-mono">
                  Gemini 3.6
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Autonomous Operations Platform
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Command Bar Trigger */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#07111F] hover:bg-[#0B1020] border border-white/[0.08] hover:border-cyan-500/30 text-slate-400 hover:text-slate-200 text-xs transition-all max-w-xs w-full"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="flex-1 text-left truncate text-[11px]">Search operations (Ctrl+K)...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#07111F] p-1.5 rounded-2xl border border-white/[0.06]">
          <button
            onClick={() => onSelectTab('landing')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'landing'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Overview
          </button>

          <button
            onClick={() => onSelectTab('report')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'report'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Issue
          </button>

          <button
            onClick={() => onSelectTab('admin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Incidents
            {incidentCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                {incidentCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
        </nav>

        {/* Right Status & Notifications */}
        <div className="flex items-center gap-2.5">
          {/* Live Demo Launcher */}
          {onLaunchDemo && (
            <button
              onClick={onLaunchDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all shadow-sm"
              title="Launch Guided Executive Demo"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Live Demo</span>
            </button>
          )}

          {/* Notification Bell */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-[#07111F] hover:bg-[#0B1020] border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#07111F] border border-white/[0.06] text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline === true
                  ? 'bg-emerald-400 animate-pulse'
                  : backendOnline === false
                  ? 'bg-rose-400'
                  : 'bg-yellow-400'
              }`}
            />
            <span className="text-[11px] text-slate-300 font-medium font-mono">
              {backendOnline === true ? 'Agent Online' : backendOnline === false ? 'Offline' : 'Connecting'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
