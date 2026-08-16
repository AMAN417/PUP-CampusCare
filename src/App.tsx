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

import { motion, AnimatePresence } from 'framer-motion';

const MainApp: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  // Route state initialized from window location hash or default
  const getInitialPath = (): string => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) return hash;
    }
    return '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setCurrentPath(hash || '/');
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

    // Student Routes
    if (pathPart === '/student/dashboard') {
      return (
        <DashboardLayout currentPath={pathPart} onNavigate={navigate}>
          <StudentDashboard onNavigate={navigate} />
        </DashboardLayout>
      );
    }

    if (pathPart === '/student/submit') {
      const defaultCategory = queryParams.get('category') as any;
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

    // Admin Routes
    if (pathPart === '/admin/dashboard') {
      return (
        <DashboardLayout currentPath={pathPart} onNavigate={navigate}>
          <AdminDashboard onNavigate={navigate} />
        </DashboardLayout>
      );
    }

    if (pathPart === '/admin/complaints') {
      const statusParam = queryParams.get('status') as any;
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
