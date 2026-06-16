import Dexie, { type Table } from 'dexie';
import { SEED_DEALS, SEED_MILESTONES, SEED_PARTIES, SEED_DOCS, SEED_CONTACTS, SEED_TOUCHES } from './seed-data';

// ── Deal War Room ─────────────────────────────────────────────
export type DealStatus = 'offer' | 'active' | 'closing' | 'closed' | 'dead';
export type DealSide = 'buy' | 'sell';

export interface Deal {
  id: string;
  address: string;
  nickname: string;
  emoji: string;
  clientName: string;
  side: DealSide;
  price: number;
  status: DealStatus;
  acceptedDate: string;
  closingDate: string;
}

export type MilestoneKind =
  | 'inspection'
  | 'appraisal'
  | 'loan'
  | 'title'
  | 'walkthrough'
  | 'closing'
  | 'custom';

export interface Milestone {
  id: string;
  dealId: string;
  label: string;
  dueDate: string;
  done: boolean;
  kind: MilestoneKind;
}

export type PartyRole = 'lender' | 'title' | 'inspector' | 'coAgent' | 'client';
export type PartyStatus = 'waiting' | 'pending' | 'cleared' | 'blocked';

export interface Party {
  id: string;
  dealId: string;
  role: PartyRole;
  name: string;
  phone: string;
  email: string;
  status: PartyStatus;
}

export type DocStatus = 'draft' | 'sent' | 'signed';

export interface DocItem {
  id: string;
  dealId: string;
  label: string;
  status: DocStatus;
}

// ── Sphere Pulse ──────────────────────────────────────────────
export type Relationship = 'past-client' | 'sphere' | 'lead' | 'referral';

export interface Contact {
  id: string;
  name: string;
  relationship: Relationship;
  phone: string;
  email: string;
  lastContact: string; // YYYY-MM-DD
  homeAnniversary: string | null;
  timeInHomeYrs: number;
  lifeEventSignal: string | null;
  notes: string;
  draftedMessage: string;
}

export type TouchType = 'call' | 'text' | 'email' | 'note';

export interface Touch {
  id: string;
  contactId: string;
  date: string;
  type: TouchType;
  summary: string;
}

class ApexDB extends Dexie {
  deals!: Table<Deal, string>;
  milestones!: Table<Milestone, string>;
  parties!: Table<Party, string>;
  docs!: Table<DocItem, string>;
  contacts!: Table<Contact, string>;
  touches!: Table<Touch, string>;

  constructor() {
    super('ApexDB');
    this.version(1).stores({
      deals: 'id, status',
      milestones: 'id, dealId',
      parties: 'id, dealId',
      docs: 'id, dealId',
      contacts: 'id, relationship',
      touches: 'id, contactId',
    });
  }
}

// Dexie's constructor is safe in Node.js — it doesn't access indexedDB
// until an actual operation is run. The typeof window guard in useLiveQuery
// query functions prevents any operations from running server-side.
let _db: ApexDB | null = null;

function getDB(): ApexDB {
  if (!_db) _db = new ApexDB();
  return _db;
}

export const db: ApexDB =
  typeof window !== 'undefined' ? getDB() : ({} as ApexDB);

export async function seedIfEmpty(): Promise<void> {
  if (typeof window === 'undefined') return;
  const d = getDB();
  const count = await d.deals.count();
  if (count > 0) return;
  await d.transaction('rw', [d.deals, d.milestones, d.parties, d.docs, d.contacts, d.touches], async () => {
    await d.deals.bulkPut(SEED_DEALS());
    await d.milestones.bulkPut(SEED_MILESTONES());
    await d.parties.bulkPut(SEED_PARTIES());
    await d.docs.bulkPut(SEED_DOCS());
    await d.contacts.bulkPut(SEED_CONTACTS());
    await d.touches.bulkPut(SEED_TOUCHES());
  });
}

export async function resetDemoData(): Promise<void> {
  if (typeof window === 'undefined') return;
  const d = getDB();
  await d.transaction('rw', [d.deals, d.milestones, d.parties, d.docs, d.contacts, d.touches], async () => {
    await Promise.all([
      d.deals.clear(),
      d.milestones.clear(),
      d.parties.clear(),
      d.docs.clear(),
      d.contacts.clear(),
      d.touches.clear(),
    ]);
    await d.deals.bulkPut(SEED_DEALS());
    await d.milestones.bulkPut(SEED_MILESTONES());
    await d.parties.bulkPut(SEED_PARTIES());
    await d.docs.bulkPut(SEED_DOCS());
    await d.contacts.bulkPut(SEED_CONTACTS());
    await d.touches.bulkPut(SEED_TOUCHES());
  });
}
