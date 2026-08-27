import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, ShieldAlert, Sparkles, X, Clock, ExternalLink } from 'lucide-react'
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/api'
import type { Incident } from '../types'
import { useToast } from './Toast'

interface NotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSelectIncidentById: (id: string) => void
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectIncidentById,
}) => {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadNotifications = async () => {
    setLoading(true)
    const data = await fetchNotifications()
    setNotifications(data)
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-[#05070D]/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="bg-[#07111F] border border-white/[0.1] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-3 text-left"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#05070D]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Operations Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No active notifications
              </div>
            ) : (
              notifications.map((notif) => {
                const formatted = new Date(notif.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.incidentId) {
                        onSelectIncidentById(notif.incidentId)
                        onClose()
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      notif.read
                        ? 'bg-[#05070D]/40 border-white/[0.04] opacity-75'
                        : 'bg-[#05070D] border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.08)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                        {notif.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatted}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {notif.message}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span className="text-cyan-400 font-semibold">{notif.incidentId}</span>
                      {!notif.read && (
                        <button
                          onClick={(e) => handleMarkRead(notif.id, e)}
                          className="text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
