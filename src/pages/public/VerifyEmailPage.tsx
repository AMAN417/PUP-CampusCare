import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PUPLogo } from '../../components/common/PUPLogo';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Mail, CheckCircle2, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

interface VerifyEmailPageProps {
  email?: string;
  onNavigate: (path: string) => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({
  email: initialEmail = '',
  onNavigate,
}) => {
  const { resendVerificationEmail } = useAuth();
  const { success, error: toastError } = useToast();

  const [email] = useState<string>(() => {
    if (initialEmail) return initialEmail;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('email') || '';
  });

  const [resending, setResending] = useState(false);
  const [resentSuccess, setResentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      setErrorMessage('No email address provided for resending verification.');
      return;
    }
    if (cooldown > 0 || resending) return;

    try {
      setResending(true);
      setErrorMessage('');
      await resendVerificationEmail(email);
      setResentSuccess(true);
      setCooldown(60);
      success(
        'Verification Email Sent',
        `A new link has been sent to ${email}. Please check your inbox.`
      );
    } catch (err: any) {
      const msg = err?.message || 'Failed to resend verification email. Please try again.';
      setErrorMessage(msg);
      toastError('Resend Failed', msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '3rem auto',
        width: '100%',
        padding: '0 1rem',
      }}
    >
      <Card style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
        {/* PUP Logo */}
        <div style={{ display: 'inline-block', marginBottom: '1.25rem' }}>
          <PUPLogo size="lg" />
        </div>

        {/* Verification Icon Container */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--pup-maroon-subtle)',
            border: '2px solid rgba(122, 18, 40, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: 'var(--pup-maroon)',
          }}
        >
          <Mail size={32} />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Verify Your Email Address
        </h2>

        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            marginTop: '0.6rem',
            lineHeight: 1.5,
          }}
        >
          We've sent an official verification link to your email address. Please verify your email
          before logging into PUP CampusCare.
        </p>

        {/* Highlighted Email Badge */}
        {email && (
          <div
            style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 1rem',
              margin: '1.25rem 0',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--pup-maroon)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Mail size={16} />
            <span>{email}</span>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              margin: '1rem 0',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {resentSuccess && (
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#166534',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              margin: '1rem 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} />
            <span>New verification email sent! Check your inbox.</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleResend}
            isLoading={resending}
            style={{ width: '100%' }}
            leftIcon={<RefreshCw size={16} />}
          >
            {resending ? 'Sending Email...' : 'Resend Verification Email'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => onNavigate('/login')}
            style={{ width: '100%' }}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Sign In
          </Button>
        </div>

        <div style={{ marginTop: '1.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Did not receive the email? Check your spam folder or verify that your email address is spelled correctly.
        </div>
      </Card>
    </div>
  );
};
