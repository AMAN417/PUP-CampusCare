import React from 'react';

interface PUPLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  lightMode?: boolean;
}

export const PUPLogo: React.FC<PUPLogoProps> = ({
  size = 'md',
  showTagline = true,
  lightMode = false,
}) => {
  const emblemSizes = {
    sm: { box: 32, font: '0.875rem' },
    md: { box: 40, font: '1.125rem' },
    lg: { box: 50, font: '1.375rem' },
  };

  const titleSizes = {
    sm: '1.05rem',
    md: '1.25rem',
    lg: '1.6rem',
  };

  const current = emblemSizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {/* Abstract Emblem */}
      <div
        style={{
          width: current.box,
          height: current.box,
          background: 'linear-gradient(135deg, #7A1228 0%, #560C1C 100%)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          fontSize: current.font,
          boxShadow: '0 4px 10px rgba(122, 18, 40, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <span>PUP</span>
        {/* Subtle Gold Corner Notch */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 10,
            height: 10,
            background: '#D97706',
            clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
          }}
        />
      </div>

      {/* Wordmark */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: titleSizes[size],
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: lightMode ? '#FFFFFF' : '#7A1228',
            lineHeight: 1.15,
          }}
        >
          PUP <span style={{ color: lightMode ? '#FDE68A' : '#D97706' }}>CampusCare</span>
        </div>
        {showTagline && (
          <span
            className="pup-logo-tagline"
            style={{
              fontSize: size === 'lg' ? '0.8125rem' : '0.7rem',
              color: lightMode ? '#CBD5E1' : '#64748B',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Report. Track. Resolve.
          </span>
        )}
      </div>
    </div>
  );
};
