import React from 'react';
import { PUPLogo } from '../common/PUPLogo';
import { Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer
      style={{
        background: 'var(--pup-navy)',
        color: '#F8FAFC',
        padding: '3rem 1.5rem 1.5rem 1.5rem',
        borderTop: '1px solid #1E293B',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Brand Column */}
        <div>
          <PUPLogo size="md" lightMode={true} />
          <p
            style={{
              fontSize: '0.85rem',
              color: '#94A3B8',
              lineHeight: 1.6,
              marginTop: '1rem',
              maxWidth: '300px',
            }}
          >
            A centralized digital complaint tracking and resolution platform for students, faculty,
            and campus administration of Punjabi University Patiala.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginTop: '1rem',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(217, 119, 6, 0.2)',
              color: '#FDE68A',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <span>Official Campus Portal</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4
            style={{
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginBottom: '1rem',
              letterSpacing: '0.02em',
            }}
          >
            Quick Portals
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
            <li>
              <a
                href="#report"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('/student/submit');
                }}
                style={{ color: '#CBD5E1' }}
              >
                Report an Issue
              </a>
            </li>
            <li>
              <a
                href="#track"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('/student/complaints');
                }}
                style={{ color: '#CBD5E1' }}
              >
                Track My Complaints
              </a>
            </li>
            <li>
              <a
                href="#admin"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('/admin/dashboard');
                }}
                style={{ color: '#CBD5E1' }}
              >
                Administrative Console
              </a>
            </li>
            <li>
              <a
                href="#categories"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('/');
                  setTimeout(() => {
                    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                style={{ color: '#CBD5E1' }}
              >
                Service Categories
              </a>
            </li>
          </ul>
        </div>

        {/* Essential Categories */}
        <div>
          <h4
            style={{
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            Key Categories
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
            <li style={{ color: '#94A3B8' }}>• Hostel Maintenance & Rooms</li>
            <li style={{ color: '#94A3B8' }}>• Water Supply & RO Coolers</li>
            <li style={{ color: '#94A3B8' }}>• Campus Wi-Fi & IT Center</li>
            <li style={{ color: '#94A3B8' }}>• Electrical Grid & Streetlights</li>
            <li style={{ color: '#94A3B8' }}>• Classrooms & Smart Labs</li>
          </ul>
        </div>

        {/* University Contact (Fictional Demo) */}
        <div>
          <h4
            style={{
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            Campus Care Desk
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94A3B8' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <MapPin size={16} style={{ color: 'var(--pup-gold)', flexShrink: 0, marginTop: '2px' }} />
              <span>Campus Care Cell, Estate Building, Punjabi University, Patiala, Punjab - 147002</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={16} style={{ color: 'var(--pup-gold)', flexShrink: 0 }} />
              <span>Helpline: +91 175 3046000 (Mon-Sat, 9am-5pm)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} style={{ color: 'var(--pup-gold)', flexShrink: 0 }} />
              <span>campuscare.demo@pup.ac.in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar & Disclaimer */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid #334155',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.75rem',
          color: '#64748B',
        }}
      >
        <div>
          © {new Date().getFullYear()} PUP CampusCare — Punjabi University Patiala. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span>Report. Track. Resolve.</span>
        </div>
      </div>
    </footer>
  );
};
