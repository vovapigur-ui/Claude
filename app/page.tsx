'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle, Phone } from 'lucide-react';
import { db, seedIfEmpty } from '@/lib/db';
import type { Deal, Milestone, Party, Contact } from '@/lib/db';
import { dealHealth, rankContacts } from '@/lib/scoring';
import PageHeader from '@/components/PageHeader';
import { DealCard } from '@/components/DealCard';
import { ContactRow } from '@/components/ContactRow';

function emptyArr<T>() {
  return Promise.resolve([] as T[]);
}

export default function TodayPage() {
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
  const contacts = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.contacts.toArray() : emptyArr<Contact>()),
    [ready]
  );

  if (!ready || !deals || !milestones || !parties || !contacts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest animate-pulse">Loading…</p>
      </div>
    );
  }

  const mById = (id: string) => milestones.filter((m) => m.dealId === id);
  const pById = (id: string) => parties.filter((p) => p.dealId === id);

  // Deals needing attention: not closed, sorted by worst health first.
  const attention = deals
    .filter((d) => d.status !== 'closed' && d.status !== 'dead')
    .map((d) => ({ deal: d, health: dealHealth(d, mById(d.id), pById(d.id)) }))
    .filter((x) => x.health.level !== 'on-track')
    .sort((a, b) => a.health.score - b.health.score);

  const activeCount = deals.filter((d) => d.status !== 'closed' && d.status !== 'dead').length;
  const volume = deals
    .filter((d) => d.status !== 'closed' && d.status !== 'dead')
    .reduce((s, d) => s + d.price, 0);

  // Calls to make: top hot/warm contacts.
  const calls = rankContacts(contacts)
    .filter((c) => c._score.temperature !== 'cold')
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <PageHeader
        title="APEX"
        subtitle="Producer OS · Command Center"
        right={
          <div className="text-right">
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Pipeline</p>
            <p className="font-archivo font-black text-xl leading-tight text-yellow-400">
              ${(volume / 1_000_000).toFixed(1)}M
            </p>
          </div>
        }
      />

      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <Stat label="Live Deals" value={String(activeCount)} />
          <Stat label="At Risk" value={String(attention.length)} accent={attention.length > 0} />
          <Stat label="To Call" value={String(calls.length)} />
        </div>

        {/* Deals needing attention */}
        <SectionLabel icon={<AlertTriangle size={13} className="text-red-400" />} text="Deals Needing Attention" />
        <div className="space-y-3 mb-6">
          {attention.length === 0 ? (
            <EmptyNote text="Every deal is on track. 🎯" />
          ) : (
            attention.map(({ deal }) => (
              <DealCard key={deal.id} deal={deal} milestones={mById(deal.id)} parties={pById(deal.id)} />
            ))
          )}
        </div>

        {/* Calls to make */}
        <SectionLabel icon={<Phone size={13} className="text-yellow-400" />} text="Calls To Make Today" />
        <div className="space-y-3 mb-8">
          {calls.length === 0 ? (
            <EmptyNote text="Sphere is quiet — no hot leads today." />
          ) : (
            calls.map((c) => <ContactRow key={c.id} contact={c} />)
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-center">
      <p className={`font-archivo font-black text-2xl leading-none ${accent ? 'text-red-400' : 'text-zinc-100'}`}>
        {value}
      </p>
      <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-1.5">{label}</p>
    </div>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{text}</p>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 text-center">
      <p className="font-mono text-[12px] text-zinc-500">{text}</p>
    </div>
  );
}
