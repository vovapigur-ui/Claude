'use client';

import Link from 'next/link';
import { Phone, MessageSquare, Send } from 'lucide-react';
import type { Contact } from '@/lib/db';
import { scoreContact } from '@/lib/scoring';
import { sendDraft, logTouch } from '@/lib/integrations';
import { toast } from './Toast';
import { TemperatureBadge } from './TemperatureBadge';
import { relativeDateLabel } from '@/lib/utils';

export function ContactRow({ contact }: { contact: Contact }) {
  const score = scoreContact(contact);

  async function onSend(e: React.MouseEvent) {
    e.preventDefault();
    toast(await sendDraft(contact, 'text'));
  }
  async function onCall(e: React.MouseEvent) {
    e.preventDefault();
    toast(await logTouch(contact, 'call', 'Logged a call'));
  }

  return (
    <Link href={`/sphere/${contact.id}`}>
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 transition-all duration-200 active:scale-[0.99]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-archivo font-bold text-[15px] text-zinc-100 truncate">{contact.name}</p>
            <p className="font-mono text-[11px] text-zinc-500 mt-0.5">
              last touch {relativeDateLabel(contact.lastContact)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <TemperatureBadge temperature={score.temperature} />
            <span className="font-mono text-[10px] text-zinc-500">{score.moveLikelihood}% move</span>
          </div>
        </div>

        <p className="mt-2.5 text-[12px] leading-snug text-zinc-400">
          <span className="text-zinc-600">▸ </span>
          {score.reason}
        </p>

        <div className="mt-3 flex gap-2">
          <button
            onClick={onSend}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-yellow-400 text-zinc-950 py-2 font-mono text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-transform"
          >
            <Send size={13} /> Send Draft
          </button>
          <button
            onClick={onCall}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800 text-zinc-300 px-3 py-2 font-mono text-[11px] uppercase tracking-wider active:scale-95 transition-transform"
          >
            <Phone size={13} /> Call
          </button>
          <a
            href={`sms:${contact.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 px-3 py-2 active:scale-95 transition-transform"
          >
            <MessageSquare size={13} />
          </a>
        </div>
      </div>
    </Link>
  );
}
