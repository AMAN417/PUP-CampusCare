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
  FileCheck,
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
  const { isAuthenticated, role, loginAsDemo } = useAuth();
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
      loginAsDemo('student');
    }
    onNavigate(`/student/submit?category=${encodeURIComponent(category)}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem', paddingBottom: '3rem' }}>
      {/* 1. HERO SECTION */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #3B0713 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '4.5rem 2rem',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Subtle decorative glow circles */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(122, 18, 40, 0.4) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '10%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.25) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(217, 119, 6, 0.18)',
              border: '1px solid rgba(217, 119, 6, 0.4)',
              color: '#FDE68A',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={15} />
            <span>Official University Campus Support Portal</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.75rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '1.25rem',
            }}
          >
            PUP CampusCare
            <br />
            <span style={{ color: '#F59E0B' }}>"Report. Track. Resolve."</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: '#CBD5E1',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 2.25rem auto',
            }}
          >
            A centralized platform for Punjabi University Patiala to report maintenance issues,
            monitor real-time repair progress, and ensure a safer, cleaner, and well-maintained campus.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '3rem',
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (!isAuthenticated) loginAsDemo('student');
                onNavigate('/student/submit');
              }}
              leftIcon={<PlusCircle size={20} />}
              style={{
                background: 'var(--pup-maroon)',
                boxShadow: '0 10px 25px rgba(122, 18, 40, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Report an Issue
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                if (!isAuthenticated) loginAsDemo('student');
                onNavigate('/student/complaints');
              }}
              leftIcon={<FileCheck size={20} />}
              style={{
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              Track Complaints
            </Button>
          </motion.div>

          {/* Quick Track Search Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="Enter Complaint Reference ID (e.g. PUP-2026-0101)..."
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 1rem',
                  fontSize: '0.875rem',
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
              <Button type="submit" variant="gold" size="md" rightIcon={<ArrowRight size={16} />}>
                Track
              </Button>
            </form>
            {trackError && (
              <div style={{ color: '#FCA5A5', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'left', paddingLeft: '0.5rem' }}>
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
            if (!isAuthenticated) loginAsDemo('student');
            onNavigate('/student/submit');
          }}
          leftIcon={<PlusCircle size={18} />}
        >
          Submit a Complaint Now
        </Button>
      </section>
    </div>
  );
};
