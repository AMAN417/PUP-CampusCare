import React from 'react';

export const LoadingSkeleton: React.FC<{
  type?: 'card' | 'table' | 'text' | 'profile';
  count?: number;
}> = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
        {items.map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: '52px',
              width: '100%',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--clay-inset-shadow)',
            }}
          />
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}>
        {items.map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: '18px',
              width: i === count - 1 ? '60%' : '100%',
              borderRadius: 'var(--radius-sm)',
            }}
          />
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          padding: '1.5rem',
          boxShadow: 'var(--clay-card-shadow)',
        }}
      >
        <div className="skeleton" style={{ width: 68, height: 68, borderRadius: '50%' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
          <div className="skeleton" style={{ height: 22, width: '45%' }} />
          <div className="skeleton" style={{ height: 16, width: '65%' }} />
        </div>
      </div>
    );
  }

  // Default: card skeleton
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
      {items.map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: '190px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--clay-card-shadow)',
          }}
        />
      ))}
    </div>
  );
};
