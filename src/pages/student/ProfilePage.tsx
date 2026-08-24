import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import type { Gender } from '../../types';
import { GENDER_OPTIONS } from '../../types';
import {
  Mail,
  BookOpen,
  Calendar,
  ShieldCheck,
  RotateCcw,
  Save,
} from 'lucide-react';
import { storage } from '../../utils/storage';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const { complaints, refreshComplaints } = useComplaints();
  const { success, info } = useToast();

  const [phone, setPhone] = useState(user?.phone || '');
  const [hostel, setHostel] = useState(user?.hostel || '');
  const [gender, setGender] = useState<Gender | ''>(user?.gender || '');
  const [saving, setSaving] = useState(false);

  // Student metrics
  const myComplaints = complaints.filter((c) => c.studentId === user?.id || user?.role === 'admin');
  const resolvedCount = myComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    updateProfile({ phone, hostel, gender: gender || undefined });
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
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.95rem', fontWeight: 900, letterSpacing: '-0.025em' }}>Student Profile</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Manage your contact credentials and view your campus maintenance activity history.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '1.75rem',
        }}
      >
        {/* Left Column: Profile Card */}
        <Card style={{ padding: '2.25rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              overflow: 'hidden',
              marginBottom: '1.25rem',
              border: '3.5px solid var(--pup-maroon)',
              boxShadow: '0 8px 20px rgba(122, 18, 40, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.8)',
            }}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, letterSpacing: '-0.015em' }}>{user?.name}</h3>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--pup-maroon-subtle)',
              color: 'var(--pup-maroon)',
              fontSize: '0.775rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              margin: '0.5rem 0 1.5rem 0',
              boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.9)',
            }}
          >
            <ShieldCheck size={14} />
            <span>Verified Student Account</span>
          </div>

          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.85rem',
              padding: '1.15rem 0',
              borderTop: '1px solid rgba(241, 245, 249, 0.85)',
              borderBottom: '1px solid rgba(241, 245, 249, 0.85)',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--pup-maroon)' }}>
                {myComplaints.length}
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600 }}>Reported</div>
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669' }}>
                {resolvedCount}
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600 }}>Resolved</div>
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)' }}>
              <Mail size={16} style={{ color: 'var(--pup-maroon)', flexShrink: 0 }} />
              <span>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)' }}>
              <BookOpen size={16} style={{ color: 'var(--pup-maroon)', flexShrink: 0 }} />
              <span>{user?.department}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)' }}>
              <Calendar size={16} style={{ color: 'var(--pup-maroon)', flexShrink: 0 }} />
              <span>Member Since: {user?.joinedDate || '2024'}</span>
            </div>
          </div>
        </Card>

        {/* Right Column: Edit Profile Form & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <Card style={{ padding: '2rem' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
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
                  style={{ background: 'var(--clay-inset-bg)', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={user?.rollNo || 'PUP2024-CS-042'}
                  disabled
                  style={{ background: 'var(--clay-inset-bg)', cursor: 'not-allowed' }}
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
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | '')}
                >
                  <option value="" disabled>
                    Select gender (optional)
                  </option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
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

          {/* Local Cache Management Card */}
          <Card style={{ padding: '1.75rem', background: 'var(--clay-card-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.45rem' }}>
              <RotateCcw size={16} />
              <span>Local Storage & Cache</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', lineHeight: 1.45 }}>
              Clear local cached portal records and reset local application state.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
            >
              Clear Local Cache
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
