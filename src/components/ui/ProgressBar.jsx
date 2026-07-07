import React from 'react';

export default function ProgressBar({
  progress = 0,
  label,
  showPercentage = false,
  size = 'md',
  color
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="progress-bar-wrapper">
      {(label || showPercentage) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-1)' }}>
          {label && <span className="progress-bar-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>}
          {showPercentage && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div
        className={`progress-bar ${size === 'sm' ? 'progress-bar-sm' : ''}`}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="progress-bar-fill"
          style={{
            width: `${clampedProgress}%`,
            ...(color ? { background: color } : {})
          }}
        />
      </div>
    </div>
  );
}
