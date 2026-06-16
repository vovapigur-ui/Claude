import { db } from './db';
import type { DocItem, Party, Contact } from './db';
import { todayStr } from './utils';
import { roleLabel } from './scoring';

/**
 * Mock integration layer. NOTHING here touches the network — every function
 * mutates local Dexie state and returns a friendly toast string, simulating
 * what a wired-up DocuSign / Twilio / Gmail integration would do.
 */

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/** Advance a doc draft → sent → signed, like a DocuSign envelope round-trip. */
export async function advanceDoc(doc: DocItem): Promise<string> {
  const next: DocItem['status'] =
    doc.status === 'draft' ? 'sent' : doc.status === 'sent' ? 'signed' : 'signed';
  await db.docs.put({ ...doc, status: next });
  if (next === 'sent') return `📤 DocuSign envelope sent — “${doc.label}”`;
  return `✅ “${doc.label}” signed by all parties`;
}

/** Nudge a party via simulated SMS + email; bumps them out of a stuck state. */
export async function nudgeParty(party: Party): Promise<string> {
  const next: Party['status'] =
    party.status === 'blocked' ? 'pending' : party.status === 'waiting' ? 'pending' : party.status;
  await db.parties.put({ ...party, status: next });
  return `💬 Reminder texted to ${roleLabel(party.role)} · ${party.name.split(' · ')[0]}`;
}

/** Send the pre-drafted message and log the touch (Twilio/Gmail style). */
export async function sendDraft(contact: Contact, channel: 'text' | 'email' = 'text'): Promise<string> {
  const today = todayStr();
  await db.touches.put({
    id: genId('t'),
    contactId: contact.id,
    date: today,
    type: channel,
    summary: `Sent: “${contact.draftedMessage.slice(0, 48)}…”`,
  });
  await db.contacts.put({ ...contact, lastContact: today });
  return channel === 'text'
    ? `✉️ Message sent to ${contact.name.split(' ')[0]} — follow-up logged`
    : `📧 Email sent to ${contact.name.split(' ')[0]} — follow-up logged`;
}

/** Log a manual call/note touch and refresh recency. */
export async function logTouch(
  contact: Contact,
  type: 'call' | 'note',
  summary: string
): Promise<string> {
  const today = todayStr();
  await db.touches.put({
    id: genId('t'),
    contactId: contact.id,
    date: today,
    type,
    summary,
  });
  await db.contacts.put({ ...contact, lastContact: today });
  return type === 'call' ? `📞 Call logged with ${contact.name.split(' ')[0]}` : `📝 Note saved`;
}
