import React, { useEffect } from 'react'
import {
  Home,
  Radio,
  PlusCircle,
  BarChart3,
  Settings,
  User,
  Bot,
  Activity,
  Cpu,
  Sparkles,
  ChevronRight,
  X,
  Bell,
  Layers,
  LogOut,
  Wrench,
} from 'lucide-react'

export type NavigationTab = 'landing' | 'report' | 'admin' | 'workorders' | 'intelligence' | 'analytics' | 'settings'

interface SidebarProps {
  activeTab: NavigationTab
  onSelectTab: (tab: NavigationTab) => void
  onOpenAuth?: () => void
  onOpenNotifications?: () => void
  incidentCount?: number
  criticalCount?: number
  currentUser?: { name: string; email: string; role: string } | null
  isOpenMobile?: boolean
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAuth,
  onOpenNotifications,
  incidentCount = 0,
  criticalCount = 0,
  currentUser = { name: 'Operations Director', email: 'admin.ops@campusops.edu', role: 'admin' },
  isOpenMobile = false,
  onCloseMobile,
}) => {
  useEffect(() => {
    if (isOpenMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpenMobile])

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#05070D]/85 backdrop-blur-md lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`w-64 bg-[#07111F] border-r border-white/[0.07] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'fixed left-0 top-0 translate-x-0 z-50 shadow-2xl' : 'hidden lg:flex z-30'
        }`}
      >
        {/* Top Brand */}
        <div>
          <div className="p-5 flex items-center justify-between border-b border-white/[0.06]">
            <div
              onClick={() => {
                onSelectTab('landing')
                onCloseMobile?.()
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 p-[1px] shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all">
                <div className="w-full h-full bg-[#05070D] rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white">
                    CampusOps<span className="text-cyan-400">.AI</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase block">
                  Autonomous Operations
                </span>
              </div>
            </div>

            {isOpenMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 3 Architecture Pillars Navigation */}
          <div className="p-3 space-y-4">
            {/* 1. OVERVIEW & INTAKE */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 block">
                Overview & Intake
              </span>
              <button
                onClick={() => {
                  onSelectTab('landing')
                  onCloseMobile?.()
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'landing'
                    ? 'bg-cyan-500/15 text-white font-semibold border-l-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <Home className={`w-4 h-4 ${activeTab === 'landing' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>Operations Overview</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('report')
                  onCloseMobile?.()
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'report'
                    ? 'bg-cyan-500/15 text-white font-semibold border-l-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className={`w-4 h-4 ${activeTab === 'report' ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>Natural Intake & Demo</span>
                </div>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
                  Pre-Extract
                </span>
              </button>
            </div>

            {/* 2. OPERATIONS COMMAND */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 block">
                Operations Command
              </span>
              <button
                onClick={() => {
                  onSelectTab('admin')
                  onCloseMobile?.()
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-cyan-500/15 text-white font-semibold border-l-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Radio className={`w-4 h-4 ${activeTab === 'admin' ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>Priority Triage Queue</span>
                </div>
                {incidentCount > 0 && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                      criticalCount > 0
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-white/[0.06] text-slate-300'
                    }`}
                  >
                    {incidentCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onSelectTab('workorders')
                  onCloseMobile?.()
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'workorders'
                    ? 'bg-cyan-500/15 text-white font-semibold border-l-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className={`w-4 h-4 ${activeTab === 'workorders' ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>Resolution Work Orders</span>
                </div>
              </button>
            </div>

            {/* 3. INTELLIGENCE MESH */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 block">
                Intelligence Mesh
              </span>
              <button
                onClick={() => {
                  onSelectTab('intelligence')
                  onCloseMobile?.()
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'intelligence'
                    ? 'bg-cyan-500/15 text-white font-semibold border-l-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <Cpu className={`w-4 h-4 ${activeTab === 'intelligence' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>AI Multi-Tool Agents</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('analytics')
                  onCloseMobile?.()
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-cyan-500/15 text-white font-semibold border-l-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>Risk & SLA Telemetry</span>
              </button>
            </div>

            {/* SYSTEM */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 block">
                System
              </span>
              {onOpenNotifications && (
                <button
                  onClick={() => {
                    onOpenNotifications()
                    onCloseMobile?.()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] transition-colors"
                >
                  <Bell className="w-4 h-4 text-slate-500" />
                  <span>Notifications</span>
                </button>
              )}

              <button
                onClick={() => {
                  onSelectTab('settings')
                  onCloseMobile?.()
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-cyan-500/15 text-white font-semibold border-l-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Account Switcher */}
        <div className="p-3 border-t border-white/[0.06] space-y-2">
          <div
            onClick={onOpenAuth}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white uppercase">
                {currentUser?.name ? currentUser.name[0] : 'O'}
              </div>
              <div className="text-left truncate max-w-[120px]">
                <span className="text-xs font-semibold text-slate-200 block leading-tight truncate">
                  {currentUser?.name || 'Operations Staff'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono capitalize">
                  {currentUser?.role || 'Staff'} Account
                </span>
              </div>
            </div>
            <User className="w-3.5 h-3.5 text-slate-500 hover:text-cyan-400 transition-colors" />
          </div>
        </div>
      </aside>
    </>
  )
}
