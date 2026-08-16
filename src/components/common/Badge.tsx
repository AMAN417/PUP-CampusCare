import React from 'react';
import type { ComplaintStatus, Priority } from '../../types';
import {
  Clock,
  Search,
  UserCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Flame,
} from 'lucide-react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'maroon' | 'gold' | 'navy' | 'gray' | 'success';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  icon,
}) => {
  const variantStyles = {
    default: { background: 'var(--bg-surface-subtle)', color: 'var(--text-secondary)' },
    maroon: { background: 'var(--pup-maroon-subtle)', color: 'var(--pup-maroon)', border: '1px solid rgba(122, 18, 40, 0.2)' },
    gold: { background: 'var(--pup-gold-subtle)', color: '#B45309', border: '1px solid rgba(217, 119, 6, 0.2)' },
    navy: { background: 'var(--pup-navy-subtle)', color: 'var(--pup-navy)' },
    gray: { background: '#F1F5F9', color: '#475569' },
    success: { background: '#ECFDF5', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.2)' },
  };

  return (
    <span className={`badge ${className}`} style={variantStyles[variant]}>
      {icon}
      <span>{children}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ComplaintStatus; showIcon?: boolean }> = ({
  status,
  showIcon = true,
}) => {
  const statusConfig: Record<
    ComplaintStatus,
    { className: string; icon: React.ReactNode; label: string }
  > = {
    Submitted: {
      className: 'status-submitted',
      icon: <Clock size={12} />,
      label: 'Submitted',
    },
    'Under Review': {
      className: 'status-under-review',
      icon: <Search size={12} />,
      label: 'Under Review',
    },
    Assigned: {
      className: 'status-assigned',
      icon: <UserCheck size={12} />,
      label: 'Assigned',
    },
    'In Progress': {
      className: 'status-in-progress',
      icon: <Wrench size={12} />,
      label: 'In Progress',
    },
    Resolved: {
      className: 'status-resolved',
      icon: <CheckCircle2 size={12} />,
      label: 'Resolved',
    },
    Closed: {
      className: 'status-closed',
      icon: <XCircle size={12} />,
      label: 'Closed',
    },
  };

  const current = statusConfig[status] || statusConfig.Submitted;

  return (
    <span className={`badge ${current.className}`}>
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority; showIcon?: boolean }> = ({
  priority,
  showIcon = true,
}) => {
  const priorityConfig: Record<
    Priority,
    { className: string; icon: React.ReactNode; label: string }
  > = {
    Low: {
      className: 'priority-low',
      icon: <ArrowDown size={12} />,
      label: 'Low Priority',
    },
    Medium: {
      className: 'priority-medium',
      icon: <ArrowRight size={12} />,
      label: 'Medium Priority',
    },
    High: {
      className: 'priority-high',
      icon: <ArrowUp size={12} />,
      label: 'High Priority',
    },
    Urgent: {
      className: 'priority-urgent',
      icon: <Flame size={12} />,
      label: 'Urgent',
    },
  };

  const current = priorityConfig[priority] || priorityConfig.Medium;

  return (
    <span className={`badge ${current.className}`}>
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
};
