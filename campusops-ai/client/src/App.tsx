import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Sidebar, type NavigationTab } from './components/Sidebar'
import { Landing } from './pages/Landing'
import { Report } from './pages/Report'
import { Admin } from './pages/Admin'
import { Settings } from './pages/Settings'
import { IntakeCommand } from './components/IntakeCommand'
import { TriageCommandCenter } from './components/TriageCommandCenter'
import { IntelligenceMesh } from './components/IntelligenceMesh'
import { CommandPalette } from './components/CommandPalette'
import { NotificationDrawer } from './components/NotificationDrawer'
import { IncidentDetailModal } from './components/IncidentDetailModal'
import { AuthModal, type AuthUser } from './components/AuthModal'
import { ExecutiveDemoModal } from './components/ExecutiveDemoModal'
import { ExecutiveDashboardSummary } from './components/ExecutiveDashboardSummary'
import { AgentActivityCenter } from './components/AgentActivityCenter'
import { fetchIncidents, fetchAdminStats, updateIncidentStatus, deleteIncidentApi } from './lib/api'
import type { Incident, AdminStatsResponse, IncidentStatus } from './types'
import { Bot, Sparkles, Shield, Cpu, Activity, ArrowRight, BarChart3, TrendingUp, CheckCircle2, AlertTriangle, Layers, Wrench, Radio } from 'lucide-react'
import { ToastProvider, useToast } from './components/Toast'

function AppContent() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<NavigationTab>('landing')
  const [selectedPrompt, setSelectedPrompt] = useState<string>('')
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [stats, setStats] = useState<AdminStatsResponse | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Omnibox, Notifications, Auth & Demo Modal
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isExecutiveDemoOpen, setIsExecutiveDemoOpen] = useState(false)
  const [activeModalIncident, setActiveModalIncident] = useState<Incident | null>(null)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

  const refreshData = () => {
    fetchIncidents()
      .then((list) => setIncidents(list))
      .catch(() => {})
    fetchAdminStats()
      .then((data) => setStats(data))
      .catch(() => {})
  }

  useEffect(() => {
    refreshData()
    const saved = localStorage.getItem('campusops_auth_user')
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved))
      } catch {}
    } else {
      setCurrentUser({
        id: 'usr_default',
        name: 'Operations Director',
        email: 'admin.ops@campusops.edu',
        role: 'admin',
      })
    }
  }, [])

  // Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const criticalCount = incidents.filter((i) => i.priority === 'critical').length
  const inProgressCount = incidents.filter((i) => i.status === 'in_progress').length
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length

  const handleNavigate = (tab: NavigationTab, prompt?: string) => {
    if (prompt) {
      setSelectedPrompt(prompt)
    }
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStatusChangeFromModal = async (id: string, newStatus: IncidentStatus) => {
    const updated = await updateIncidentStatus(id, newStatus)
    setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)))
    setActiveModalIncident(updated)
    fetchAdminStats().then(setStats).catch(() => {})
  }

  const handleDeleteFromModal = async (id: string) => {
    await deleteIncidentApi(id)
    setIncidents((prev) => prev.filter((i) => i.id !== id))
    setActiveModalIncident(null)
    fetchAdminStats().then(setStats).catch(() => {})
  }

  const handleOpenIncidentById = (id: string) => {
    const found = incidents.find((i) => i.id === id)
    if (found) {
      setActiveModalIncident(found)
    } else {
      toast.info(`Fetching incident ${id}...`)
    }
  }

  // Analytics View
  const renderAnalytics = () => {
    const total = stats?.total ?? incidents.length
    const resolved = stats?.resolved ?? resolvedCount
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100

    const avgRisk =
      total > 0
        ? Math.round(incidents.reduce((acc, i) => acc + (i.priorityScore || 50), 0) / total)
        : 0

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
        <div className="border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Operations Intelligence & Telemetry Mesh
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Fleet Risk & SLA Telemetry
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#07111F] border border-white/[0.08] p-6 rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold">
                Autonomous Dispatch Rate
              </span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-4xl font-extrabold text-white font-mono">100%</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              All unstructured complaints parsed by Gemini MCP function calling without human triage lag.
            </p>
          </div>

          <div className="bg-[#07111F] border border-white/[0.08] p-6 rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-violet-400 uppercase font-bold">
                Mean Calibrated Risk
              </span>
              <TrendingUp className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-4xl font-extrabold text-white font-mono">{avgRisk || 85} / 100</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuous hazard assessment automatically calibrating emergency response routing.
            </p>
          </div>

          <div className="bg-[#07111F] border border-white/[0.08] p-6 rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 uppercase font-bold">
                Fleet Resolution Rate
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-4xl font-extrabold text-emerald-400 font-mono">{resolutionRate}%</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {resolved} of {total} incidents closed out across university departments.
            </p>
          </div>
        </div>

        {/* Department Workload Breakdown */}
        {stats?.departmentCounts && Object.keys(stats.departmentCounts).length > 0 && (
          <div className="bg-[#07111F] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Department Workload Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dynamic routing breakdown generated by autonomous agent assignments
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">
                {Object.keys(stats.departmentCounts).length} Units Active
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(stats.departmentCounts).map(([dept, count]) => {
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{dept}</span>
                      <span className="font-mono text-slate-400">
                        {count} incidents ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-[#05070D] rounded-full overflow-hidden border border-white/[0.04]">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-[#05070D] font-sans antialiased bg-tech-grid">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab === 'report' ? 'report' : activeTab === 'admin' || activeTab === 'workorders' ? 'admin' : activeTab === 'analytics' || activeTab === 'intelligence' ? 'analytics' : 'landing'}
        onSelectTab={(tab) => {
          setSelectedPrompt('')
          setActiveTab(tab)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onLaunchDemo={() => setIsExecutiveDemoOpen(true)}
        incidentCount={incidents.length}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full">
        {/* 3 Pillars Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setSelectedPrompt('')
            setActiveTab(tab)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          currentUser={currentUser}
          incidentCount={incidents.length}
          criticalCount={criticalCount}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Page Content for 3 Pillars */}
        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)]">


          {/* 1. OVERVIEW & INTAKE */}
          {activeTab === 'landing' && <Landing onNavigate={handleNavigate} incidents={incidents} stats={stats} />}

          {activeTab === 'report' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <IntakeCommand
                existingIncidents={incidents}
                initialText={selectedPrompt}
                onIncidentCreated={() => {
                  refreshData()
                  setActiveTab('admin')
                }}
                onReviewExisting={(existing) => setActiveModalIncident(existing)}
              />
            </div>
          )}

          {/* 2. OPERATIONS COMMAND */}
          {(activeTab === 'admin' || activeTab === 'workorders') && (
            <div className="max-w-7xl mx-auto space-y-6">
              <TriageCommandCenter
                incidents={incidents}
                onSelectIncident={(inc) => setActiveModalIncident(inc)}
                onRefreshData={refreshData}
              />
            </div>
          )}

          {/* 3. INTELLIGENCE MESH */}
          {activeTab === 'intelligence' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <IntelligenceMesh totalIncidents={incidents.length} />
            </div>
          )}
          {activeTab === 'analytics' && renderAnalytics()}

          {/* SYSTEM SETTINGS */}
          {activeTab === 'settings' && <Settings currentUser={currentUser || undefined} />}
        </main>
      </div>

      {/* Global Command Palette Omnibox */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        incidents={incidents}
        onSelectIncident={(inc) => setActiveModalIncident(inc)}
        onNavigate={handleNavigate}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        onSelectIncidentById={handleOpenIncidentById}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

      {/* Executive Guided Demo Modal */}
      <ExecutiveDemoModal
        isOpen={isExecutiveDemoOpen}
        onClose={() => setIsExecutiveDemoOpen(false)}
        onIncidentResolved={(resolvedInc) => {
          refreshData()
        }}
      />

      {/* Global Incident Detail Modal */}
      <IncidentDetailModal
        incident={activeModalIncident}
        allIncidents={incidents}
        isOpen={Boolean(activeModalIncident)}
        onClose={() => setActiveModalIncident(null)}
        onStatusChange={handleStatusChangeFromModal}
        onDelete={handleDeleteFromModal}
      />

      {/* Clean Operations Footer */}
      <footer className="border-t border-white/[0.06] bg-[#05070D]/90 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300">CampusOps AI</span>
            <span>— Autonomous Campus Operations & Telemetry Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" />
              Gemini 3.6 Flash Multi-Tool
            </span>
            <span className="text-slate-800">•</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              SLA Monitored
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
