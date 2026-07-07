import React from 'react';
import './MatchBadge.css';

const SIZES = {
  sm: 40,
  md: 60,
  lg: 90
};

function getMatchColor(percentage) {
  if (percentage >= 80) return 'var(--color-success, #22c55e)';
  if (percentage >= 60) return 'var(--color-primary, #6366f1)';
  if (percentage >= 40) return 'var(--color-warning, #f59e0b)';
  return 'var(--color-error, #ef4444)';
}

export default function MatchBadge({ percentage = 0, size = 'md' }) {
  const dim = SIZES[size] || SIZES.md;
  const strokeWidth = size === 'sm' ? 3 : size === 'lg' ? 5 : 4;
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = getMatchColor(percentage);

  return (
    <div
      className={`match-badge match-badge--${size}`}
      style={{ width: dim, height: dim }}
      aria-label={`${percentage}% match`}
    >
      <svg
        className="match-badge__ring"
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
      >
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="var(--border-color, #e5e7eb)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
          className="match-badge__progress"
        />
      </svg>
      <div className="match-badge__text">
        <span className="match-badge__number">{percentage}</span>
        <span className="match-badge__symbol">%</span>
      </div>
    </div>
  );
}
