import React from 'react';

export const LoadingSkeleton: React.FC<{
  type?: 'card' | 'table' | 'text' | 'profile';
  count?: number;
}> = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
        {items.map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: '48px', width: '100%', borderRadius: 'var(--radius-md)' }}
          />
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
        {items.map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: '16px', width: i === count - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
        <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <div className="skeleton" style={{ height: 20, width: '40%' }} />
          <div className="skeleton" style={{ height: 14, width: '60%' }} />
        </div>
      </div>
    );
  }

  // Default: card skeleton
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
      {items.map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: '180px',
            borderRadius: 'var(--radius-lg)',
          }}
        />
      ))}
    </div>
  );
};
