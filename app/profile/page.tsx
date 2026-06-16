'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { RotateCcw, Briefcase, Users, TrendingUp } from 'lucide-react';
import { db, seedIfEmpty, resetDemoData } from '@/lib/db';
import type { Deal, Contact } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';

function emptyArr<T>() {
  return Promise.resolve([] as T[]);
}

export default function ProfilePage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedIfEmpty().then(() => setReady(true));
  }, []);

  const deals = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.deals.toArray() : emptyArr<Deal>()),
    [ready]
  );
  const contacts = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.contacts.toArray() : emptyArr<Contact>()),
    [ready]
  );

  const live = (deals ?? []).filter((d) => d.status !== 'closed' && d.status !== 'dead');
  const closedVolume = (deals ?? [])
    .filter((d) => d.status === 'closed')
    .reduce((s, d) => s + d.price, 0);
  const liveVolume = live.reduce((s, d) => s + d.price, 0);

  async function onReset() {
    await resetDemoData();
    toast('🔄 Demo data reset');
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Profile" subtitle="Agent · APEX Producer OS" />

      <div className="px-4 pt-5">
        {/* Agent card */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 mb-5 grid-pattern">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-yellow-400 flex items-center justify-center font-archivo font-black text-2xl text-zinc-950">
              A
            </div>
            <div>
              <p className="font-archivo font-black text-xl text-zinc-100 leading-tight">Alex Morgan</p>
              <p className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest mt-0.5">
                Top Producer · Bay Area
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <ProfileStat icon={<Briefcase size={15} />} label="Live Pipeline" value={formatPrice(liveVolume)} />
          <ProfileStat icon={<TrendingUp size={15} />} label="Closed Volume" value={formatPrice(closedVolume)} />
          <ProfileStat icon={<Briefcase size={15} />} label="Active Deals" value={String(live.length)} />
          <ProfileStat icon={<Users size={15} />} label="Relationships" value={String((contacts ?? []).length)} />
        </div>

        <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mt-6 mb-3">Demo</p>
        <button
          onClick={onReset}
          disabled={!ready}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 py-3.5 font-mono text-[12px] uppercase tracking-wider active:scale-[0.99] transition-transform disabled:opacity-40"
        >
          <RotateCcw size={15} /> Reset Demo Data
        </button>
        <p className="text-center font-mono text-[10px] text-zinc-600 mt-3 leading-relaxed px-4">
          Prototype · all data is local to this device. Integrations (DocuSign · Twilio · Gmail)
          are simulated — nothing is actually sent.
        </p>
        <div className="h-8" />
      </div>
    </div>
  );
}

function ProfileStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <div className="flex items-center gap-1.5 text-zinc-500 mb-2">{icon}</div>
      <p className="font-archivo font-black text-xl text-zinc-100 leading-none">{value}</p>
      <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-1.5">{label}</p>
    </div>
  );
}
