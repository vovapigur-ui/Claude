'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import {
  ChevronLeft,
  Check,
  Bell,
  FileText,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { db, seedIfEmpty } from '@/lib/db';
import type { Deal, Milestone, Party, DocItem, DealStatus, DocStatus, PartyStatus } from '@/lib/db';
import { dealHealth, roleLabel } from '@/lib/scoring';
import { advanceDoc, nudgeParty } from '@/lib/integrations';
import { toast } from '@/components/Toast';
import { HealthRing } from '@/components/HealthRing';
import {
  formatPrice,
  formatDate,
  relativeDateLabel,
  daysUntil,
  cn,
} from '@/lib/utils';

const NEXT_STATUS: Record<DealStatus, DealStatus | null> = {
  offer: 'active',
  active: 'closing',
  closing: 'closed',
  closed: null,
  dead: null,
};
const STATUS_LABEL: Record<DealStatus, string> = {
  offer: 'Under Offer',
  active: 'In Escrow',
  closing: 'Closing',
  closed: 'Closed',
  dead: 'Dead',
};

const DOC_STYLE: Record<DocStatus, string> = {
  draft: 'text-zinc-500',
  sent: 'text-yellow-400',
  signed: 'text-green-400',
};
const PARTY_STYLE: Record<PartyStatus, { dot: string; text: string }> = {
  cleared: { dot: 'bg-green-400', text: 'text-green-400' },
  pending: { dot: 'bg-yellow-400', text: 'text-yellow-400' },
  waiting: { dot: 'bg-zinc-500', text: 'text-zinc-400' },
  blocked: { dot: 'bg-red-400', text: 'text-red-400' },
};

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedIfEmpty().then(() => setReady(true));
  }, []);

  const deal = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.deals.get(id) : undefined),
    [id, ready]
  );
  const milestones = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.milestones.where('dealId').equals(id).toArray() : Promise.resolve([] as Milestone[])),
    [id, ready]
  );
  const parties = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.parties.where('dealId').equals(id).toArray() : Promise.resolve([] as Party[])),
    [id, ready]
  );
  const docs = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.docs.where('dealId').equals(id).toArray() : Promise.resolve([] as DocItem[])),
    [id, ready]
  );

  if (!ready || !milestones || !parties || !docs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest animate-pulse">Loading…</p>
      </div>
    );
  }
  if (!deal) {
    return (
      <div className="min-h-screen p-6">
        <Link href="/pipeline" className="font-mono text-xs text-zinc-500">← Back to pipeline</Link>
        <p className="mt-6 text-zinc-400">Deal not found.</p>
      </div>
    );
  }

  const health = dealHealth(deal, milestones, parties);
  const sorted = [...milestones].sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));
  const closeIn = daysUntil(deal.closingDate);
  const next = NEXT_STATUS[deal.status];

  async function toggleMilestone(m: Milestone) {
    await db.milestones.put({ ...m, done: !m.done });
    toast(m.done ? `↩︎ ${m.label} reopened` : `✓ ${m.label} cleared`);
  }
  async function advanceStatus() {
    if (!next || !deal) return;
    await db.deals.put({ ...deal, status: next });
    toast(`Deal advanced → ${STATUS_LABEL[next]}`);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900">
        <div className="flex items-center gap-3 px-3 py-3">
          <Link href="/pipeline" className="p-1.5 -ml-1 text-zinc-400 active:scale-90 transition-transform">
            <ChevronLeft size={22} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-archivo font-black text-lg leading-tight text-zinc-100 truncate">
              {deal.emoji} {deal.address}
            </p>
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              {STATUS_LABEL[deal.status]} · {formatPrice(deal.price)}
            </p>
          </div>
          <HealthRing score={health.score} level={health.level} size={44} />
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Health banner */}
        <div
          className={cn(
            'rounded-2xl border p-4 mb-5 grid-pattern',
            health.level === 'critical'
              ? 'bg-red-400/[0.05] border-red-400/25'
              : health.level === 'at-risk'
              ? 'bg-yellow-400/[0.05] border-yellow-400/20'
              : 'bg-green-400/[0.04] border-green-400/20'
          )}
        >
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
            {deal.side === 'buy' ? 'Representing Buyer' : 'Representing Seller'} · {deal.clientName}
          </p>
          <p
            className={cn(
              'font-archivo font-bold text-[15px]',
              health.level === 'critical' ? 'text-red-400' : health.level === 'at-risk' ? 'text-yellow-400' : 'text-green-400'
            )}
          >
            {health.reason}
          </p>
          <p className="font-mono text-[11px] text-zinc-500 mt-1">
            {deal.status === 'closed'
              ? `Closed ${relativeDateLabel(deal.closingDate)}`
              : `Closing ${formatDate(deal.closingDate)} · ${closeIn >= 0 ? `${closeIn} days out` : 'overdue'}`}
          </p>
        </div>

        {/* Deadline timeline */}
        <SectionLabel text="Contingency Timeline" />
        <div className="relative mb-6 pl-1">
          {sorted.map((m, i) => {
            const d = daysUntil(m.dueDate);
            const overdue = !m.done && d < 0;
            const looming = !m.done && d >= 0 && d <= 2;
            const dotColor = m.done
              ? 'bg-green-400 border-green-400'
              : overdue
              ? 'bg-red-400 border-red-400'
              : looming
              ? 'bg-yellow-400 border-yellow-400'
              : 'bg-zinc-950 border-zinc-600';
            return (
              <div key={m.id} className="relative flex gap-3 pb-1">
                {/* line */}
                {i < sorted.length - 1 && (
                  <div className="absolute left-[10px] top-6 bottom-0 w-px bg-zinc-800" />
                )}
                <button
                  onClick={() => toggleMilestone(m)}
                  className={cn(
                    'mt-2.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center active:scale-90 transition-transform',
                    dotColor
                  )}
                >
                  {m.done && <Check size={11} strokeWidth={3} className="text-zinc-950" />}
                </button>
                <button
                  onClick={() => toggleMilestone(m)}
                  className={cn(
                    'flex-1 text-left rounded-xl border px-3.5 py-2.5 mb-2 transition-all active:scale-[0.99]',
                    overdue
                      ? 'bg-red-400/[0.05] border-red-400/20'
                      : looming
                      ? 'bg-yellow-400/[0.05] border-yellow-400/15'
                      : 'bg-zinc-900 border-zinc-800'
                  )}
                >
                  <p className={cn('text-sm font-medium', m.done ? 'text-zinc-500 line-through' : 'text-zinc-100')}>
                    {m.label}
                  </p>
                  <p
                    className={cn(
                      'font-mono text-[11px] mt-0.5',
                      overdue ? 'text-red-400' : looming ? 'text-yellow-400' : 'text-zinc-500'
                    )}
                  >
                    {formatDate(m.dueDate)} · {m.done ? 'done' : relativeDateLabel(m.dueDate)}
                    {overdue && ' · OVERDUE'}
                  </p>
                </button>
              </div>
            );
          })}
        </div>

        {/* Parties */}
        <SectionLabel text="Parties" />
        <div className="space-y-2 mb-6">
          {parties.map((p) => {
            const st = PARTY_STYLE[p.status];
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-xl bg-zinc-900 border border-zinc-800 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', st.dot)} />
                    <p className="text-sm text-zinc-100 truncate">{p.name}</p>
                  </div>
                  <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-1 ml-3.5">
                    {roleLabel(p.role)} · <span className={st.text}>{p.status}</span>
                  </p>
                </div>
                <a
                  href={`tel:${p.phone}`}
                  className="flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 h-8 w-8 active:scale-90 transition-transform"
                >
                  <Phone size={13} />
                </a>
                {(p.status === 'blocked' || p.status === 'waiting' || p.status === 'pending') && (
                  <button
                    onClick={async () => toast(await nudgeParty(p))}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 h-8 font-mono text-[11px] uppercase tracking-wider active:scale-95 transition-transform',
                      p.status === 'blocked'
                        ? 'bg-red-400/15 text-red-400 border border-red-400/25'
                        : 'bg-zinc-800 text-zinc-300'
                    )}
                  >
                    <Bell size={12} /> Nudge
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Documents */}
        <SectionLabel text="Documents" />
        <div className="space-y-2 mb-6">
          {docs.length === 0 && <p className="font-mono text-[11px] text-zinc-600">No documents yet.</p>}
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 rounded-xl bg-zinc-900 border border-zinc-800 p-3">
              <FileText size={16} className="text-zinc-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-100 truncate">{doc.label}</p>
                <p className={cn('font-mono text-[10px] uppercase tracking-widest mt-0.5', DOC_STYLE[doc.status])}>
                  {doc.status === 'draft' ? 'Draft' : doc.status === 'sent' ? 'Out for signature' : 'Signed'}
                </p>
              </div>
              {doc.status !== 'signed' && (
                <button
                  onClick={async () => toast(await advanceDoc(doc))}
                  className="rounded-lg bg-yellow-400 text-zinc-950 px-3 h-8 font-mono text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-transform"
                >
                  {doc.status === 'draft' ? 'Send' : 'Mark Signed'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Advance status */}
        {next && (
          <button
            onClick={advanceStatus}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-100 text-zinc-900 py-3.5 font-archivo font-bold text-sm active:scale-[0.99] transition-transform mb-8"
          >
            Advance to {STATUS_LABEL[next]} <ArrowRight size={16} />
          </button>
        )}
        {!next && <div className="h-8" />}
      </div>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">{text}</p>;
}
