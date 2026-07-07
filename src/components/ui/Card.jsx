import React from 'react';

export default function Card({
  children,
  variant,
  className = '',
  onClick,
  padding = true,
  ...props
}) {
  const classes = [
    'card',
    variant && `card-${variant}`,
    onClick && 'card-interactive',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
      {...props}
    >
      {padding ? <div className="card-body">{children}</div> : children}
    </div>
  );
}
