'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { ChevronLeft, Send, Phone, Sparkles, Clock } from 'lucide-react';
import { db, seedIfEmpty } from '@/lib/db';
import type { Contact, Touch } from '@/lib/db';
import { scoreContact } from '@/lib/scoring';
import { sendDraft, logTouch } from '@/lib/integrations';
import { toast } from '@/components/Toast';
import { TemperatureBadge } from '@/components/TemperatureBadge';
import { formatDate, relativeDateLabel, cn } from '@/lib/utils';

const REL_LABEL: Record<Contact['relationship'], string> = {
  'past-client': 'Past Client',
  sphere: 'Sphere',
  lead: 'Lead',
  referral: 'Referral',
};

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    seedIfEmpty().then(() => setReady(true));
  }, []);

  const contact = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.contacts.get(id) : undefined),
    [id, ready]
  );
  const touches = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.touches.where('contactId').equals(id).toArray() : Promise.resolve([] as Touch[])),
    [id, ready]
  );

  useEffect(() => {
    if (contact && !draftLoaded) {
      setDraft(contact.draftedMessage);
      setDraftLoaded(true);
    }
  }, [contact, draftLoaded]);

  if (!ready || !touches) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest animate-pulse">Loading…</p>
      </div>
    );
  }
  if (!contact) {
    return (
      <div className="min-h-screen p-6">
        <Link href="/sphere" className="font-mono text-xs text-zinc-500">← Back to sphere</Link>
        <p className="mt-6 text-zinc-400">Contact not found.</p>
      </div>
    );
  }

  const score = scoreContact(contact);
  const history = [...touches].sort((a, b) => (a.date < b.date ? 1 : -1));

  async function persistDraft() {
    if (contact && draft !== contact.draftedMessage) {
      await db.contacts.put({ ...contact, draftedMessage: draft });
    }
  }
  async function onSend() {
    if (!contact) return;
    await persistDraft();
    toast(await sendDraft({ ...contact, draftedMessage: draft }, 'text'));
  }
  async function onCall() {
    if (!contact) return;
    toast(await logTouch(contact, 'call', 'Logged a call'));
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900">
        <div className="flex items-center gap-3 px-3 py-3">
          <Link href="/sphere" className="p-1.5 -ml-1 text-zinc-400 active:scale-90 transition-transform">
            <ChevronLeft size={22} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-archivo font-black text-lg leading-tight text-zinc-100 truncate">{contact.name}</p>
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              {REL_LABEL[contact.relationship]}
            </p>
          </div>
          <TemperatureBadge temperature={score.temperature} />
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Move likelihood */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-4 grid-pattern">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Move Likelihood</p>
            <p className="font-archivo font-black text-2xl text-yellow-400 leading-none">{score.moveLikelihood}%</p>
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                score.temperature === 'hot' ? 'bg-red-400' : score.temperature === 'warm' ? 'bg-yellow-400' : 'bg-sky-400'
              )}
              style={{ width: `${score.moveLikelihood}%` }}
            />
          </div>
        </div>

        {/* Signal */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={13} className="text-yellow-400" />
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Why Now</p>
          </div>
          <p className="text-sm text-zinc-200 leading-snug">{score.reason}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-zinc-500">
            <span>In home: {contact.timeInHomeYrs}yr</span>
            <span>Last touch: {relativeDateLabel(contact.lastContact)}</span>
            {contact.homeAnniversary && <span>Anniv: {formatDate(contact.homeAnniversary)}</span>}
          </div>
          {contact.notes && <p className="mt-3 text-[12px] text-zinc-500 italic">“{contact.notes}”</p>}
        </div>

        {/* Drafted message */}
        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Pre-Drafted Message</p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={persistDraft}
          rows={5}
          className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 p-4 text-sm text-zinc-200 leading-snug focus:border-yellow-400 focus:outline-none resize-none mb-3"
        />
        <div className="flex gap-2 mb-6">
          <button
            onClick={onSend}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 text-zinc-950 py-3 font-archivo font-bold text-sm active:scale-[0.99] transition-transform"
          >
            <Send size={15} /> Send Message
          </button>
          <button
            onClick={onCall}
            className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-800 text-zinc-200 px-5 py-3 font-archivo font-bold text-sm active:scale-95 transition-transform"
          >
            <Phone size={15} /> Log Call
          </button>
        </div>

        {/* Touch history */}
        <div className="flex items-center gap-2 mb-3">
          <Clock size={13} className="text-zinc-500" />
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Touch History</p>
        </div>
        <div className="space-y-2 pb-8">
          {history.length === 0 && <p className="font-mono text-[11px] text-zinc-600">No touches logged yet.</p>}
          {history.map((t) => (
            <div key={t.id} className="flex items-start gap-3 rounded-xl bg-zinc-900 border border-zinc-800 p-3">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest pt-0.5 w-12 shrink-0">
                {t.type}
              </span>
              <p className="flex-1 text-[13px] text-zinc-300 leading-snug">{t.summary}</p>
              <span className="font-mono text-[10px] text-zinc-600 shrink-0">{formatDate(t.date)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
