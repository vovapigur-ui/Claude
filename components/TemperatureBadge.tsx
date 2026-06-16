import type { Temperature } from '@/lib/scoring';
import { cn } from '@/lib/utils';

const STYLES: Record<Temperature, { dot: string; text: string; bg: string; label: string }> = {
  hot: { dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', label: 'HOT' },
  warm: { dot: 'bg-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', label: 'WARM' },
  cold: { dot: 'bg-sky-400', text: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20', label: 'COLD' },
};

export function TemperatureBadge({ temperature, className }: { temperature: Temperature; className?: string }) {
  const s = STYLES[temperature];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest',
        s.bg,
        s.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}
