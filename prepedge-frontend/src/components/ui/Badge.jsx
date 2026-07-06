const VARIANTS = {
  brand:   'bg-brand/15 text-brand',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger:  'bg-danger/15 text-danger',
  info:    'bg-info/15 text-info',
  neutral: 'bg-bg-elevated text-text-secondary',
};

export default function Badge({ children, variant = 'neutral', icon, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-medium ${VARIANTS[variant]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}