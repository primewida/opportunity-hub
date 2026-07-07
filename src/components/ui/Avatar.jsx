import React from 'react';

const SIZE_MAP = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80
};

const FONT_SIZE_MAP = {
  sm: '0.75rem',
  md: '0.875rem',
  lg: '1.25rem',
  xl: '1.75rem'
};

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

function getGradient(name = '') {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export default function Avatar({ src, name = '', size = 'md' }) {
  const dim = SIZE_MAP[size] || SIZE_MAP.md;
  const fontSize = FONT_SIZE_MAP[size] || FONT_SIZE_MAP.md;

  const baseStyle = {
    width: dim,
    height: dim,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        style={{ ...baseStyle, objectFit: 'cover' }}
      />
    );
  }

  return (
    <div
      style={{
        ...baseStyle,
        background: getGradient(name),
        color: '#fff',
        fontWeight: 600,
        fontSize,
        letterSpacing: '0.02em',
        userSelect: 'none'
      }}
      aria-label={name || 'Avatar'}
    >
      {getInitials(name) || '?'}
    </div>
  );
}
