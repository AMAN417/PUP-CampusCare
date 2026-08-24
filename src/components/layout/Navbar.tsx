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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Authenticated Dashboard Drawer Toggle */}
            {isAuthenticated && onOpenMobileMenu && (
              <button
                type="button"
                onClick={onOpenMobileMenu}
                className="btn-ghost"
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '40px',
                  border: 'none',
                  cursor: 'pointer',
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
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '40px',
                  border: 'none',
                  cursor: 'pointer',
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
            >
              Categories
            </button>
          </nav>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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
                    style={{
                      position: 'relative',
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.9)',
                      background: showNotifs ? 'var(--pup-maroon-subtle)' : 'var(--clay-btn-outline-bg)',
                      boxShadow: '0 4px 10px -2px rgba(15, 23, 42, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
                      cursor: 'pointer',
                      color: showNotifs ? 'var(--pup-maroon)' : 'var(--text-primary)',
                      transition: 'all var(--transition-fast)',
                    }}
                    aria-label="Notifications"
                  >
                    <Bell size={19} />
                    {unreadNotificationCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid white',
                          boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
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
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        style={{
                          position: 'absolute',
                          top: '120%',
                          right: 0,
                          width: 'min(360px, calc(100vw - 24px))',
                          maxWidth: 'calc(100vw - 24px)',
                          background: 'var(--clay-card-bg)',
                          borderRadius: 'var(--radius-xl)',
                          boxShadow: 'var(--shadow-xl), inset 0 2px 3px rgba(255, 255, 255, 1)',
                          border: 'var(--clay-card-border)',
                          zIndex: 100,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid rgba(226, 232, 240, 0.7)',
                            background: 'rgba(240, 243, 248, 0.6)',
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                            Notifications
                          </div>
                          {unreadNotificationCount > 0 && (
                            <button
                              type="button"
                              onClick={markAllNotificationsRead}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--pup-maroon)',
                                fontSize: '0.775rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                          {notifications.length === 0 ? (
                            <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
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
                                  padding: '0.85rem 1.25rem',
                                  borderBottom: '1px solid rgba(241, 245, 249, 0.8)',
                                  backgroundColor: n.read ? 'transparent' : 'rgba(122, 18, 40, 0.04)',
                                  cursor: 'pointer',
                                  transition: 'background var(--transition-fast)',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {n.title}
                                  </span>
                                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                                  {n.message}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        <div
                          style={{
                            padding: '0.75rem',
                            textAlign: 'center',
                            borderTop: '1px solid rgba(226, 232, 240, 0.7)',
                            background: 'rgba(240, 243, 248, 0.6)',
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
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              width: '100%',
                              padding: '4px',
                            }}
                          >
                            <span>View All Notifications</span>
                            <ArrowRight size={14} />
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
                      gap: '0.6rem',
                      background: 'var(--clay-btn-outline-bg)',
                      border: '1px solid rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 4px 10px -2px rgba(15, 23, 42, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
                      borderRadius: 'var(--radius-full)',
                      padding: '4px 12px 4px 4px',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={user?.name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name.split(' ')[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        style={{
                          position: 'absolute',
                          top: '120%',
                          right: 0,
                          width: 'min(260px, calc(100vw - 24px))',
                          maxWidth: 'calc(100vw - 24px)',
                          background: 'var(--clay-card-bg)',
                          borderRadius: 'var(--radius-xl)',
                          boxShadow: 'var(--shadow-xl), inset 0 2px 3px rgba(255, 255, 255, 1)',
                          border: 'var(--clay-card-border)',
                          zIndex: 100,
                          padding: '0.65rem',
                        }}
                      >
                        <div style={{ padding: '0.65rem 0.85rem', borderBottom: '1px solid rgba(226, 232, 240, 0.7)', marginBottom: '0.4rem' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.name}</div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--pup-maroon)', fontWeight: 800, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
                              padding: '0.6rem 0.85rem',
                              fontSize: '0.85rem',
                              borderRadius: 'var(--radius-md)',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            <User size={16} />
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
                            padding: '0.6rem 0.85rem',
                            fontSize: '0.85rem',
                            color: '#DC2626',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          <LogOut size={16} />
                          <span>Log out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
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
              initial={{ x: -290 }}
              animate={{ x: 0 }}
              exit={{ x: -290 }}
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
                    marginBottom: '1.75rem',
                    paddingBottom: '0.85rem',
                    borderBottom: '1px solid rgba(226, 232, 240, 0.7)',
                  }}
                >
                  <PUPLogo size="sm" />
                  <button
                    type="button"
                    onClick={() => setPublicMenuOpen(false)}
                    className="btn-ghost"
                    style={{ padding: '6px', border: 'none', cursor: 'pointer', borderRadius: '50%' }}
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => handlePublicNav('/')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.85rem 1.15rem',
                      borderRadius: 'var(--radius-lg)',
                      border: 'none',
                      background: currentPath === '/' ? '#FFFFFF' : 'transparent',
                      boxShadow: currentPath === '/' ? '0 4px 12px -2px rgba(15, 23, 42, 0.08), inset 0 1px 2px rgba(255, 255, 255, 1)' : 'none',
                      color: currentPath === '/' ? 'var(--pup-maroon)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <Home size={19} />
                    <span>Home</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePublicNav('/', 'how-it-works')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.85rem 1.15rem',
                      borderRadius: 'var(--radius-lg)',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <HelpCircle size={19} />
                    <span>How It Works</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePublicNav('/', 'categories')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.85rem 1.15rem',
                      borderRadius: 'var(--radius-lg)',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <Layers size={19} />
                    <span>Categories</span>
                  </button>
                </nav>
              </div>

              <div
                style={{
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(226, 232, 240, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
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
