import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Deal, Milestone, Party } from '@/lib/db';
import { dealHealth } from '@/lib/scoring';
import { HealthRing } from './HealthRing';
import { formatPrice, relativeDateLabel, daysUntil, cn } from '@/lib/utils';

const SIDE_LABEL = { buy: 'BUYER', sell: 'SELLER' } as const;

export function DealCard({
  deal,
  milestones,
  parties,
}: {
  deal: Deal;
  milestones: Milestone[];
  parties: Party[];
}) {
  const health = dealHealth(deal, milestones, parties);
  const nextMilestone = milestones
    .filter((m) => !m.done)
    .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))[0];
  const closeIn = daysUntil(deal.closingDate);

  return (
    <Link href={`/pipeline/${deal.id}`}>
      <div
        className={cn(
          'rounded-2xl border p-4 transition-all duration-200 active:scale-[0.99]',
          health.level === 'critical'
            ? 'bg-red-400/[0.04] border-red-400/20'
            : 'bg-zinc-900 border-zinc-800'
        )}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-xl shrink-0">
            {deal.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-archivo font-bold text-[15px] text-zinc-100 truncate">{deal.address}</p>
            </div>
            <p className="font-mono text-[11px] text-zinc-500 mt-0.5 truncate">
              {SIDE_LABEL[deal.side]} · {deal.clientName} · {formatPrice(deal.price)}
            </p>
          </div>
          <HealthRing score={health.score} level={health.level} />
          <ChevronRight size={16} className="text-zinc-600 shrink-0 -ml-1" />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-zinc-800/80 pt-3">
          <p
            className={cn(
              'font-mono text-[11px] truncate',
              health.level === 'critical'
                ? 'text-red-400'
                : health.level === 'at-risk'
                ? 'text-yellow-400'
                : 'text-zinc-500'
            )}
          >
            {nextMilestone ? `${nextMilestone.label} · ${relativeDateLabel(nextMilestone.dueDate)}` : health.reason}
          </p>
          {deal.status !== 'closed' && (
            <p className="font-mono text-[11px] text-zinc-500 shrink-0">
              {closeIn >= 0 ? `closes in ${closeIn}d` : 'overdue'}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
