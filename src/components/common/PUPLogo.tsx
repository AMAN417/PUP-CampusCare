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
    sm: { box: 34, font: '0.875rem', radius: '10px' },
    md: { box: 44, font: '1.15rem', radius: '14px' },
    lg: { box: 54, font: '1.4rem', radius: '18px' },
  };

  const titleSizes = {
    sm: '1.1rem',
    md: '1.35rem',
    lg: '1.75rem',
  };

  const current = emblemSizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
      {/* Abstract Clay Emblem */}
      <div
        style={{
          width: current.box,
          height: current.box,
          background: 'linear-gradient(145deg, #911732 0%, #680D21 100%)',
          borderRadius: current.radius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontWeight: 900,
          fontFamily: 'var(--font-heading)',
          fontSize: current.font,
          boxShadow: 
            '0 6px 16px -2px rgba(122, 18, 40, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.45), inset 0 -2px 3px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <span>PUP</span>
        {/* Gold Corner Notch */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: size === 'lg' ? 14 : 11,
            height: size === 'lg' ? 14 : 11,
            background: 'linear-gradient(135deg, #FBBF24, #D97706)',
            clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7)',
          }}
        />
      </div>

      {/* Wordmark */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: titleSizes[size],
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: lightMode ? '#FFFFFF' : '#7A1228',
            lineHeight: 1.12,
          }}
        >
          PUP <span style={{ color: lightMode ? '#FDE68A' : '#D97706' }}>CampusCare</span>
        </div>
        {showTagline && (
          <span
            className="pup-logo-tagline"
            style={{
              fontSize: size === 'lg' ? '0.825rem' : '0.725rem',
              color: lightMode ? '#CBD5E1' : '#64748B',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '1px',
            }}
          >
            Report. Track. Resolve.
          </span>
        )}
      </div>
    </div>
  );
};
