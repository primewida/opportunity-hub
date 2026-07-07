export default function Skeleton({ variant = 'text', lines = 3, width, height }) {
  if (variant === 'avatar') {
    return <div className="skeleton" style={{ width: width || 40, height: height || 40, borderRadius: '50%' }} />;
  }
  if (variant === 'thumbnail' || variant === 'card') {
    return <div className="skeleton" style={{ width: width || '100%', height: height || (variant === 'card' ? 180 : 120), borderRadius: 'var(--radius-md)' }} />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: width || '100%' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: height || 14, borderRadius: 4, width: i === lines - 1 ? '70%' : '100%' }} />
      ))}
    </div>
  );
}
