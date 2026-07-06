const PALETTE = [
  { bg: 'bg-brand/20', text: 'text-brand' },
  { bg: 'bg-success/20', text: 'text-success' },
  { bg: 'bg-warning/20', text: 'text-warning' },
  { bg: 'bg-info/20', text: 'text-info' },
  { bg: 'bg-danger/20', text: 'text-danger' },
];

function colorForName(name) {
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

export default function Avatar({ name = '', size = 'md', ring = false, className = '' }) {
  const initials = name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const { bg, text } = colorForName(name || 'U');
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-16 h-16 text-lg' };
  return (
    <div className={`rounded-full flex items-center justify-center font-semibold ${bg} ${text} ${sizes[size]} ${ring ? 'ring-2 ring-brand ring-offset-2 ring-offset-bg-base' : ''} ${className}`}>
      {initials}
    </div>
  );
}