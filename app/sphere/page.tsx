'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedIfEmpty } from '@/lib/db';
import type { Contact } from '@/lib/db';
import { rankContacts, type Temperature } from '@/lib/scoring';
import PageHeader from '@/components/PageHeader';
import { ContactRow } from '@/components/ContactRow';
import { cn } from '@/lib/utils';

function emptyArr<T>() {
  return Promise.resolve([] as T[]);
}

type Filter = 'all' | Temperature;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'hot', label: 'Hot' },
  { key: 'warm', label: 'Warm' },
  { key: 'cold', label: 'Cold' },
];

export default function SpherePage() {
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    seedIfEmpty().then(() => setReady(true));
  }, []);

  const contacts = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.contacts.toArray() : emptyArr<Contact>()),
    [ready]
  );

  if (!ready || !contacts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest animate-pulse">Loading…</p>
      </div>
    );
  }

  const ranked = rankContacts(contacts);
  const counts = {
    hot: ranked.filter((c) => c._score.temperature === 'hot').length,
    warm: ranked.filter((c) => c._score.temperature === 'warm').length,
    cold: ranked.filter((c) => c._score.temperature === 'cold').length,
  };
  const visible = filter === 'all' ? ranked : ranked.filter((c) => c._score.temperature === filter);

  return (
    <div className="min-h-screen">
      <PageHeader title="Sphere Pulse" subtitle={`${contacts.length} relationships tracked`} />

      <div className="px-4 pt-4">
        {/* Heat summary */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <HeatStat label="Hot" value={counts.hot} color="text-red-400" />
          <HeatStat label="Warm" value={counts.warm} color="text-yellow-400" />
          <HeatStat label="Cold" value={counts.cold} color="text-sky-400" />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors',
                filter === f.key
                  ? 'bg-zinc-100 text-zinc-900 font-bold'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 pb-8">
          {visible.map((c) => (
            <ContactRow key={c.id} contact={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeatStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-center">
      <p className={`font-archivo font-black text-2xl leading-none ${color}`}>{value}</p>
      <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-1.5">{label}</p>
    </div>
  );
}
