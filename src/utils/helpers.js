/* ============================================================
   OpportunityHub — Helper Utilities
   Pure utility functions used across the application.
   ============================================================ */

/**
 * Format a date into a human-readable string.
 * @param {string|Date} date
 * @returns {string} e.g. "Jan 15, 2025"
 */
export function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculate days until a given deadline.
 * @param {string|Date} date
 * @returns {number} Number of days (negative if past)
 */
export function daysUntilDeadline(date) {
  const deadline = new Date(date);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get a CSS color variable based on deadline urgency.
 * @param {string|Date} deadline
 * @returns {string} CSS variable string
 */
export function getDeadlineColor(deadline) {
  const days = daysUntilDeadline(deadline);
  if (days < 0) return 'var(--text-secondary)';
  if (days <= 7) return 'var(--color-error)';
  if (days <= 30) return 'var(--color-warning)';
  return 'var(--color-success)';
}

/**
 * Get a human-readable deadline text.
 * @param {string|Date} deadline
 * @returns {string} e.g. "3 days left", "2 weeks left"
 */
export function getDeadlineText(deadline) {
  const days = daysUntilDeadline(deadline);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day left';
  if (days < 7) return `${days} days left`;
  if (days < 14) return '1 week left';
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} weeks left`;
  }
  if (days < 60) return '1 month left';
  const months = Math.floor(days / 30);
  return `${months} months left`;
}

/**
 * Get a CSS color variable based on match percentage.
 * @param {number} pct - Percentage 0–100
 * @returns {string}
 */
export function getMatchColor(pct) {
  if (pct >= 80) return 'var(--color-success)';
  if (pct >= 50) return 'var(--color-accent-amber)';
  return 'var(--color-error)';
}

/**
 * Return a time-of-day greeting.
 * @param {string} name
 * @returns {string}
 */
export function getGreeting(name) {
  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  return name ? `${greeting}, ${name}!` : `${greeting}!`;
}

/**
 * Format bytes into a human-readable file size.
 * @param {number} bytes
 * @returns {string} e.g. "2.3 MB"
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}

/**
 * Get initials from a full name.
 * @param {string} name
 * @returns {string} e.g. "CO" from "Chidi Okonkwo"
 */
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Truncate text to a maximum length, appending "…" if truncated.
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */
export function truncateText(text, max = 100) {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

/**
 * Generate a random ID string.
 * @returns {string}
 */
export function generateId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Calculate a mock match percentage between a user profile and opportunity requirements.
 * Returns a deterministic-looking value between 60 and 95.
 * @param {object} profile - User profile object
 * @param {object} requirements - Opportunity requirements object
 * @returns {number}
 */
export function calculateMatchPercentage(profile, requirements) {
  if (!profile || !requirements) return 75;

  let score = 70;

  // Boost if education level matches
  if (requirements.educationLevel && profile.educationLevel === requirements.educationLevel) {
    score += 8;
  }

  // Boost if field of study matches
  if (requirements.fieldOfStudy && profile.fieldOfStudy === requirements.fieldOfStudy) {
    score += 7;
  }

  // Boost if state matches
  if (requirements.state && profile.state === requirements.state) {
    score += 5;
  }

  // Boost based on matching interests
  if (requirements.tags && profile.interests) {
    const matchingInterests = profile.interests.filter((interest) =>
      requirements.tags.includes(interest)
    );
    score += Math.min(matchingInterests.length * 3, 10);
  }

  // Clamp to 60-95
  return Math.max(60, Math.min(95, score));
}

/**
 * Get a relative time string from a timestamp.
 * @param {string|Date|number} timestamp
 * @returns {string} e.g. "2 hours ago", "yesterday", "3 days ago"
 */
export function getRelativeTime(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffWeek === 1) return '1 week ago';
  if (diffWeek < 4) return `${diffWeek} weeks ago`;
  if (diffMonth === 1) return '1 month ago';
  if (diffMonth < 12) return `${diffMonth} months ago`;
  return formatDate(timestamp);
}

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay - milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Simple pluralisation helper.
 * @param {number} count
 * @param {string} singular
 * @param {string} [plural]
 * @returns {string}
 */
export function pluralize(count, singular, plural) {
  return count === 1 ? singular : (plural || `${singular}s`);
}
