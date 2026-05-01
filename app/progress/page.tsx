'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initSettings } from '@/lib/db';
import { sevenDayAverage } from '@/lib/utils';
import { WeightChart, type ChartDataPoint } from '@/components/WeightChart';

const MILESTONES = [200, 195, 190, 185, 180, 175] as const;

export default function ProgressPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initSettings().then(() => setReady(true));
  }, []);

  const settings = useLiveQuery(() => db?.settings?.get?.(1));
  const allLogs = useLiveQuery(
    () => db?.dailyLogs?.orderBy?.('date').toArray(),
    []
  );

  const startWeight = settings?.startWeight ?? 206;
  const goalWeight = settings?.goalWeight ?? 175;
  const totalRange = startWeight - goalWeight;

  const logsWithWeight = allLogs?.filter((l) => l.weight !== null) ?? [];
  const currentWeight =
    [...logsWithWeight].reverse()[0]?.weight ?? startWeight;
  const lbsLost = startWeight - currentWeight;
  const lbsToGo = currentWeight - goalWeight;
  const progressPct = Math.min(Math.max((lbsLost / totalRange) * 100, 0), 100);
  const avg7Day = sevenDayAverage(logsWithWeight);
  const totalWeighIns = logsWithWeight.length;

  const chartData: ChartDataPoint[] = logsWithWeight.map((l) => ({
    date: l.date,
    weight: l.weight as number,
  }));

  // Check milestones
  const achievedMilestones = MILESTONES.map((m) =>
    logsWithWeight.some((l) => (l.weight as number) <= m)
  );

  // Weekly rate of loss
  let weeklyRate: number | null = null;
  if (logsWithWeight.length >= 2) {
    const first = logsWithWeight[0];
    const last = logsWithWeight[logsWithWeight.length - 1];
    const [fy, fm, fd] = first.date.split('-').map(Number);
    const [ly, lm, ld] = last.date.split('-').map(Number);
    const daysDiff = Math.max(
      1,
      (new Date(ly, lm - 1, ld).getTime() - new Date(fy, fm - 1, fd).getTime()) / 86400000
    );
    const weeksDiff = daysDiff / 7;
    weeklyRate = (startWeight - currentWeight) / weeksDiff;
  }

  // Estimated weeks remaining
  const weeksRemaining =
    weeklyRate && weeklyRate > 0 ? Math.ceil(lbsToGo / weeklyRate) : null;

  // Body fat estimate (rough — Navy method not available, using general formula)
  const bmiKg = currentWeight * 0.453592;
  const heightCm = 170.18; // 5'7"
  const bmi = bmiKg / ((heightCm / 100) ** 2);
  const bfPct = 1.2 * bmi + 0.23 * 31 - 16.2; // For men

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900">
        <div className="px-4 py-3">
          <h1 className="font-archivo font-black text-2xl tracking-tight leading-none text-zinc-100">Progress</h1>
          <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mt-0.5">
            {startWeight} → {goalWeight} lb
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4 pb-8">
        {/* Progress Hero */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 grid-pattern overflow-hidden p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                Recomp Journey
              </p>
              <p className="font-archivo font-black text-5xl text-zinc-100 leading-none">
                {progressPct.toFixed(1)}
                <span className="text-2xl font-normal text-zinc-500">%</span>
              </p>
              <p className="font-mono text-xs text-zinc-500 mt-1">
                {lbsLost > 0 ? `-${lbsLost.toFixed(1)}` : '0'} lb of {totalRange} lb goal
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Current</p>
              <p className="font-archivo font-black text-3xl text-yellow-400 leading-tight">
                {currentWeight.toFixed(1)}
              </p>
              <p className="font-mono text-[10px] text-zinc-500">lb</p>
            </div>
          </div>

          {/* Progress bar with markers */}
          <div className="mt-5">
            <div className="relative h-3 bg-zinc-800 rounded-full overflow-visible">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
              {/* Goal marker */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-yellow-400/50 bg-zinc-950" />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="font-mono text-[9px] text-zinc-600">{startWeight} lb</span>
              <span className="font-mono text-[9px] text-zinc-600">GOAL {goalWeight} lb</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: 'Lbs Lost',
              value: lbsLost > 0 ? `-${lbsLost.toFixed(1)}` : '0.0',
              unit: 'lb',
              accent: lbsLost > 0,
            },
            {
              label: 'Lbs to Go',
              value: lbsToGo > 0 ? lbsToGo.toFixed(1) : '0.0',
              unit: 'lb',
              accent: false,
            },
            {
              label: '7-Day Avg',
              value: avg7Day ? avg7Day.toFixed(1) : '—',
              unit: avg7Day ? 'lb' : '',
              accent: false,
            },
            {
              label: 'Weigh-Ins',
              value: String(totalWeighIns),
              unit: totalWeighIns === 1 ? 'day' : 'days',
              accent: totalWeighIns > 0,
            },
          ].map(({ label, value, unit, accent }) => (
            <div key={label} className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                {label}
              </p>
              <p className={`font-archivo font-black text-3xl leading-tight ${accent ? 'text-yellow-400' : 'text-zinc-200'}`}>
                {value}
              </p>
              <p className="font-mono text-[10px] text-zinc-600 mt-0.5">{unit}</p>
            </div>
          ))}
        </div>

        {/* Extra stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Est. BF%',
              value: `~${bfPct.toFixed(0)}%`,
              sub: 'BMI formula',
            },
            {
              label: 'Wkly Rate',
              value: weeklyRate != null ? `-${weeklyRate.toFixed(2)}` : '—',
              sub: weeklyRate != null ? 'lb/wk' : 'need more data',
            },
            {
              label: 'Est. ETA',
              value: weeksRemaining != null ? `${weeksRemaining}` : '—',
              sub: weeksRemaining != null ? 'weeks' : 'need more data',
            },
          ].map(({ label, value, sub }) => (
            <div key={label} className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-center">
              <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5">{label}</p>
              <p className="font-archivo font-bold text-xl text-zinc-200 leading-tight">{value}</p>
              <p className="font-mono text-[9px] text-zinc-600 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Weight Chart */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              Weight History
            </p>
            <p className="font-mono text-[10px] text-zinc-600">
              {totalWeighIns} data {totalWeighIns === 1 ? 'point' : 'points'}
            </p>
          </div>
          <WeightChart data={chartData} goalWeight={goalWeight} startWeight={startWeight} />
        </div>

        {/* Milestone Tracker */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-4">
            Milestones
          </p>
          <div className="space-y-2.5">
            {MILESTONES.map((milestone, i) => {
              const achieved = achievedMilestones[i];
              const isCurrent = !achieved && (i === 0 || achievedMilestones[i - 1]);
              return (
                <div
                  key={milestone}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    achieved
                      ? 'bg-yellow-400/8 border border-yellow-400/20'
                      : isCurrent
                      ? 'bg-zinc-800/60 border border-zinc-700'
                      : 'bg-zinc-800/20 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      achieved
                        ? 'bg-yellow-400 text-zinc-950'
                        : isCurrent
                        ? 'bg-zinc-700 border border-yellow-400/30'
                        : 'bg-zinc-800'
                    }`}
                  >
                    {achieved ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M2 7.5L5.5 11L12 3"
                          stroke="#09090b"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span className="font-mono text-[9px] text-zinc-500">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-archivo font-bold text-base leading-tight ${
                        achieved ? 'text-yellow-400' : isCurrent ? 'text-zinc-200' : 'text-zinc-600'
                      }`}
                    >
                      {milestone} lb
                    </p>
                    <p className="font-mono text-[10px] text-zinc-600">
                      {achieved
                        ? `✓ Milestone hit — ${startWeight - milestone} lb down`
                        : isCurrent
                        ? `Next: ${(currentWeight - milestone).toFixed(1)} lb away`
                        : `${startWeight - milestone} lb from start`}
                    </p>
                  </div>
                  {isCurrent && !achieved && (
                    <span className="font-mono text-[9px] text-yellow-400 uppercase tracking-widest border border-yellow-400/30 rounded px-1.5 py-0.5">
                      Next
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reality Check Card */}
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-4">
            Cut Protocol · Reality Check
          </p>
          <div className="space-y-3">
            {[
              {
                icon: '📊',
                title: 'TDEE Estimate',
                body: `~2,400–2,600 cal/day at your activity level. You're at 2,500 — near maintenance for slow recomp.`,
              },
              {
                icon: '⚡',
                title: 'Protein is Non-Negotiable',
                body: '200g/day protects muscle while losing fat. This is ~1g/lb of target bodyweight (175 lb).',
              },
              {
                icon: '📉',
                title: 'Expected Rate',
                body: 'Body recomp is slower than a hard cut. Expect 0.5–1.0 lb/week. Patience wins.',
              },
              {
                icon: '💡',
                title: 'The Scale Lies Short-Term',
                body: 'Water retention, food volume, and hormones cause 3–5 lb daily swings. Track the 7-day average.',
              },
              {
                icon: '🎯',
                title: 'Timeline Reality',
                body: `At 0.75 lb/week average, ${totalRange} lb = ~${Math.ceil(totalRange / 0.75)} weeks (${Math.round(totalRange / 0.75 / 4)} months). Stay consistent.`,
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="flex gap-3">
                <span className="text-lg mt-0.5 shrink-0">{icon}</span>
                <div>
                  <p className="font-mono text-[10px] text-yellow-400/80 uppercase tracking-widest mb-0.5">{title}</p>
                  <p className="font-mono text-[11px] text-zinc-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
