'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedIfEmpty } from '@/lib/db';
import type { Deal, Milestone, Party, DealStatus } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import { DealCard } from '@/components/DealCard';

function emptyArr<T>() {
  return Promise.resolve([] as T[]);
}

const COLUMNS: { status: DealStatus; label: string }[] = [
  { status: 'offer', label: 'Under Offer' },
  { status: 'active', label: 'In Escrow' },
  { status: 'closing', label: 'Closing' },
  { status: 'closed', label: 'Closed' },
];

export default function PipelinePage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedIfEmpty().then(() => setReady(true));
  }, []);

  const deals = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.deals.toArray() : emptyArr<Deal>()),
    [ready]
  );
  const milestones = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.milestones.toArray() : emptyArr<Milestone>()),
    [ready]
  );
  const parties = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.parties.toArray() : emptyArr<Party>()),
    [ready]
  );

  if (!ready || !deals || !milestones || !parties) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest animate-pulse">Loading…</p>
      </div>
    );
  }

  const mById = (id: string) => milestones.filter((m) => m.dealId === id);
  const pById = (id: string) => parties.filter((p) => p.dealId === id);
  const live = deals.filter((d) => d.status !== 'closed' && d.status !== 'dead');
  const volume = live.reduce((s, d) => s + d.price, 0);

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Pipeline"
        subtitle={`${live.length} live deals · ${formatPrice(volume)} in play`}
      />

      <div className="px-4 pt-4 space-y-6">
        {COLUMNS.map(({ status, label }) => {
          const group = deals.filter((d) => d.status === status);
          if (group.length === 0) return null;
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{label}</p>
                <span className="font-mono text-[10px] text-zinc-600">{group.length}</span>
                <div className="flex-1 h-px bg-zinc-900" />
              </div>
              <div className="space-y-3">
                {group.map((deal) => (
                  <DealCard key={deal.id} deal={deal} milestones={mById(deal.id)} parties={pById(deal.id)} />
                ))}
              </div>
            </div>
          );
        })}
        <div className="h-4" />
      </div>
    </div>
  );
}
