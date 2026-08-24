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
  Activity,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

const CATEGORY_ICONS: Record<ComplaintCategory, React.ReactNode> = {
  Hostel: <Home size={22} strokeWidth={2.4} />,
  Classroom: <GraduationCap size={22} strokeWidth={2.4} />,
  Electricity: <Zap size={22} strokeWidth={2.4} />,
  Water: <Droplets size={22} strokeWidth={2.4} />,
  Sanitation: <Sparkles size={22} strokeWidth={2.4} />,
  Internet: <Wifi size={22} strokeWidth={2.4} />,
  Transportation: <Bus size={22} strokeWidth={2.4} />,
  Infrastructure: <Building2 size={22} strokeWidth={2.4} />,
  Security: <ShieldAlert size={22} strokeWidth={2.4} />,
  Other: <HelpCircle size={22} strokeWidth={2.4} />,
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
      {/* 1. HERO SECTION WITH ANIMATED BLOBS & FLOATING CLAY SHAPES */}
      <section className="hero-section">
        {/* Animated Background Soft Blobs */}
        <motion.div
          animate={{
            x: [0, 25, 0],
            y: [0, -15, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="hero-glow-1"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 18, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="hero-glow-2"
        />

        {/* Decorative Floating Clay Shapes */}
        <div
          className="animate-float-slow"
          style={{
            position: 'absolute',
            top: '18%',
            left: '4%',
            padding: '8px 14px',
            background: 'var(--clay-card-bg)',
            borderRadius: 'var(--radius-full)',
            border: 'var(--clay-card-border)',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06), inset 0 1.5px 2px rgba(255,255,255,1)',
            display: 'none',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'var(--pup-maroon)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          id="hero-floating-badge-1"
        >
          <Activity size={14} />
          <span>Real-time Triage</span>
        </div>

        <div
          className="animate-float-reverse"
          style={{
            position: 'absolute',
            bottom: '22%',
            right: '4%',
            padding: '8px 14px',
            background: 'var(--clay-card-bg)',
            borderRadius: 'var(--radius-full)',
            border: 'var(--clay-card-border)',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06), inset 0 1.5px 2px rgba(255,255,255,1)',
            display: 'none',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#059669',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          id="hero-floating-badge-2"
        >
          <CheckCircle2 size={14} />
          <span>94% SLA Resolved</span>
        </div>

        <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="hero-badge"
          >
            <Sparkles size={15} />
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
            Centralized digital maintenance platform for Punjabi University Patiala to report issues,
            track repairs in real-time, and ensure a cleaner, safer campus.
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
                  isMagnetic={true}
                  onClick={() => onNavigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard')}
                  leftIcon={<ArrowRight size={19} />}
                  className="hero-btn-primary"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate(role === 'admin' ? '/admin/complaints' : '/student/submit')}
                  leftIcon={<PlusCircle size={19} />}
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
                  isMagnetic={true}
                  onClick={() => onNavigate('/login')}
                  leftIcon={<ArrowRight size={19} />}
                  className="hero-btn-primary"
                >
                  Login to Portal
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate('/register')}
                  leftIcon={<PlusCircle size={19} />}
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
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="Enter Reference ID (e.g. PUP-2026-0101)..."
                className="hero-track-input"
              />
              <Button type="submit" variant="gold" size="md" rightIcon={<Search size={16} />}>
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

      {/* 2. HOW IT WORKS (WITH SCROLL REVEAL) */}
      <motion.section
        id="how-it-works"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{ scrollMarginTop: '110px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <div
            style={{
              fontSize: '0.775rem',
              fontWeight: 800,
              color: 'var(--pup-maroon)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.4rem',
            }}
          >
            Streamlined Process
          </div>
          <h2 style={{ fontSize: '2.15rem', fontWeight: 900 }}>How CampusCare Works</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0.5rem auto 0 auto', fontSize: '0.95rem' }}>
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
              icon: <PlusCircle size={22} strokeWidth={2.4} />,
              color: '#7A1228',
            },
            {
              step: '02',
              title: '2. Admin Triage',
              desc: 'Campus care desk verifies the issue, assesses urgency, and routes it to the designated department officer.',
              icon: <Search size={22} strokeWidth={2.4} />,
              color: '#D97706',
            },
            {
              step: '03',
              title: '3. Field Action',
              desc: 'Maintenance engineers and repair crews are dispatched with live milestone updates and progress notes.',
              icon: <Zap size={22} strokeWidth={2.4} />,
              color: '#2563EB',
            },
            {
              step: '04',
              title: '4. Resolution & Close',
              desc: 'The repair is completed, verified by the student, and logged in university maintenance records.',
              icon: <CheckCircle2 size={22} strokeWidth={2.4} />,
              color: '#059669',
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.07 }}
            >
              <Card
                interactive={true}
                glowOnHover={true}
                style={{
                  position: 'relative',
                  padding: '2rem 1.75rem',
                  borderTop: `5px solid ${item.color}`,
                  height: '100%',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-lg)',
                      background: `${item.color}15`,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${item.color}20, inset 0 1px 2px rgba(255,255,255,0.9)`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.65rem',
                      fontWeight: 900,
                      color: 'rgba(148, 163, 184, 0.4)',
                    }}
                  >
                    {item.step}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  {item.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 3. COMPLAINT CATEGORIES (WITH SCROLL REVEAL) */}
      <motion.section
        id="categories"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{ scrollMarginTop: '110px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <div
            style={{
              fontSize: '0.775rem',
              fontWeight: 800,
              color: 'var(--pup-maroon)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.4rem',
            }}
          >
            Service Directory
          </div>
          <h2 style={{ fontSize: '2.15rem', fontWeight: 900 }}>Complaint Categories</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0.5rem auto 0 auto', fontSize: '0.95rem' }}>
            Click any category to file an immediate complaint with pre-filled department routing.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: '1.35rem',
          }}
        >
          {(Object.keys(CATEGORY_METADATA) as ComplaintCategory[]).map((cat, idx) => {
            const meta = CATEGORY_METADATA[cat];
            const activeCount = complaints.filter(
              (c) => c.category === cat && c.status !== 'Resolved' && c.status !== 'Closed'
            ).length;

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.25) }}
              >
                <Card
                  interactive={true}
                  glowOnHover={true}
                  onClick={() => handleCategoryClick(cat)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    height: '100%',
                  }}
                >
                  <div>
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
                          width: '46px',
                          height: '46px',
                          borderRadius: 'var(--radius-lg)',
                          background: `${meta.color}15`,
                          color: meta.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 4px 10px ${meta.color}15, inset 0 1px 2px rgba(255,255,255,0.9)`,
                        }}
                      >
                        {CATEGORY_ICONS[cat]}
                      </div>
                      {activeCount > 0 ? (
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 800,
                            color: '#B45309',
                            background: '#FEF3C7',
                            padding: '3px 9px',
                            borderRadius: 'var(--radius-full)',
                            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9)',
                          }}
                        >
                          {activeCount} Active
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 700,
                            color: '#059669',
                            background: '#ECFDF5',
                            padding: '3px 9px',
                            borderRadius: 'var(--radius-full)',
                            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9)',
                          }}
                        >
                          Normal
                        </span>
                      )}
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>{cat}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                      {meta.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '1.25rem',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid rgba(241, 245, 249, 0.85)',
                      fontSize: '0.8rem',
                      color: 'var(--pup-maroon)',
                      fontWeight: 800,
                    }}
                  >
                    <span>Report in {cat}</span>
                    <ArrowRight size={14} />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 4. PLATFORM STATISTICS */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          background: 'var(--clay-card-bg)',
          borderRadius: 'var(--radius-2xl)',
          padding: '3.5rem 2.5rem',
          border: 'var(--clay-card-border)',
          boxShadow: 'var(--clay-card-shadow)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <div
            style={{
              fontSize: '0.775rem',
              fontWeight: 800,
              color: 'var(--pup-maroon)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.4rem',
            }}
          >
            Live Performance
          </div>
          <h2 style={{ fontSize: '2.15rem', fontWeight: 900 }}>Campus Platform Statistics</h2>
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
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--pup-maroon)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {totalComplaints}+
            </div>
            <div style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
              Complaints Processed
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>Across 10 campus divisions</div>
          </div>

          <div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {resolutionRate}%
            </div>
            <div style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
              Resolution Rate
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>Average student satisfaction</div>
          </div>

          <div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--pup-gold)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              &lt; 24h
            </div>
            <div style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
              Avg First Response
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>Urgent triage within 2 hours</div>
          </div>

          <div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--pup-navy)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              7
            </div>
            <div style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
              Active Wings
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>Estate, IT, Electrical, Hostels</div>
          </div>
        </div>
      </motion.section>

      {/* 5. WHY CAMPUSCARE */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <div
            style={{
              fontSize: '0.775rem',
              fontWeight: 800,
              color: 'var(--pup-maroon)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.4rem',
            }}
          >
            Core Benefits
          </div>
          <h2 style={{ fontSize: '2.15rem', fontWeight: 900 }}>Why PUP CampusCare?</h2>
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
              icon: <Clock size={24} strokeWidth={2.4} />,
            },
            {
              title: 'Photo & File Evidence',
              desc: 'Upload visual proof directly from your phone so technicians arrive with the exact replacement parts required.',
              icon: <Smartphone size={24} strokeWidth={2.4} />,
            },
            {
              title: 'Accountability & SLA',
              desc: 'Automatic escalation for unresolved high-priority complaints ensures prompt action by department heads.',
              icon: <ShieldCheck size={24} strokeWidth={2.4} />,
            },
          ].map((feature, i) => (
            <Card key={i} glowOnHover={true} style={{ padding: '2rem 1.75rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--pup-maroon-subtle)',
                  color: 'var(--pup-maroon)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  boxShadow: '0 4px 10px rgba(122, 18, 40, 0.12), inset 0 1px 2px rgba(255,255,255,0.9)',
                }}
              >
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                {feature.desc}
              </p>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* 6. CALL TO ACTION BANNER */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          background: 'var(--pup-maroon-clay)',
          borderRadius: 'var(--radius-2xl)',
          padding: '3.5rem 2.5rem',
          color: '#FFFFFF',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 20px 40px -10px rgba(122, 18, 40, 0.45), inset 0 2px 3px rgba(255,255,255,0.3)',
        }}
      >
        <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#FFFFFF', maxWidth: '640px', letterSpacing: '-0.02em' }}>
          Notice something that needs repair on campus today?
        </h2>
        <p style={{ color: '#FDE68A', maxWidth: '520px', fontSize: '1rem', lineHeight: 1.55 }}>
          File a complaint in under a minute and help make Punjabi University Patiala a better place for everyone.
        </p>
        <Button
          variant="gold"
          size="lg"
          isMagnetic={true}
          onClick={() => {
            if (!isAuthenticated) onNavigate('/login');
            else onNavigate('/student/submit');
          }}
          leftIcon={<PlusCircle size={20} />}
        >
          Submit a Complaint Now
        </Button>
      </motion.section>
    </div>
  );
};
