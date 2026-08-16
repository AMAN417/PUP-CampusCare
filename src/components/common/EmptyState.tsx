import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  icon = <Inbox size={32} />,
  actionText,
  onAction,
  actionIcon,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="empty-state"
    >
      <div className="empty-state-icon">{icon}</div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-description">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction} leftIcon={actionIcon}>
          {actionText}
        </Button>
      )}
    </motion.div>
  );
};
