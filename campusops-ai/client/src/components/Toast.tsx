import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X, ShieldAlert } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  title?: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void
    error: (message: string, title?: string) => void
    info: (message: string, title?: string) => void
    warning: (message: string, title?: string) => void
  }
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, title, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const toast = {
    success: (msg: string, title?: string) => addToast('success', msg, title),
    error: (msg: string, title?: string) => addToast('error', msg, title),
    info: (msg: string, title?: string) => addToast('info', msg, title),
    warning: (msg: string, title?: string) => addToast('warning', msg, title),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => {
            const styles = {
              success: {
                bg: 'bg-[#07111F]/95 border-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
              },
              error: {
                bg: 'bg-[#07111F]/95 border-rose-500/30 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.2)]',
                icon: <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />,
              },
              warning: {
                bg: 'bg-[#07111F]/95 border-amber-500/30 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
                icon: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
              },
              info: {
                bg: 'bg-[#07111F]/95 border-cyan-500/30 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]',
                icon: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
              },
            }[t.type]

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-2xl shadow-xl flex items-start justify-between gap-3 text-xs leading-relaxed ${styles.bg}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">{styles.icon}</div>
                  <div>
                    {t.title && <strong className="font-semibold block text-white">{t.title}</strong>}
                    <p className="text-slate-300">{t.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
