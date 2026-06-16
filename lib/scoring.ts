import type { Deal, Milestone, Party, Contact } from './db';
import { daysUntil, daysSince } from './utils';

// ── Deal health ───────────────────────────────────────────────
export type DealHealthLevel = 'on-track' | 'at-risk' | 'critical';

export interface DealHealth {
  score: number; // 0-100
  level: DealHealthLevel;
  reason: string;
}

/**
 * Health blends open milestones (overdue / looming) and blocked parties.
 * Deterministic and explainable — `reason` is shown to the agent.
 */
export function dealHealth(
  deal: Deal,
  milestones: Milestone[],
  parties: Party[] = []
): DealHealth {
  if (deal.status === 'closed') {
    return { score: 100, level: 'on-track', reason: 'Closed — congratulations' };
  }

  const open = milestones.filter((m) => !m.done);
  const overdue = open.filter((m) => daysUntil(m.dueDate) < 0);
  const looming = open.filter((m) => {
    const d = daysUntil(m.dueDate);
    return d >= 0 && d <= 2;
  });
  const blocked = parties.filter((p) => p.status === 'blocked');

  let score = 100;
  score -= overdue.length * 35;
  score -= looming.length * 12;
  score -= blocked.length * 20;
  score = Math.max(0, Math.min(100, score));

  let level: DealHealthLevel = 'on-track';
  if (overdue.length > 0 || blocked.length > 0 || score < 50) level = 'critical';
  else if (looming.length > 0 || score < 80) level = 'at-risk';

  let reason: string;
  if (overdue.length > 0) {
    reason = `${overdue[0].label} is ${-daysUntil(overdue[0].dueDate)}d overdue`;
  } else if (blocked.length > 0) {
    reason = `${roleLabel(blocked[0].role)} is blocking progress`;
  } else if (looming.length > 0) {
    reason = `${looming[0].label} due ${daysUntil(looming[0].dueDate) === 0 ? 'today' : 'in ' + daysUntil(looming[0].dueDate) + 'd'}`;
  } else {
    reason = 'All contingencies on schedule';
  }

  return { score, level, reason };
}

export function roleLabel(role: Party['role']): string {
  return {
    lender: 'Lender',
    title: 'Title',
    inspector: 'Inspector',
    coAgent: 'Co-agent',
    client: 'Client',
  }[role];
}

// ── Contact temperature & move likelihood ─────────────────────
export type Temperature = 'hot' | 'warm' | 'cold';

export interface ContactScore {
  temperature: Temperature;
  moveLikelihood: number; // 0-100
  reason: string;
}

/**
 * Move likelihood combines an explicit life-event signal, the 7-year
 * time-in-home "move sweet spot," and how stale the relationship is.
 */
export function scoreContact(c: Contact): ContactScore {
  let likelihood = 0;
  let primaryReason = '';

  // Life-event signal is the strongest predictor.
  if (c.lifeEventSignal) {
    likelihood += 55;
    primaryReason = c.lifeEventSignal;
  }

  // Time-in-home: peaks around the ~7yr average tenure.
  const yrs = c.timeInHomeYrs;
  if (yrs >= 6 && yrs <= 9) {
    likelihood += 30;
    if (!primaryReason) primaryReason = `In home ${yrs}yrs — peak move window`;
  } else if (yrs >= 4 && yrs <= 11) {
    likelihood += 15;
    if (!primaryReason) primaryReason = `In home ${yrs}yrs — approaching move window`;
  }

  // Active/recent relationships (leads, referrals) carry intent.
  if (c.relationship === 'lead') likelihood += 20;
  if (c.relationship === 'referral') likelihood += 12;

  likelihood = Math.max(0, Math.min(100, likelihood));

  // Temperature also weighs relationship freshness so stale contacts cool off,
  // but a strong signal keeps a contact hot regardless of recency.
  const stale = daysSince(c.lastContact) > 120;
  let temperature: Temperature;
  if (likelihood >= 60) temperature = 'hot';
  else if (likelihood >= 30) temperature = stale ? 'warm' : 'warm';
  else temperature = 'cold';

  if (!primaryReason) {
    primaryReason = stale
      ? `No touch in ${daysSince(c.lastContact)}d — time to reconnect`
      : 'Relationship warm — keep nurturing';
  }

  return { temperature, moveLikelihood: likelihood, reason: primaryReason };
}

const TEMP_RANK: Record<Temperature, number> = { hot: 0, warm: 1, cold: 2 };

/** Contacts ranked best-first for "who to call today." */
export function rankContacts(contacts: Contact[]): (Contact & { _score: ContactScore })[] {
  return contacts
    .map((c) => ({ ...c, _score: scoreContact(c) }))
    .sort((a, b) => {
      const t = TEMP_RANK[a._score.temperature] - TEMP_RANK[b._score.temperature];
      if (t !== 0) return t;
      return b._score.moveLikelihood - a._score.moveLikelihood;
    });
}
