import React, { useMemo } from 'react';
import { Calendar, Bookmark, BookmarkCheck } from 'lucide-react';
import MatchBadge from './MatchBadge';
import './OpportunityCard.css';

function getDeadlineInfo(deadline) {
  if (!deadline) return { text: 'No deadline', color: 'var(--text-secondary)', urgent: false };
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: 'Expired', color: 'var(--color-error)', urgent: true };
  if (diffDays === 0) return { text: 'Due today', color: 'var(--color-error)', urgent: true };
  if (diffDays <= 3) return { text: `${diffDays}d left`, color: 'var(--color-error)', urgent: true };
  if (diffDays <= 7) return { text: `${diffDays}d left`, color: 'var(--color-warning)', urgent: false };
  if (diffDays <= 30) return { text: `${diffDays}d left`, color: 'var(--color-success)', urgent: false };

  return {
    text: deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    color: 'var(--text-secondary)',
    urgent: false
  };
}

function getLogoColor(name) {
  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
    '#f43f5e', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function OpportunityCard({
  opportunity,
  onBookmark,
  onClick,
  compact = false
}) {
  const {
    title,
    organization,
    provider,
    tags: rawTags,
    matchPercentage,
    deadline,
    bookmarked = false,
    id
  } = opportunity || {};

  const org = organization || provider || '';
  // Tags come as JSON string from backend, or array from mock data
  const tags = useMemo(() => {
    if (Array.isArray(rawTags)) return rawTags;
    if (typeof rawTags === 'string') {
      try { const parsed = JSON.parse(rawTags); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
    }
    return [];
  }, [rawTags]);

  const deadlineInfo = useMemo(() => getDeadlineInfo(deadline), [deadline]);
  const logoColor = useMemo(() => getLogoColor(org), [org]);
  const initial = (org || '?')[0].toUpperCase();

  return (
    <article
      className={`opportunity-card card card-interactive ${compact ? 'opportunity-card--compact' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(e); }}
    >
      <div className="opportunity-card__logo" style={{ background: logoColor }}>
        {initial}
      </div>

      <div className="opportunity-card__content">
        <h3 className="opportunity-card__title line-clamp-2">{title}</h3>
        <p className="opportunity-card__org text-secondary">{org}</p>
        {tags.length > 0 && (
          <div className="opportunity-card__tags">
            {tags.slice(0, compact ? 2 : 4).map((tag) => (
              <span key={tag} className="chip chip-sm">{tag}</span>
            ))}
            {tags.length > (compact ? 2 : 4) && (
              <span className="chip chip-sm">+{tags.length - (compact ? 2 : 4)}</span>
            )}
          </div>
        )}
      </div>

      {matchPercentage != null && (
        <div className="opportunity-card__match">
          <MatchBadge percentage={matchPercentage} size={compact ? 'sm' : 'md'} />
        </div>
      )}

      <div className="opportunity-card__footer">
        <span className="opportunity-card__deadline" style={{ color: deadlineInfo.color }}>
          <Calendar size={14} />
          {deadlineInfo.text}
        </span>
        <button
          className="opportunity-card__bookmark"
          onClick={(e) => { e.stopPropagation(); onBookmark?.(id); }}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          {bookmarked
            ? <BookmarkCheck size={20} style={{ color: 'var(--color-primary)' }} />
            : <Bookmark size={20} />
          }
        </button>
      </div>
    </article>
  );
}
