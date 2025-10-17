import React from 'react';
import { Link } from 'react-router-dom';
import './EmptyState.scss';

export type EmptyStateType = 'no-results' | 'no-items' | 'loading-error' | 'generic';

interface EmptyStateProps {
  type: EmptyStateType;
  title: string;
  message: string;
  icon?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  icon,
  actionLabel,
  actionHref,
  onAction,
  className = ''
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'no-results': return '🔍';
      case 'no-items': return '🍽️';
      case 'loading-error': return '⚠️';
      default: return '📱';
    }
  };

  const displayIcon = icon || getDefaultIcon();

  const renderAction = () => {
    if (!actionLabel) return null;

    if (actionHref) {
      return (
        <Link to={actionHref} className="btn btn--secondary">
          {actionLabel}
        </Link>
      );
    }

    if (onAction) {
      return (
        <button onClick={onAction} className="btn btn--secondary">
          {actionLabel}
        </button>
      );
    }

    return null;
  };

  return (
    <div className={`empty-state empty-state--${type} ${className}`}>
      <div className="empty-state__icon">
        {displayIcon}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {renderAction()}
    </div>
  );
};

export default EmptyState;