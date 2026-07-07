import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-3xl) var(--space-lg)', textAlign: 'center', gap: 'var(--space-md)', minHeight: 300 }}>
      {Icon && <Icon size={56} strokeWidth={1.2} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: 320, margin: 0 }}>{description}</p>
      {actionLabel && onAction && <Button variant="primary" onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
