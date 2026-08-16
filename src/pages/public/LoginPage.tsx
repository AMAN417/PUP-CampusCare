import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PUPLogo } from '../../components/common/PUPLogo';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { GraduationCap, Shield, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, loginAsDemo } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState('harman.student@demo.pup.ac.in');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [error, setError] = useState('');

  const handleRegularLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your university email or Roll number.');
      return;
    }

    try {
      setError('');
      const ok = await login(email, password, role);
      if (ok) {
        success('Logged In Successfully', `Welcome back to PUP CampusCare`);
        onNavigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoClick = async (targetRole: 'student' | 'admin') => {
    try {
      setError('');
      await loginAsDemo(targetRole);
      success(
        `Switched to ${targetRole === 'student' ? 'Student Harmanpreet' : 'Admin Dr. Rajinder'}`,
        'Demo authentication active'
      );
      onNavigate(targetRole === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Demo login failed.');
    }
  };

  return (
    <div
      style={{
        maxWidth: '460px',
        margin: '2rem auto',
        width: '100%',
      }}
    >
      <Card style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
            <PUPLogo size="lg" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>Sign In to Portal</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Access complaint status, reporting tools, and resolution logs
          </p>
        </div>

        {/* Quick Demo Login Preset Boxes */}
        <div
          style={{
            background: 'var(--pup-maroon-subtle)',
            border: '1px solid rgba(122, 18, 40, 0.15)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--pup-maroon)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.6rem',
              textAlign: 'center',
            }}
          >
            ⚡ Instant 1-Click Demo Login
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleDemoClick('student')}
              leftIcon={<GraduationCap size={15} />}
              style={{ fontSize: '0.8125rem' }}
            >
              As Student
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleDemoClick('admin')}
              leftIcon={<Shield size={15} />}
              style={{ fontSize: '0.8125rem' }}
            >
              As Admin
            </Button>
          </div>
        </div>

        {/* Role Toggle Selector */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-light)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setEmail('harman.student@demo.pup.ac.in');
            }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: role === 'student' ? 'var(--bg-surface)' : 'transparent',
              color: role === 'student' ? 'var(--pup-maroon)' : 'var(--text-secondary)',
              boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            Student Account
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setEmail('rajinder.admin@demo.pup.ac.in');
            }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: role === 'admin' ? 'var(--bg-surface)' : 'transparent',
              color: role === 'admin' ? 'var(--pup-navy)' : 'var(--text-secondary)',
              boxShadow: role === 'admin' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            Staff / Admin
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleRegularLogin}>
          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">University Email or Roll Number</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. harman.student@demo.pup.ac.in"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            rightIcon={<ArrowRight size={16} />}
          >
            Sign In
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('/register')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--pup-maroon)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Create New Account
          </button>
        </div>
      </Card>
    </div>
  );
};
