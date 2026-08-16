import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  className = '',
  noPadding = false,
  style,
  ...props
}) => {
  return (
    <motion.div
      whileHover={interactive ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={`card ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{
        padding: noPadding ? 0 : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
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
      {subtitle && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{subtitle}</p>}
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
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    {children}
  </div>
);
