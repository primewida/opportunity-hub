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

function normalizeEdu(level = '') {
  const l = (level || '').toLowerCase().trim();
  if (l.includes('primary') || l.includes('basic') || l.includes('elementary')) return 'primary';
  if (l.includes('jss') || l.includes('junior secondary')) return 'jss';
  if (l.includes('sss') || l.includes('senior secondary') || l.includes('high school') || l.includes('waec') || l.includes('neco') || l.includes('secondary')) return 'sss';
  if (l.includes('phd') || l.includes('doctorate') || l.includes('postdoc')) return 'phd';
  if (l.includes('master') || l.includes('postgraduate') || l.includes('msc') || l.includes('mba')) return 'masters';
  if (l.includes('nysc') || l.includes('corps member')) return 'nysc';
  if (l.includes('graduate') || l.includes('alumni')) return 'graduate';
  if (l.includes('undergrad') || l.includes('bachelor') || l.includes('bsc') || l.includes('university') || l.includes('polytechnic') || l.includes('college')) return 'undergraduate';
  return 'undergraduate';
}

function getFieldKeywords(field = '') {
  const f = (field || '').toLowerCase();
  const clusters = {
    tech: ['computer', 'software', 'data', 'artificial intelligence', 'ai', 'cyber', 'tech', 'programming', 'developer', 'it', 'cloud', 'information technology', 'systems'],
    engineering: ['engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'petroleum', 'mechatronics', 'aerospace', 'robotics'],
    health: ['medicine', 'surgery', 'nursing', 'pharmacy', 'health', 'medical', 'biochemistry', 'biology', 'public health', 'dentistry', 'biomedical'],
    business: ['business', 'accounting', 'finance', 'economics', 'banking', 'management', 'marketing', 'commerce', 'entrepreneurship'],
    law_arts: ['law', 'legal', 'policy', 'political', 'arts', 'media', 'mass comm', 'journalism', 'design', 'creative', 'literature', 'humanities'],
    science: ['physics', 'chemistry', 'mathematics', 'statistics', 'geology', 'geosciences', 'science', 'environmental']
  };

  const matched = [];
  for (const [key, terms] of Object.entries(clusters)) {
    if (terms.some(t => f.includes(t))) {
      matched.push(key);
    }
  }
  return matched;
}

/**
 * Calculate intelligent match percentage between a user profile and an opportunity or job.
 * @param {object} profile - User profile object
 * @param {object} opportunity - Opportunity or Job object
 * @returns {number} 35–98
 */
export function calculateMatchPercentage(profile, opportunity) {
  if (!profile || !opportunity) return opportunity?.matchPercentage || 65;

  let score = 0;
  const userEdu = normalizeEdu(profile.educationLevel || profile.education || 'undergraduate');
  const oppEdu = normalizeEdu(opportunity.educationLevel || opportunity.education || '');
  const oppTitleDesc = `${opportunity.title || ''} ${opportunity.description || ''} ${opportunity.responsibilities || ''}`.toLowerCase();

  // 1. Education Level Matching (35 Points)
  if (userEdu === 'primary') {
    if (oppEdu === 'primary' || oppTitleDesc.includes('primary') || oppTitleDesc.includes('kids') || oppTitleDesc.includes('junior')) {
      score += 35;
    } else if (oppEdu === 'undergraduate' || oppEdu === 'masters' || oppEdu === 'phd') {
      score -= 50;
    } else {
      score += 15;
    }
  } else if (userEdu === 'jss' || userEdu === 'sss') {
    if (oppEdu === 'sss' || oppEdu === 'jss' || oppTitleDesc.includes('secondary') || oppTitleDesc.includes('high school') || oppTitleDesc.includes('waec') || oppTitleDesc.includes('neco')) {
      score += 35;
    } else if (oppEdu === 'masters' || oppEdu === 'phd') {
      score -= 45;
    } else {
      score += 15;
    }
  } else if (userEdu === 'undergraduate') {
    if (oppEdu === 'undergraduate' || oppTitleDesc.includes('undergraduate') || oppTitleDesc.includes('university') || oppTitleDesc.includes('polytechnic') || oppTitleDesc.includes('bachelor')) {
      score += 35;
    } else if (oppEdu === 'primary') {
      score -= 40;
    } else if (oppEdu === 'masters') {
      score += 12;
    } else {
      score += 20;
    }
  } else if (userEdu === 'masters' || userEdu === 'phd') {
    if (oppEdu === 'masters' || oppEdu === 'phd' || oppTitleDesc.includes('postgraduate') || oppTitleDesc.includes('master') || oppTitleDesc.includes('phd') || oppTitleDesc.includes('fellowship')) {
      score += 35;
    } else if (oppEdu === 'primary' || oppEdu === 'sss') {
      score -= 40;
    } else {
      score += 20;
    }
  } else if (userEdu === 'nysc' || userEdu === 'graduate') {
    if (oppEdu === 'nysc' || oppEdu === 'graduate' || oppTitleDesc.includes('nysc') || oppTitleDesc.includes('graduate') || oppTitleDesc.includes('job') || oppTitleDesc.includes('entry level')) {
      score += 35;
    } else {
      score += 22;
    }
  }

  // 2. Field of Study / Course Matching (25 Points)
  const userCourse = (profile.courseOfStudy || profile.course || '').toLowerCase().trim();
  const oppField = (opportunity.fieldOfStudy || '').toLowerCase().trim();

  if (userCourse) {
    const userClusters = getFieldKeywords(userCourse);
    const oppClusters = getFieldKeywords(`${oppField} ${oppTitleDesc}`);

    const hasClusterOverlap = userClusters.some(c => oppClusters.includes(c));
    const directCourseMatch = userCourse.length > 3 && (oppField.includes(userCourse) || oppTitleDesc.includes(userCourse));

    if (directCourseMatch) {
      score += 25;
    } else if (hasClusterOverlap) {
      score += 22;
    } else if (!oppField || oppField === 'general' || oppField.includes('all') || oppTitleDesc.includes('all disciplines')) {
      score += 15;
    } else {
      score += 5;
    }
  } else {
    score += 15;
  }

  // 3. User Interests & Aspirations (20 Points)
  const userInterests = Array.isArray(profile.interests)
    ? profile.interests.map(i => (typeof i === 'string' ? i : i.name || '').toLowerCase())
    : [];

  const oppTags = Array.isArray(opportunity.tags) ? opportunity.tags.map(t => String(t).toLowerCase()) : [];

  if (userInterests.length > 0) {
    let matchedCount = 0;
    for (const interest of userInterests) {
      if (
        oppTags.some(t => t.includes(interest)) ||
        oppTitleDesc.includes(interest) ||
        (oppField && oppField.includes(interest))
      ) {
        matchedCount++;
      }
    }

    if (matchedCount >= 3) score += 20;
    else if (matchedCount === 2) score += 16;
    else if (matchedCount === 1) score += 12;
    else score += 4;
  } else {
    score += 12;
  }

  // 4. Location & State of Origin (10 Points)
  const userState = (profile.stateOfOrigin || profile.currentState || profile.state || '').toLowerCase();
  const oppLoc = (opportunity.location || '').toLowerCase();

  if (oppLoc.includes('remote') || oppLoc.includes('global') || oppLoc.includes('nigeria') || oppLoc.includes('africa')) {
    score += 10;
  } else if (userState && oppLoc.includes(userState)) {
    score += 10;
  } else {
    score += 5;
  }

  // 5. Gender Filter
  const genderKeywords = {
    female: ['women in tech', 'women', 'female', 'girls', 'she code', 'girl child', 'women only'],
    male: ['men only', 'male only', 'boys only']
  };

  const isFemaleOnly = genderKeywords.female.some(kw => oppTitleDesc.includes(kw));
  const isMaleOnly = genderKeywords.male.some(kw => oppTitleDesc.includes(kw));

  if (profile.gender) {
    const g = profile.gender.toLowerCase();
    if (isFemaleOnly && g !== 'female') score -= 50;
    else if (isMaleOnly && g !== 'male') score -= 50;
  }

  return Math.round(Math.min(98, Math.max(35, score)));
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
