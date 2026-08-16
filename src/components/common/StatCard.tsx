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
      whileHover={onClick ? { y: -3, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={`stat-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <span className="stat-label">{label}</span>
        <div className="stat-value">{value}</div>
        {trend && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: trend.isPositive ? '#059669' : '#DC2626',
            }}
          >
            <span>{trend.value}</span>
            {trend.label && <span style={{ color: 'var(--text-muted)' }}>{trend.label}</span>}
          </div>
        )}
      </div>
      <div
        className="stat-icon-wrapper"
        style={{
          backgroundColor: iconBg,
          color: iconColor,
        }}
      >
        {icon}
      </div>
    </motion.div>
  );
};
