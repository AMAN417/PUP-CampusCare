import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authApi } from '../../api/authApi';
import { PUPLogo } from '../../components/common/PUPLogo';
import { Button } from '../../components/common/Button';
import { Lock, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface ResetPasswordPageProps {
  onNavigate: (path: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string>('');
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      const hashTokenMatch = hash.match(/access_token=([^&]+)/);
      const searchTokenMatch = search.match(/[?&]access_token=([^&]+)/);
      const hashCodeMatch = hash.match(/[?&]code=([^&]+)/);
      const searchCodeMatch = search.match(/[?&]code=([^&]+)/);

      let extractedToken = '';
      if (hashTokenMatch && hashTokenMatch[1]) {
        extractedToken = decodeURIComponent(hashTokenMatch[1].replace(/\+/g, '%20'));
      } else if (searchTokenMatch && searchTokenMatch[1]) {
        extractedToken = decodeURIComponent(searchTokenMatch[1].replace(/\+/g, '%20'));
      } else if (hashCodeMatch && hashCodeMatch[1]) {
        extractedToken = decodeURIComponent(hashCodeMatch[1].replace(/\+/g, '%20'));
      } else if (searchCodeMatch && searchCodeMatch[1]) {
        extractedToken = decodeURIComponent(searchCodeMatch[1].replace(/\+/g, '%20'));
      }

      const isRecoveryLink =
        hash.includes('type=recovery') ||
        search.includes('type=recovery') ||
        Boolean(extractedToken);

      if (extractedToken) {
        setToken(extractedToken);
        setHasRecoverySession(true);

        try {
          window.history.replaceState(null, '', `${window.location.pathname}#/reset-password`);
        } catch {
          // Ignore
        }
      } else if (isRecoveryLink) {
        setHasRecoverySession(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and re-enter.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await authApi.resetPassword(password, token || undefined);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Password reset failed. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card-box"
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
            <PUPLogo size="lg" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            Set New Password
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.5 }}>
            Create a secure new password for your PUP CampusCare account.
          </p>
        </div>

        {isSuccess ? (
          <div>
            <div
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <CheckCircle2 size={22} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                  Password Updated Successfully!
                </strong>
                Your password has been securely updated. You can now log in using your new credentials.
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => onNavigate('/login')}
              style={{ width: '100%' }}
              rightIcon={<ArrowRight size={16} />}
            >
              Proceed to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!token && !hasRecoverySession && (
              <div
                style={{
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  color: '#92400E',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.4rem',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>
                  No valid password reset link was detected. The link may have expired or already
                  been used.{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('/forgot-password')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#92400E',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: 'inherit',
                    }}
                  >
                    Request a new reset link
                  </button>
                </span>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
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
              </motion.div>
            )}

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '36px', paddingRight: '38px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color var(--transition-fast)',
                  }}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '36px', paddingRight: '38px' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color var(--transition-fast)',
                  }}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              style={{ width: '100%' }}
              rightIcon={!isSubmitting ? <ArrowRight size={16} /> : undefined}
            >
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
