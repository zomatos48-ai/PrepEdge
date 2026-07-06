export default function Card({ children, interactive = false, active = false, className = '', ...props }) {
  return (
    <div
      className={`bg-bg-surface border rounded-card p-5 transition-colors
        ${active ? 'border-brand ring-1 ring-brand/30' : 'border-border-subtle'}
        ${interactive ? 'hover:border-border-default cursor-pointer' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}