import React, { useState } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
  noPadding?: boolean;
  variant?: 'raised' | 'inset' | 'flat' | 'highlight';
  glowOnHover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  className = '',
  noPadding = false,
  variant = 'raised',
  glowOnHover = false,
  style,
  ...props
}) => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const variantStyles: Record<string, React.CSSProperties> = {
    raised: {},
    inset: {
      background: 'var(--clay-inset-bg)',
      boxShadow: 'var(--clay-inset-shadow)',
      border: '1px solid rgba(226, 232, 240, 0.6)',
    },
    flat: {
      background: '#FFFFFF',
      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
      border: '1px solid rgba(226, 232, 240, 0.7)',
    },
    highlight: {
      background: 'linear-gradient(145deg, #FFFFFF 0%, #FDF2F4 100%)',
      border: '1px solid rgba(122, 18, 40, 0.15)',
      boxShadow: '0 12px 28px -4px rgba(122, 18, 40, 0.12), inset 0 2px 3px rgba(255, 255, 255, 1)',
    },
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!glowOnHover || typeof window === 'undefined' || window.innerWidth < 768) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    if (glowOnHover) setMousePos(null);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={
        interactive
          ? {
              y: -4,
              scale: 1.012,
              transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
            }
          : undefined
      }
      className={`card ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{
        padding: noPadding ? 0 : undefined,
        position: 'relative',
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {/* Subtle cursor spotlight glow */}
      {glowOnHover && mousePos && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            top: mousePos.y - 120,
            left: mousePos.x - 120,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(122, 18, 40, 0.05) 0%, transparent 70%)',
            transition: 'opacity 0.2s ease',
            zIndex: 1,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </motion.div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div className={`card-header ${className}`}>
    <div>
      <h3 className="card-title">{title}</h3>
      {subtitle && (
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 500 }}>
          {subtitle}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const CardBody: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', style }) => (
  <div className={`card-body ${className}`} style={style}>
    {children}
  </div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div
    className={`card-footer ${className}`}
    style={{
      marginTop: '1.25rem',
      paddingTop: '1rem',
      borderTop: '1px solid rgba(241, 245, 249, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    {children}
  </div>
);
