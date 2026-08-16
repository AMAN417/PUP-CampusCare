import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { PUPLogo } from '../common/PUPLogo';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  showSidebar?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  showSidebar = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Main Dashboard Layout Shell */}
      <div className={showSidebar ? 'dashboard-layout' : 'main-content'}>
        {showSidebar && (
          <aside className="dashboard-sidebar-container">
            <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
          </aside>
        )}

        <main className={showSidebar ? 'dashboard-main' : 'page-wrapper'}>
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ width: '100%' }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-drawer-overlay"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="mobile-drawer-content"
            >
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
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-ghost"
                  style={{ padding: '6px', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <Sidebar
                currentPath={currentPath}
                onNavigate={onNavigate}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
