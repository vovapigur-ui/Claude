import type { Deal, Milestone, Party, DocItem, Contact, Touch } from './db';
import { addDaysToDate, todayStr } from './utils';

// All dates are generated relative to "today" so the demo always looks live.
const T = () => todayStr();
const rel = (n: number) => addDaysToDate(T(), n);

export const SEED_DEALS = (): Deal[] => [
  {
    id: 'd1',
    address: '418 Sea Cliff Ave',
    nickname: 'Sea Cliff',
    emoji: '🌊',
    clientName: 'The Hendricks',
    side: 'sell',
    price: 2_450_000,
    status: 'closing',
    acceptedDate: rel(-24),
    closingDate: rel(4),
  },
  {
    id: 'd2',
    address: '77 Maple Ridge Ct',
    nickname: 'Maple Ridge',
    emoji: '🍁',
    clientName: 'Priya & Sam Rao',
    side: 'buy',
    price: 875_000,
    status: 'active',
    acceptedDate: rel(-9),
    closingDate: rel(21),
  },
  {
    id: 'd3',
    address: '1204 Brookline Dr',
    nickname: 'Brookline',
    emoji: '🏡',
    clientName: 'Marcus Webb',
    side: 'sell',
    price: 615_000,
    status: 'active',
    acceptedDate: rel(-5),
    closingDate: rel(25),
  },
  {
    id: 'd4',
    address: '9 Harborview Penthouse',
    nickname: 'Harborview',
    emoji: '🌆',
    clientName: 'Elena Sokolova',
    side: 'buy',
    price: 3_100_000,
    status: 'offer',
    acceptedDate: rel(-1),
    closingDate: rel(38),
  },
  {
    id: 'd5',
    address: '330 Aspen Grove Ln',
    nickname: 'Aspen Grove',
    emoji: '🌲',
    clientName: 'The Delgados',
    side: 'sell',
    price: 1_180_000,
    status: 'closed',
    acceptedDate: rel(-46),
    closingDate: rel(-3),
  },
];

export const SEED_MILESTONES = (): Milestone[] => [
  // d1 — Sea Cliff (closing soon, mostly done)
  { id: 'm1', dealId: 'd1', kind: 'inspection', label: 'Inspection contingency', dueDate: rel(-17), done: true },
  { id: 'm2', dealId: 'd1', kind: 'appraisal', label: 'Appraisal complete', dueDate: rel(-10), done: true },
  { id: 'm3', dealId: 'd1', kind: 'loan', label: 'Loan contingency removed', dueDate: rel(-2), done: false }, // overdue!
  { id: 'm4', dealId: 'd1', kind: 'walkthrough', label: 'Final walkthrough', dueDate: rel(3), done: false },
  { id: 'm5', dealId: 'd1', kind: 'closing', label: 'Close of escrow', dueDate: rel(4), done: false },
  // d2 — Maple Ridge (active, healthy)
  { id: 'm6', dealId: 'd2', kind: 'inspection', label: 'Inspection contingency', dueDate: rel(2), done: false },
  { id: 'm7', dealId: 'd2', kind: 'appraisal', label: 'Appraisal ordered', dueDate: rel(8), done: false },
  { id: 'm8', dealId: 'd2', kind: 'loan', label: 'Loan contingency', dueDate: rel(16), done: false },
  { id: 'm9', dealId: 'd2', kind: 'closing', label: 'Close of escrow', dueDate: rel(21), done: false },
  // d3 — Brookline (active, early)
  { id: 'm10', dealId: 'd3', kind: 'inspection', label: 'Buyer inspection', dueDate: rel(1), done: false }, // looming
  { id: 'm11', dealId: 'd3', kind: 'appraisal', label: 'Appraisal', dueDate: rel(12), done: false },
  { id: 'm12', dealId: 'd3', kind: 'title', label: 'Title / disclosures', dueDate: rel(7), done: false },
  { id: 'm13', dealId: 'd3', kind: 'closing', label: 'Close of escrow', dueDate: rel(25), done: false },
  // d4 — Harborview (just accepted)
  { id: 'm14', dealId: 'd4', kind: 'inspection', label: 'Inspection contingency', dueDate: rel(9), done: false },
  { id: 'm15', dealId: 'd4', kind: 'loan', label: 'Loan contingency', dueDate: rel(24), done: false },
  { id: 'm16', dealId: 'd4', kind: 'closing', label: 'Close of escrow', dueDate: rel(38), done: false },
  // d5 — Aspen Grove (closed)
  { id: 'm17', dealId: 'd5', kind: 'closing', label: 'Close of escrow', dueDate: rel(-3), done: true },
];

export const SEED_PARTIES = (): Party[] => [
  // d1
  { id: 'p1', dealId: 'd1', role: 'lender', name: 'Tom Asher · Summit Mortgage', phone: '415-555-0142', email: 'tasher@summitmtg.com', status: 'blocked' },
  { id: 'p2', dealId: 'd1', role: 'title', name: 'Coastal Title Co.', phone: '415-555-0190', email: 'orders@coastaltitle.com', status: 'cleared' },
  { id: 'p3', dealId: 'd1', role: 'client', name: 'The Hendricks', phone: '415-555-0110', email: 'hendricks@email.com', status: 'pending' },
  // d2
  { id: 'p4', dealId: 'd2', role: 'lender', name: 'Dana Liu · Bay Credit Union', phone: '510-555-0177', email: 'dliu@baycu.com', status: 'pending' },
  { id: 'p5', dealId: 'd2', role: 'inspector', name: 'PineState Inspections', phone: '510-555-0123', email: 'book@pinestate.com', status: 'waiting' },
  { id: 'p6', dealId: 'd2', role: 'coAgent', name: 'Rita Flores (listing side)', phone: '510-555-0166', email: 'rita@floresrealty.com', status: 'cleared' },
  // d3
  { id: 'p7', dealId: 'd3', role: 'inspector', name: 'HomeGuard Inspections', phone: '408-555-0144', email: 'sched@homeguard.com', status: 'waiting' },
  { id: 'p8', dealId: 'd3', role: 'title', name: 'Valley Title', phone: '408-555-0188', email: 'ops@valleytitle.com', status: 'pending' },
  // d4
  { id: 'p9', dealId: 'd4', role: 'lender', name: 'Private Wealth Lending', phone: '415-555-0201', email: 'desk@pwlending.com', status: 'waiting' },
  { id: 'p10', dealId: 'd4', role: 'coAgent', name: 'Jordan Pike (listing side)', phone: '415-555-0233', email: 'jordan@pikegroup.com', status: 'pending' },
];

export const SEED_DOCS = (): DocItem[] => [
  { id: 'doc1', dealId: 'd1', label: 'Loan contingency removal', status: 'draft' },
  { id: 'doc2', dealId: 'd1', label: 'Final walkthrough acknowledgment', status: 'draft' },
  { id: 'doc3', dealId: 'd2', label: 'Purchase agreement', status: 'signed' },
  { id: 'doc4', dealId: 'd2', label: 'Inspection contingency addendum', status: 'sent' },
  { id: 'doc5', dealId: 'd3', label: 'Listing disclosures packet', status: 'sent' },
  { id: 'doc6', dealId: 'd4', label: 'Purchase agreement', status: 'draft' },
];

// Contacts span the full temperature range via varied signals + recency.
export const SEED_CONTACTS = (): Contact[] => [
  {
    id: 'c1', name: 'Jenna & Paul Okafor', relationship: 'past-client',
    phone: '415-555-0301', email: 'okafors@email.com',
    lastContact: rel(-94), homeAnniversary: rel(-2555), timeInHomeYrs: 7,
    lifeEventSignal: 'Second baby announced on Instagram — likely outgrowing the 2BR',
    notes: 'Bought the Elm St condo in 2019. Always refer friends.',
    draftedMessage: "Hi Jenna — saw the wonderful news, congrats! 🎉 With the family growing, a lot of my clients in your spot start wondering if the condo still fits. No pressure at all — want me to pull what your place could fetch today? You've built serious equity.",
  },
  {
    id: 'c2', name: 'Marcus Webb', relationship: 'past-client',
    phone: '408-555-0144', email: 'mwebb@email.com',
    lastContact: rel(-5), homeAnniversary: rel(-1100), timeInHomeYrs: 3,
    lifeEventSignal: 'Currently listing with you (Brookline) — active client',
    notes: 'Relocating for work. Repeat client #2.',
    draftedMessage: 'Hey Marcus — quick check-in on Brookline, inspection is set. Anything you need from me before then?',
  },
  {
    id: 'c3', name: 'The Hendricks', relationship: 'past-client',
    phone: '415-555-0110', email: 'hendricks@email.com',
    lastContact: rel(-3), homeAnniversary: rel(-3650), timeInHomeYrs: 10,
    lifeEventSignal: 'Selling Sea Cliff now — closing this week',
    notes: 'Long-time clients, downsizing.',
    draftedMessage: 'Almost there! Walkthrough is scheduled — I\'ll be there with you. Excited to hand over the keys to the next chapter.',
  },
  {
    id: 'c4', name: 'Sophia Tran', relationship: 'sphere',
    phone: '650-555-0411', email: 'sophia.tran@email.com',
    lastContact: rel(-210), homeAnniversary: rel(-2920), timeInHomeYrs: 8,
    lifeEventSignal: 'LinkedIn shows new VP role in Austin — possible relocation',
    notes: 'Met at the Lawson dinner party. Owns in Sunnyvale.',
    draftedMessage: "Sophia — congrats on the VP role, huge! If Austin's in the cards and you're weighing what to do with the Sunnyvale place, I can map out sell vs. rent numbers whenever. No rush.",
  },
  {
    id: 'c5', name: 'David & Lin Cho', relationship: 'referral',
    phone: '415-555-0522', email: 'chofamily@email.com',
    lastContact: rel(-12), homeAnniversary: null, timeInHomeYrs: 0,
    lifeEventSignal: 'Referred by the Hendricks — pre-approved, touring this month',
    notes: 'Hot buyer lead. Pre-approved to $1.4M.',
    draftedMessage: 'Hi David & Lin — lined up three homes that fit your list for Saturday. Want me to send the tour itinerary?',
  },
  {
    id: 'c6', name: 'Grace Bellamy', relationship: 'past-client',
    phone: '415-555-0633', email: 'grace.b@email.com',
    lastContact: rel(-365), homeAnniversary: rel(-365), timeInHomeYrs: 1,
    lifeEventSignal: 'One-year home anniversary today 🎉',
    notes: 'First-time buyer, very appreciative.',
    draftedMessage: "Happy one-year home-iversary, Grace! 🏡 Hard to believe it's been a year. Hope the place still feels like home — here's your annual equity snapshot as a little gift.",
  },
  {
    id: 'c7', name: 'The Delgados', relationship: 'past-client',
    phone: '415-555-0744', email: 'delgados@email.com',
    lastContact: rel(-3), homeAnniversary: null, timeInHomeYrs: 0,
    lifeEventSignal: 'Just closed Aspen Grove — ask for a review + referrals',
    notes: 'Just sold. Thrilled with outcome.',
    draftedMessage: "It was a joy working with you both! If you have 60 seconds, a quick Google review means the world. And if any friends are thinking of making a move, you know where to find me 🙏",
  },
  {
    id: 'c8', name: 'Omar Haddad', relationship: 'sphere',
    phone: '650-555-0855', email: 'omar.h@email.com',
    lastContact: rel(-140), homeAnniversary: rel(-2200), timeInHomeYrs: 6,
    lifeEventSignal: null,
    notes: 'Gym friend. Owns a duplex, mentioned investing more.',
    draftedMessage: "Omar — saw a small multi-family hit the market that screams your name. Want me to forward it before it's public?",
  },
  {
    id: 'c9', name: 'Rebecca Stahl', relationship: 'lead',
    phone: '415-555-0966', email: 'r.stahl@email.com',
    lastContact: rel(-2), homeAnniversary: null, timeInHomeYrs: 0,
    lifeEventSignal: 'Open house sign-in at Maple Ridge — actively looking',
    notes: 'Open house lead. Renting now, lease ends soon.',
    draftedMessage: "Hi Rebecca — great meeting you at the Maple Ridge open house! You mentioned your lease is up in the spring. Want me to set you up with new listings that match before they hit the big sites?",
  },
  {
    id: 'c10', name: 'The Nakamuras', relationship: 'past-client',
    phone: '408-555-0177', email: 'nakamura@email.com',
    lastContact: rel(-420), homeAnniversary: rel(-2555), timeInHomeYrs: 7,
    lifeEventSignal: 'Time-in-home hit the 7-year average move window',
    notes: 'Quiet clients, but loyal. Two kids near college age.',
    draftedMessage: "Hi! It's been a while — just thinking of you. Homes in your neighborhood have appreciated a lot lately. Curious what yours is worth now? Happy to send a no-obligation estimate.",
  },
  {
    id: 'c11', name: 'Chris Okonkwo', relationship: 'referral',
    phone: '510-555-0288', email: 'c.okonkwo@email.com',
    lastContact: rel(-30), homeAnniversary: null, timeInHomeYrs: 0,
    lifeEventSignal: 'Referred by Sophia Tran — exploring first purchase',
    notes: 'Early in the journey, needs nurturing.',
    draftedMessage: "Hey Chris — no rush on anything, but I put together a simple first-buyer roadmap. Want me to send it over so you know what to expect?",
  },
  {
    id: 'c12', name: 'Patricia & Joe Lund', relationship: 'sphere',
    phone: '650-555-0399', email: 'lunds@email.com',
    lastContact: rel(-280), homeAnniversary: rel(-1825), timeInHomeYrs: 5,
    lifeEventSignal: null,
    notes: 'Neighbors of past clients. Friendly but no signal yet.',
    draftedMessage: "Hi Patricia & Joe — hope you're doing well! Just checking in. If you ever want a read on the market in your pocket of the neighborhood, I'm a text away.",
  },
];

export const SEED_TOUCHES = (): Touch[] => [
  { id: 't1', contactId: 'c2', date: rel(-5), type: 'call', summary: 'Discussed Brookline listing strategy' },
  { id: 't2', contactId: 'c3', date: rel(-3), type: 'text', summary: 'Confirmed walkthrough timing' },
  { id: 't3', contactId: 'c5', date: rel(-12), type: 'email', summary: 'Sent pre-approval checklist' },
  { id: 't4', contactId: 'c7', date: rel(-3), type: 'call', summary: 'Celebrated closing, mentioned reviews' },
  { id: 't5', contactId: 'c9', date: rel(-2), type: 'note', summary: 'Met at Maple Ridge open house' },
  { id: 't6', contactId: 'c1', date: rel(-94), type: 'email', summary: 'Holiday card follow-up' },
];
