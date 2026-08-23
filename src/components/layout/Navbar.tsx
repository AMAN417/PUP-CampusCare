import React, { useState, useRef, useEffect } from 'react';
import { PUPLogo } from '../common/PUPLogo';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import {
  Bell,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ArrowRight,
  Home,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenMobileMenu }) => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead } =
    useComplaints();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePublicNav = (path: string, hashId?: string) => {
    onNavigate(path);
    setPublicMenuOpen(false);
    if (hashId) {
      setTimeout(() => {
        document.getElementById(hashId)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          {/* Brand Logo & Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Authenticated Dashboard Drawer Toggle */}
            {isAuthenticated && onOpenMobileMenu && (
              <button
                type="button"
                onClick={onOpenMobileMenu}
                className="btn-ghost"
                style={{
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '36px',
                }}
                aria-label="Open navigation menu"
              >
                <Menu size={22} />
              </button>
            )}

            {/* Public Mobile Menu Toggle (on screens < 768px) */}
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => setPublicMenuOpen(!publicMenuOpen)}
                className="btn-ghost"
                style={{
                  padding: '6px',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '36px',
                }}
                id="public-mobile-menu-btn"
                aria-label="Toggle navigation menu"
              >
                {publicMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}

            <div
              onClick={() => onNavigate(isAuthenticated ? (role === 'admin' ? '/admin/dashboard' : '/student/dashboard') : '/')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <PUPLogo size="md" />
            </div>
          </div>

          {/* Center Links (Public Desktop Only) */}
          <nav className="nav-links desktop-only" style={{ display: isAuthenticated ? 'none' : 'flex' }}>
            <button
              type="button"
              className={`nav-link ${currentPath === '/' ? 'active' : ''}`}
              onClick={() => onNavigate('/')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Home
            </button>
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                onNavigate('/');
                setTimeout(() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              How It Works
            </button>
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                onNavigate('/');
                setTimeout(() => {
                  document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Categories
            </button>
          </nav>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isAuthenticated ? (
              <>
                {/* Submit Issue Quick Button (for Students) */}
                {role === 'student' && (
                  <button
                    type="button"
                    onClick={() => onNavigate('/student/submit')}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'none' }}
                  >
                    <PlusCircle size={15} />
                    <span>Report Issue</span>
                  </button>
                )}

                {/* Notifications Dropdown */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="btn-ghost"
                    style={{
                      position: 'relative',
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-light)',
                      background: showNotifs ? 'var(--pup-maroon-subtle)' : 'transparent',
                      cursor: 'pointer',
                    }}
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unreadNotificationCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          background: '#DC2626',
                          color: 'white',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid white',
                        }}
                      >
                        {unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showNotifs && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute',
                          top: '120%',
                          right: 0,
                          width: 'min(340px, calc(100vw - 24px))',
                          maxWidth: 'calc(100vw - 24px)',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-lg)',
                          boxShadow: 'var(--shadow-xl)',
                          border: '1px solid var(--border-light)',
                          zIndex: 100,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            padding: '0.85rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid var(--border-subtle)',
                            background: 'var(--bg-main)',
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Notifications</div>
                          {unreadNotificationCount > 0 && (
                            <button
                              type="button"
                              onClick={markAllNotificationsRead}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--pup-maroon)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {notifications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                              No notifications yet
                            </div>
                          ) : (
                            notifications.slice(0, 5).map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  markNotificationRead(n.id);
                                  if (n.complaintId) {
                                    onNavigate(role === 'admin' ? `/admin/complaints/${n.complaintId}` : `/student/complaints/${n.complaintId}`);
                                    setShowNotifs(false);
                                  }
                                }}
                                style={{
                                  padding: '0.75rem 1rem',
                                  borderBottom: '1px solid var(--border-subtle)',
                                  backgroundColor: n.read ? 'transparent' : 'var(--pup-maroon-subtle)',
                                  cursor: 'pointer',
                                  transition: 'background var(--transition-fast)',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {n.title}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                                  {n.message}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        <div
                          style={{
                            padding: '0.65rem',
                            textAlign: 'center',
                            borderTop: '1px solid var(--border-subtle)',
                            background: 'var(--bg-main)',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onNavigate(role === 'admin' ? '/admin/dashboard' : '/student/notifications');
                              setShowNotifs(false);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--pup-maroon)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem',
                              width: '100%',
                            }}
                          >
                            <span>View All Notifications</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile User Menu */}
                <div style={{ position: 'relative' }} ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-full)',
                      padding: '3px 10px 3px 4px',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={user?.name}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name.split(' ')[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute',
                          top: '120%',
                          right: 0,
                          width: 'min(240px, calc(100vw - 24px))',
                          maxWidth: 'calc(100vw - 24px)',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-lg)',
                          boxShadow: 'var(--shadow-xl)',
                          border: '1px solid var(--border-light)',
                          zIndex: 100,
                          padding: '0.5rem',
                        }}
                      >
                        <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.35rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--pup-maroon)', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase' }}>
                            {role} Account
                          </div>
                        </div>

                        {role === 'student' && (
                          <button
                            type="button"
                            onClick={() => {
                              onNavigate('/student/profile');
                              setShowUserMenu(false);
                            }}
                            className="btn-ghost"
                            style={{
                              width: '100%',
                              justifyContent: 'flex-start',
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.8125rem',
                              borderRadius: 'var(--radius-md)',
                            }}
                          >
                            <User size={15} />
                            <span>My Profile</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            onNavigate('/login');
                            setShowUserMenu(false);
                          }}
                          className="btn-ghost"
                          style={{
                            width: '100%',
                            justifyContent: 'flex-start',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.8125rem',
                            color: '#DC2626',
                            borderRadius: 'var(--radius-md)',
                          }}
                        >
                          <LogOut size={15} />
                          <span>Log out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Public Mobile Drawer */}
      <AnimatePresence>
        {!isAuthenticated && publicMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-drawer-overlay"
              onClick={() => setPublicMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="mobile-drawer-content"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--border-light)',
                  }}
                >
                  <PUPLogo size="sm" />
                  <button
                    type="button"
                    onClick={() => setPublicMenuOpen(false)}
                    className="btn-ghost"
                    style={{ padding: '6px', border: 'none', cursor: 'pointer' }}
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handlePublicNav('/')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: currentPath === '/' ? 'var(--pup-maroon-subtle)' : 'transparent',
                      color: currentPath === '/' ? 'var(--pup-maroon)' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <Home size={18} />
                    <span>Home</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePublicNav('/', 'how-it-works')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <HelpCircle size={18} />
                    <span>How It Works</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePublicNav('/', 'categories')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <Layers size={18} />
                    <span>Categories</span>
                  </button>
                </nav>
              </div>

              <div
                style={{
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => handlePublicNav('/login')}
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                >
                  Sign In to Portal
                </button>
                <button
                  type="button"
                  onClick={() => handlePublicNav('/register')}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Create New Account
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
