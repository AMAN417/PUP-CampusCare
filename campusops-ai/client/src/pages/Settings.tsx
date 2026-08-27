import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Cpu,
  Database,
  Save,
  CheckCircle2,
  Lock,
  Key,
} from 'lucide-react'
import { useToast } from '../components/Toast'

interface SettingsProps {
  currentUser?: { name: string; email: string; role: string }
}

export const Settings: React.FC<SettingsProps> = ({
  currentUser = { name: 'Operations Director', email: 'admin.ops@campusops.edu', role: 'admin' },
}) => {
  const { toast } = useToast()
  const [name, setName] = useState(currentUser.name)
  const [email, setEmail] = useState(currentUser.email)
  const [criticalSms, setCriticalSms] = useState(true)
  const [emailDigest, setEmailDigest] = useState(true)
  const [autoVerify, setAutoVerify] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('System preferences saved successfully')
    }, 400)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold">
            System & Operations Configuration
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
          Platform Settings
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Profile Card */}
        <div className="bg-[#07111F] border border-white/[0.08] rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <User className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Operator Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl p-2.5 text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Campus Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl p-2.5 text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-[#07111F] border border-white/[0.08] rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Alert Preferences</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-[#05070D] border border-white/[0.04] cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Critical Hazard Broadcast Alerts</span>
                <span className="text-[11px] text-slate-400">Trigger immediate escalation on 90+ hazard rating incidents.</span>
              </div>
              <input
                type="checkbox"
                checked={criticalSms}
                onChange={(e) => setCriticalSms(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-[#05070D] border border-white/[0.04] cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Daily Operations Digest</span>
                <span className="text-[11px] text-slate-400">Receive morning summary of pending and resolved incidents.</span>
              </div>
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={(e) => setEmailDigest(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* System & AI Engine Integration */}
        <div className="bg-[#07111F] border border-white/[0.08] rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">System Architecture & AI Mesh</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#05070D] rounded-xl border border-white/[0.04] space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Model Engine</span>
              <span className="text-cyan-400 font-bold block">Gemini 3.6 Flash</span>
              <span className="text-[10px] text-emerald-400">Online · Function Calling</span>
            </div>

            <div className="p-3 bg-[#05070D] rounded-xl border border-white/[0.04] space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Database Store</span>
              <span className="text-white font-bold block">Firestore / In-Memory</span>
              <span className="text-[10px] text-emerald-400">Active Sync</span>
            </div>

            <div className="p-3 bg-[#05070D] rounded-xl border border-white/[0.04] space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">MCP Toolchain</span>
              <span className="text-violet-400 font-bold block">5 Autonomous Tools</span>
              <span className="text-[10px] text-emerald-400">Operational</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving Preferences...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
