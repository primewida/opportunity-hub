import React from 'react';

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = ''
}) {
  const classes = [
    'badge',
    `badge-${variant}`,
    size === 'sm' && 'badge-sm',
    className
  ].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
}
