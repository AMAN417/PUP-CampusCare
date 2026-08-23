import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SubmitComplaint } from './pages/student/SubmitComplaint';
import { MyComplaints } from './pages/student/MyComplaints';
import { ComplaintDetails } from './pages/student/ComplaintDetails';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ComplaintsManagement } from './pages/admin/ComplaintsManagement';
import { AdminComplaintDetails } from './pages/admin/AdminComplaintDetails';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { UserManagement } from './pages/admin/UserManagement';

import { ShieldAlert } from 'lucide-react';
import type { ComplaintCategory, ComplaintStatus } from './types';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Route state initialized from window location hash or default
  const getInitialPath = (): string => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '');
      const search = window.location.search || '';

      if (
        hash.includes('type=recovery') ||
        search.includes('type=recovery') ||
        (hash.includes('access_token=') && !hash.startsWith('/student') && !hash.startsWith('/admin'))
      ) {
        return '/reset-password';
      }

      if (hash) return hash;
    }
    return '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace(/^#/, '');
      const search = window.location.search || '';

      if (
        hash.includes('type=recovery') ||
        search.includes('type=recovery') ||
        (hash.includes('access_token=') && !hash.startsWith('/student') && !hash.startsWith('/admin'))
      ) {
        setCurrentPath('/reset-password');
      } else {
        setCurrentPath(hash || '/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.location.hash = path;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Route parser
  const renderRoute = () => {
    if (loading) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main)',
            color: 'var(--pup-maroon)',
            fontWeight: 600,
          }}
        >
          Loading PUP CampusCare...
        </div>
      );
    }

    // Extract base path and query parameters
    const [pathPart, queryPart] = currentPath.split('?');
    const queryParams = new URLSearchParams(queryPart || '');

    // Public Routes
    if (pathPart === '/' || pathPart === '') {
      return (
        <div className="app-container">
          <Navbar currentPath={currentPath} onNavigate={navigate} />
          <main className="page-wrapper">
            <LandingPage onNavigate={navigate} />
          </main>
          <Footer onNavigate={navigate} />
        </div>
      );
    }

    if (pathPart === '/login') {
      return (
        <div className="app-container">
          <Navbar currentPath={currentPath} onNavigate={navigate} />
          <main className="page-wrapper">
            <LoginPage onNavigate={navigate} />
          </main>
          <Footer onNavigate={navigate} />
        </div>
      );
    }

    if (pathPart === '/register') {
      return (
        <div className="app-container">
          <Navbar currentPath={currentPath} onNavigate={navigate} />
          <main className="page-wrapper">
            <RegisterPage onNavigate={navigate} />
          </main>
          <Footer onNavigate={navigate} />
        </div>
      );
    }

    if (pathPart === '/forgot-password') {
      return (
        <div className="app-container">
          <Navbar currentPath={currentPath} onNavigate={navigate} />
          <main className="page-wrapper">
            <ForgotPasswordPage onNavigate={navigate} />
          </main>
          <Footer onNavigate={navigate} />
        </div>
      );
    }

    if (pathPart === '/reset-password' || pathPart.startsWith('/reset-password')) {
      return (
        <div className="app-container">
          <Navbar currentPath={currentPath} onNavigate={navigate} />
          <main className="page-wrapper">
            <ResetPasswordPage onNavigate={navigate} />
          </main>
          <Footer onNavigate={navigate} />
        </div>
      );
    }

    // Protected Student Routes (Require authenticated session)
    if (pathPart.startsWith('/student')) {
      if (!isAuthenticated || !user) {
        return (
          <div className="app-container">
            <Navbar currentPath={currentPath} onNavigate={navigate} />
            <main className="page-wrapper">
              <LoginPage onNavigate={navigate} />
            </main>
            <Footer onNavigate={navigate} />
          </div>
        );
      }

      if (pathPart === '/student/dashboard') {
        return (
          <DashboardLayout currentPath={pathPart} onNavigate={navigate}>
            <StudentDashboard onNavigate={navigate} />
          </DashboardLayout>
        );
      }

      if (pathPart === '/student/submit') {
        const defaultCategory = queryParams.get('category') as ComplaintCategory | null;
        return (
          <DashboardLayout currentPath={pathPart} onNavigate={navigate}>
            <SubmitComplaint onNavigate={navigate} defaultCategory={defaultCategory || undefined} />
          </DashboardLayout>
        );
      }

      if (pathPart === '/student/complaints') {
        const tab = queryParams.get('tab') || 'all';
        return (
          <DashboardLayout currentPath={pathPart} onNavigate={navigate}>
            <MyComplaints onNavigate={navigate} initialTab={tab} />
          </DashboardLayout>
        );
      }

      if (pathPart.startsWith('/student/complaints/')) {
        const complaintId = pathPart.replace('/student/complaints/', '');
        return (
          <DashboardLayout currentPath="/student/complaints" onNavigate={navigate}>
            <ComplaintDetails complaintId={complaintId} onNavigate={navigate} />
          </DashboardLayout>
        );
      }

      if (pathPart === '/student/notifications') {
        return (
          <DashboardLayout currentPath={pathPart} onNavigate={navigate}>
            <NotificationsPage onNavigate={navigate} />
          </DashboardLayout>
        );
      }

      if (pathPart === '/student/profile') {
        return (
          <DashboardLayout currentPath={pathPart} onNavigate={navigate}>
            <ProfilePage onNavigate={navigate} />
          </DashboardLayout>
        );
      }
    }

    // Protected Admin Routes (Require authenticated admin session)
    if (pathPart.startsWith('/admin')) {
      if (!isAuthenticated || !user) {
        return (
          <div className="app-container">
            <Navbar currentPath={currentPath} onNavigate={navigate} />
            <main className="page-wrapper">
              <LoginPage onNavigate={navigate} />
            </main>
            <Footer onNavigate={navigate} />
          </div>
        );
      }

      if (user.role !== 'admin') {
        return (
          <DashboardLayout currentPath="/student/dashboard" onNavigate={navigate}>
            <div style={{ maxWidth: '540px', margin: '3rem auto', textAlign: 'center' }}>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '2.5rem 2rem',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto',
                  }}
                >
                  <ShieldAlert size={32} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Access Restricted
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Administrator privileges are required to view this area. You do not have permission to access administrative consoles.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/student/dashboard')}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Return to Student Dashboard
                </button>
              </div>
            </div>
          </DashboardLayout>
        );
      }

      if (pathPart === '/admin/dashboard') {
        return (
          <DashboardLayout currentPath={pathPart} onNavigate={navigate}>
            <AdminDashboard onNavigate={navigate} />
          </DashboardLayout>
        );
      }

      if (pathPart === '/admin/complaints') {
        const statusParam = queryParams.get('status') as ComplaintStatus | 'ALL' | null;
        return (
          <DashboardLayout currentPath={pathPart} onNavigate={navigate}>
            <ComplaintsManagement onNavigate={navigate} initialStatus={statusParam || 'ALL'} />
          </DashboardLayout>
        );
      }

      if (pathPart.startsWith('/admin/complaints/')) {
        const complaintId = pathPart.replace('/admin/complaints/', '');
        return (
          <DashboardLayout currentPath="/admin/complaints" onNavigate={navigate}>
            <AdminComplaintDetails complaintId={complaintId} onNavigate={navigate} />
          </DashboardLayout>
        );
      }

      if (pathPart === '/admin/analytics') {
        return (
          <DashboardLayout currentPath={pathPart} onNavigate={navigate}>
            <AnalyticsPage onNavigate={navigate} />
          </DashboardLayout>
        );
      }

      if (pathPart === '/admin/users') {
        return (
          <DashboardLayout currentPath={pathPart} onNavigate={navigate}>
            <UserManagement onNavigate={navigate} />
          </DashboardLayout>
        );
      }
    }

    // Fallback to Landing
    return (
      <div className="app-container">
        <Navbar currentPath={currentPath} onNavigate={navigate} />
        <main className="page-wrapper">
          <LandingPage onNavigate={navigate} />
        </main>
        <Footer onNavigate={navigate} />
      </div>
    );
  };

  return <>{renderRoute()}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ComplaintProvider>
          <MainApp />
        </ComplaintProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
