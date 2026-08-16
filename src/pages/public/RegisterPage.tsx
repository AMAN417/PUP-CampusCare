import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PUPLogo } from '../../components/common/PUPLogo';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { User, Mail, Lock, Phone, BookOpen, Home, ArrowRight } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { success } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNo: '',
    department: 'Computer Science & Engineering',
    hostel: 'Banda Singh Bahadur Hostel (Block A)',
    phone: '',
    password: '',
  });

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Department of Physics',
    'Department of Chemistry',
    'Department of Mathematics',
    'School of Management Studies',
    'Department of Law',
    'Department of Biotechnology',
  ];

  const hostels = [
    'Day Scholar (No Hostel)',
    'Banda Singh Bahadur Hostel (Boys Block A)',
    'Banda Singh Bahadur Hostel (Boys Block B)',
    'Banda Singh Bahadur Hostel (Boys Block C)',
    'Mai Bhago Girls Hostel (Block A)',
    'Mai Bhago Girls Hostel (Block B)',
    'Mai Bhago Girls Hostel (Block C)',
    'Silver Jubilee Hostel',
  ];

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      const result = await register(
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          rollNo: formData.rollNo.trim() || `PUP2026-${Math.floor(1000 + Math.random() * 9000)}`,
          department: formData.department,
          hostel: formData.hostel === 'Day Scholar (No Hostel)' ? 'Day Scholar' : formData.hostel,
          phone: formData.phone.trim() || '+91 98000 00000',
          role: 'student',
        },
        formData.password
      );

      if (result?.requiresVerification) {
        success('Verification Link Sent', `Please check your email (${formData.email.trim()}) to verify your account.`);
        onNavigate(`/verify-email?email=${encodeURIComponent(formData.email.trim())}`);
      } else {
        success('Registration Successful', `Welcome, ${formData.name}!`);
        onNavigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '2rem auto', width: '100%' }}>
      <Card style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
            <PUPLogo size="lg" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>
            Create Student Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Join PUP CampusCare to report maintenance issues and track campus resolutions
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#dc2626',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Navjot Singh"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">University Email *</label>
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
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@pup.ac.in"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                placeholder="e.g. PUP2024-CS-099"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <div style={{ position: 'relative' }}>
              <BookOpen
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
              <select
                className="form-select"
                style={{ paddingLeft: '36px' }}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hostel / Residence</label>
            <div style={{ position: 'relative' }}>
              <Home
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
              <select
                className="form-select"
                style={{ paddingLeft: '36px' }}
                value={formData.hostel}
                onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
              >
                {hostels.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone
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
                  type="tel"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 00000"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={submitting}
            style={{ width: '100%', marginTop: '0.5rem' }}
            rightIcon={<ArrowRight size={16} />}
          >
            {submitting ? 'Creating Account...' : 'Create Account & Enter Portal'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--pup-maroon)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </div>
      </Card>
    </div>
  );
};
