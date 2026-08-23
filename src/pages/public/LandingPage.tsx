import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { CATEGORY_METADATA } from '../../data/mockData';
import type { ComplaintCategory } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import {
  Search,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Smartphone,
  Sparkles,
  Home,
  GraduationCap,
  Droplets,
  Wifi,
  Bus,
  Building2,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

const CATEGORY_ICONS: Record<ComplaintCategory, React.ReactNode> = {
  Hostel: <Home size={22} />,
  Classroom: <GraduationCap size={22} />,
  Electricity: <Zap size={22} />,
  Water: <Droplets size={22} />,
  Sanitation: <Sparkles size={22} />,
  Internet: <Wifi size={22} />,
  Transportation: <Bus size={22} />,
  Infrastructure: <Building2 size={22} />,
  Security: <ShieldAlert size={22} />,
  Other: <HelpCircle size={22} />,
};

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { isAuthenticated, role } = useAuth();
  const { complaints } = useComplaints();
  const [trackId, setTrackId] = useState('');
  const [trackError, setTrackError] = useState('');

  // Calculate live statistics from local demo data
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 94;

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    const match = complaints.find((c) => c.id.toLowerCase() === trackId.trim().toLowerCase());
    if (match) {
      setTrackError('');
      onNavigate(role === 'admin' ? `/admin/complaints/${match.id}` : `/student/complaints/${match.id}`);
    } else {
      setTrackError(`Complaint ID "${trackId}" not found. Try "PUP-2026-0101"`);
    }
  };

  const handleCategoryClick = (category: ComplaintCategory) => {
    if (!isAuthenticated) {
      onNavigate('/login');
      return;
    }
    onNavigate(`/student/submit?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="landing-container">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        {/* Subtle decorative glow circles */}
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />

        <div className="hero-content">
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="hero-badge"
          >
            <Sparkles size={14} />
            <span>Official Campus Support Portal</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="hero-title"
          >
            PUP CampusCare
            <span className="hero-tagline">"Report. Track. Resolve."</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="hero-desc"
          >
            Centralized platform for Punjabi University Patiala to report maintenance issues,
            track repairs in real-time, and ensure a cleaner campus.
          </motion.p>

          {/* Call to Action Buttons: Login & Create New Account */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="hero-actions"
          >
            {isAuthenticated ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => onNavigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard')}
                  leftIcon={<ArrowRight size={18} />}
                  className="hero-btn-primary"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate(role === 'admin' ? '/admin/complaints' : '/student/submit')}
                  leftIcon={<PlusCircle size={18} />}
                  className="hero-btn-secondary"
                >
                  {role === 'admin' ? 'Manage Complaints' : 'Report an Issue'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => onNavigate('/login')}
                  leftIcon={<ArrowRight size={18} />}
                  className="hero-btn-primary"
                >
                  Login to Portal
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate('/register')}
                  leftIcon={<PlusCircle size={18} />}
                  className="hero-btn-secondary"
                >
                  Create New Account
                </Button>
              </>
            )}
          </motion.div>

          {/* Quick Track Search Widget */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="hero-track-widget"
          >
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="Enter Reference ID (e.g. PUP-2026-0101)..."
                className="hero-track-input"
              />
              <Button type="submit" variant="gold" size="md" rightIcon={<Search size={15} />}>
                Track
              </Button>
            </form>
            {trackError && (
              <div className="hero-track-error">
                {trackError}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" style={{ scrollMarginTop: '100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--pup-maroon)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.35rem',
            }}
          >
            Streamlined Process
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>How CampusCare Works</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0.5rem auto 0 auto', fontSize: '0.9375rem' }}>
            Four transparent steps from initial student reporting to verified resolution by campus officers.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {[
            {
              step: '01',
              title: '1. Report Issue',
              desc: 'Select a category, describe the problem, pinpoint location, and attach photo evidence in under 60 seconds.',
              icon: <PlusCircle size={24} />,
              color: '#7A1228',
            },
            {
              step: '02',
              title: '2. Admin Triage',
              desc: 'Campus care desk verifies the issue, assesses urgency, and routes it to the designated department officer.',
              icon: <Search size={24} />,
              color: '#D97706',
            },
            {
              step: '03',
              title: '3. Field Action',
              desc: 'Maintenance engineers and repair crews are dispatched with live milestone updates and progress notes.',
              icon: <Zap size={24} />,
              color: '#2563EB',
            },
            {
              step: '04',
              title: '4. Resolution & Close',
              desc: 'The repair is completed, verified by the student, and logged in university maintenance records.',
              icon: <CheckCircle2 size={24} />,
              color: '#059669',
            },
          ].map((item) => (
            <Card
              key={item.step}
              interactive={true}
              style={{
                position: 'relative',
                padding: '1.75rem',
                borderTop: `4px solid ${item.color}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: `${item.color}15`,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--border-light)',
                  }}
                >
                  {item.step}
                </span>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. COMPLAINT CATEGORIES */}
      <section id="categories" style={{ scrollMarginTop: '100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--pup-maroon)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.35rem',
            }}
          >
            Service Directory
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Complaint Categories</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0.5rem auto 0 auto', fontSize: '0.9375rem' }}>
            Click any category to file an immediate complaint with pre-filled department routing.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {(Object.keys(CATEGORY_METADATA) as ComplaintCategory[]).map((cat) => {
            const meta = CATEGORY_METADATA[cat];
            const activeCount = complaints.filter(
              (c) => c.category === cat && c.status !== 'Resolved' && c.status !== 'Closed'
            ).length;

            return (
              <Card
                key={cat}
                interactive={true}
                onClick={() => handleCategoryClick(cat)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        background: `${meta.color}15`,
                        color: meta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {CATEGORY_ICONS[cat]}
                    </div>
                    {activeCount > 0 ? (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#D97706',
                          background: '#FEF3C7',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {activeCount} Active
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#059669',
                          background: '#ECFDF5',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        Normal
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>{cat}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                    {meta.description}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '1rem',
                    paddingTop: '0.65rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                    color: 'var(--pup-maroon)',
                    fontWeight: 700,
                  }}
                >
                  <span>Report in {cat}</span>
                  <ArrowRight size={13} />
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 4. PLATFORM STATISTICS */}
      <section
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2rem',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--pup-maroon)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.35rem',
            }}
          >
            Live Performance
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Campus Platform Statistics</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--pup-maroon)', fontFamily: 'var(--font-heading)' }}>
              {totalComplaints}+
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              Complaints Processed
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across 10 campus divisions</div>
          </div>

          <div>
            <div style={{ fontSize: '2.75rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>
              {resolutionRate}%
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              Resolution Rate
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average student satisfaction</div>
          </div>

          <div>
            <div style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--pup-gold)', fontFamily: 'var(--font-heading)' }}>
              &lt; 24h
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              Avg First Response
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Urgent triage within 2 hours</div>
          </div>

          <div>
            <div style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--pup-navy)', fontFamily: 'var(--font-heading)' }}>
              7
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              Active Wings
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estate, IT, Electrical, Hostels</div>
          </div>
        </div>
      </section>

      {/* 5. WHY CAMPUSCARE */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--pup-maroon)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.35rem',
            }}
          >
            Core Benefits
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Why PUP CampusCare?</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {[
            {
              title: 'Transparent Tracking',
              desc: 'Visual step-by-step progress from Submission to Verification, leaving no doubt about who is working on your issue.',
              icon: <Clock size={22} />,
            },
            {
              title: 'Photo & File Evidence',
              desc: 'Upload visual proof directly from your phone so technicians arrive with the exact replacement parts required.',
              icon: <Smartphone size={22} />,
            },
            {
              title: 'Accountability & SLA',
              desc: 'Automatic escalation for unresolved high-priority complaints ensures prompt action by department heads.',
              icon: <ShieldCheck size={22} />,
            },
          ].map((feature, i) => (
            <Card key={i} style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--pup-maroon-subtle)',
                  color: 'var(--pup-maroon)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {feature.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section
        style={{
          background: 'linear-gradient(135deg, #7A1228 0%, #560C1C 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2rem',
          color: '#FFFFFF',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FFFFFF', maxWidth: '600px' }}>
          Notice something that needs repair on campus today?
        </h2>
        <p style={{ color: '#FDE68A', maxWidth: '500px', fontSize: '0.9375rem' }}>
          File a complaint in under a minute and help make Punjabi University Patiala a better place for everyone.
        </p>
        <Button
          variant="gold"
          size="lg"
          onClick={() => {
            if (!isAuthenticated) onNavigate('/login');
            else onNavigate('/student/submit');
          }}
          leftIcon={<PlusCircle size={18} />}
        >
          Submit a Complaint Now
        </Button>
      </section>
    </div>
  );
};
