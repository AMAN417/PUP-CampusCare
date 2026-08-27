import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Mail, Lock, Eye, EyeOff, X, ArrowRight, Shield, CheckCircle2, User } from 'lucide-react'
import { useToast } from './Toast'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff' | 'student'
}

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: (user: AuthUser) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const { toast } = useToast()
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'admin' | 'staff' | 'student'>('admin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.includes('@')) {
      setError('Please enter a valid campus email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const user: AuthUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 8),
        name: name || (email.split('@')[0].toUpperCase() || 'Campus Staff'),
        email,
        role,
      }
      localStorage.setItem('campusops_auth_user', JSON.stringify(user))
      toast.success(`Signed in as ${user.name} (${user.role.toUpperCase()})`)
      onAuthSuccess(user)
      onClose()
    }, 600)
  }

  const handleQuickDemo = (demoRole: 'admin' | 'student') => {
    if (demoRole === 'admin') {
      setEmail('admin.ops@campusops.edu')
      setName('Operations Director')
      setPassword('campusAdmin2026')
      setRole('admin')
    } else {
      setEmail('student.alex@campusops.edu')
      setName('Alex Chen')
      setPassword('studentPass2026')
      setRole('student')
    }
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070D]/80 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-[#07111F] border border-white/[0.1] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-left"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#05070D] rounded-2xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isRegister ? 'Create Campus Account' : 'CampusOps AI Console'}
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {isRegister ? 'University Operations Portal' : 'Sign in to access fleet operations'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Demo Presets Bar */}
          <div className="p-2.5 bg-[#05070D] rounded-2xl border border-white/[0.04] space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">
              Quick Demo Presets:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-1.5 px-2.5 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[11px] font-semibold border border-white/[0.06] transition-colors text-center"
              >
                Staff Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="py-1.5 px-2.5 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[11px] font-semibold border border-white/[0.06] transition-colors text-center"
              >
                Student Demo
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Arthur Vance"
                    className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Campus Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold">Password</label>
                {!isRegister && (
                  <span className="text-[11px] text-cyan-400 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder-slate-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Operational Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="admin">Operations Admin</option>
                  <option value="staff">Facility Staff / Technician</option>
                  <option value="student">Student / Campus Resident</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In to Operations Console'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div className="text-center pt-2 border-t border-white/[0.06] text-xs text-slate-400">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-cyan-400 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New staff or resident?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-cyan-400 font-semibold hover:underline"
                >
                  Register Account
                </button>
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
