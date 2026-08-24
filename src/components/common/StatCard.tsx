import React from 'react';
import { motion } from 'framer-motion';

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconBg = 'var(--pup-maroon-subtle)',
  iconColor = 'var(--pup-maroon)',
  trend,
  onClick,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.015,
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
      }}
      onClick={onClick}
      className={`stat-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div>
        <span className="stat-label">{label}</span>
        <div className="stat-value">{value}</div>
        {trend && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.775rem',
              fontWeight: 700,
              color: trend.isPositive ? '#059669' : '#DC2626',
              background: trend.isPositive ? '#ECFDF5' : '#FEF2F2',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              marginTop: '0.35rem',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)',
            }}
          >
            <span>{trend.value}</span>
            {trend.label && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{trend.label}</span>}
          </div>
        )}
      </div>
      <motion.div
        className="stat-icon-wrapper"
        whileHover={{ scale: 1.14, rotate: 3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        style={{
          backgroundColor: iconBg,
          color: iconColor,
        }}
      >
        {icon}
      </motion.div>
    </motion.div>
  );
};
