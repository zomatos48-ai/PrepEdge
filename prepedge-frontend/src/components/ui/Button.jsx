const VARIANTS = {
  primary:   'bg-brand text-white hover:bg-brand-hover',
  secondary: 'bg-bg-elevated text-text-primary border border-border-default hover:bg-bg-surfacehover',
  outline:   'bg-transparent text-text-primary border border-border-subtle hover:border-brand hover:text-brand',
  ghost:     'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surfacehover',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}