const COLORS = {
  brand: 'bg-brand', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', info: 'bg-info',
};

export default function ProgressBar({ value = 0, color = 'brand', showLabel = false, className = '' }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 rounded-pill bg-bg-elevated overflow-hidden">
        <div className={`h-full rounded-pill ${COLORS[color]} transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs text-text-secondary tabular-nums">{pct}%</span>}
    </div>
  );
}