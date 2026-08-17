import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PUPLogo } from '../../components/common/PUPLogo';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegularLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your university email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const loggedUser = await login(email.trim(), password);
      if (loggedUser) {
        success('Logged In Successfully', `Welcome back to PUP CampusCare`);
        onNavigate(loggedUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '440px',
        margin: '2.5rem auto',
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
            Access complaint tracking, reporting tools, and maintenance logs
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleRegularLogin}>
          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">University Email or ID</label>
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
                placeholder="name@pup.ac.in or Roll No."
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--pup-maroon)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            </div>
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
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '0.75rem' }}
            rightIcon={!isSubmitting ? <ArrowRight size={16} /> : undefined}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
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
