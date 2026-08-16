import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Home,
  Calendar,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  FileText,
  Clock,
  Save,
} from 'lucide-react';
import { storage } from '../../utils/storage';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile, logout } = useAuth();
  const { complaints, refreshComplaints } = useComplaints();
  const { success, info } = useToast();

  const [phone, setPhone] = useState(user?.phone || '');
  const [hostel, setHostel] = useState(user?.hostel || '');
  const [saving, setSaving] = useState(false);

  // Student metrics
  const myComplaints = complaints.filter((c) => c.studentId === user?.id || user?.role === 'admin');
  const resolvedCount = myComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const activeCount = myComplaints.length - resolvedCount;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    updateProfile({ phone, hostel });
    setTimeout(() => {
      setSaving(false);
      success('Profile Updated', 'Contact information saved.');
    }, 400);
  };

  const handleResetData = () => {
    if (confirm('Reset demo database to fresh sample Punjabi University Patiala dataset?')) {
      storage.resetDemoData();
      refreshComplaints();
      info('Demo Data Reset', 'Initial sample complaints and notifications restored.');
      onNavigate('/student/dashboard');
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Profile</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.2rem' }}>
          Manage your contact credentials and view your campus maintenance activity history.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Left Column: Profile Card */}
        <Card style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              overflow: 'hidden',
              marginBottom: '1rem',
              border: '3px solid var(--pup-maroon)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{user?.name}</h3>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--pup-maroon-subtle)',
              color: 'var(--pup-maroon)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              margin: '0.4rem 0 1.25rem 0',
            }}
          >
            <ShieldCheck size={12} />
            <span>Verified Student Account</span>
          </div>

          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              padding: '1rem 0',
              borderTop: '1px solid var(--border-light)',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--pup-maroon)' }}>
                {myComplaints.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reported</div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                {resolvedCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolved</div>
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Mail size={15} style={{ color: 'var(--pup-maroon)', flexShrink: 0 }} />
              <span>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <BookOpen size={15} style={{ color: 'var(--pup-maroon)', flexShrink: 0 }} />
              <span>{user?.department}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Calendar size={15} style={{ color: 'var(--pup-maroon)', flexShrink: 0 }} />
              <span>Member Since: {user?.joinedDate || '2024'}</span>
            </div>
          </div>
        </Card>

        {/* Right Column: Edit Profile Form & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card style={{ padding: '1.75rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Contact & Location Preferences
            </h4>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={user?.name || ''}
                  disabled
                  style={{ background: 'var(--bg-main)', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={user?.rollNo || 'PUP2024-CS-042'}
                  disabled
                  style={{ background: 'var(--bg-main)', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (For technician updates)</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hostel & Room Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  placeholder="e.g. Banda Singh Bahadur Hostel (Block C, Room 214)"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
                leftIcon={<Save size={16} />}
              >
                Save Profile
              </Button>
            </form>
          </Card>

          {/* Sandbox Controls Card */}
          <Card style={{ padding: '1.5rem', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#B45309', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              <RotateCcw size={16} />
              <span>Demo Sandbox Management</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#92400E', margin: '0 0 0.85rem 0', lineHeight: 1.4 }}>
              Reset all modified complaints, status transitions, and comments back to the default Punjabi University sample data state.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              style={{ borderColor: '#D97706', color: '#B45309' }}
            >
              Reset Sample Demo State
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
