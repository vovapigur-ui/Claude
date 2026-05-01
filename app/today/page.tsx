'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { CompletionRing } from '@/components/CompletionRing';
import { DateNavigator } from '@/components/DateNavigator';
import {
  db,
  initSettings,
  getOrCreateDailyLog,
  defaultMeals,
  defaultHabits,
} from '@/lib/db';
import type { HabitLog, DailyLog } from '@/lib/db';
import {
  todayStr,
  getDayName,
  getDayOfWeek,
  calculateCompletionPercent,
} from '@/lib/utils';
import { getWorkoutForDay } from '@/lib/workout-data';

const HABITS: {
  key: keyof HabitLog;
  label: string;
  emoji: string;
  sublabel: string;
}[] = [
  { key: 'protein', label: '200g Protein', emoji: '🥩', sublabel: 'Hit your daily protein target' },
  { key: 'water', label: '1 Gallon Water', emoji: '💧', sublabel: '128 oz / 3.78 L' },
  { key: 'steps', label: '8,000 Steps', emoji: '👟', sublabel: 'Check Apple Health or watch' },
  { key: 'sleep', label: '7.5+ hrs Sleep', emoji: '😴', sublabel: 'Recovery is where growth happens' },
  {
    key: 'supplements',
    label: 'Supplements',
    emoji: '💊',
    sublabel: 'Creatine · D3 · Omega-3 · Magnesium',
  },
  { key: 'walk', label: 'Family Walk', emoji: '🌳', sublabel: '20 min minimum outside' },
];

export default function TodayPage() {
  const [date, setDate] = useState(todayStr());
  const [weightInput, setWeightInput] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initSettings().then(() => setReady(true));
  }, []);

  // Guard all queries with typeof window — prevents empty subscriptions during SSR
  const dailyLog = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.dailyLogs.get(date) : undefined),
    [date]
  );
  const settings = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.settings.get(1) : undefined)
  );
  const recentLogs = useLiveQuery(
    () =>
      typeof window !== 'undefined'
        ? db.dailyLogs.orderBy('date').reverse().limit(60).toArray()
        : Promise.resolve([] as DailyLog[]),
    []
  );

  const startWeight = settings?.startWeight ?? 206;
  const currentWeight =
    recentLogs?.find((l) => l.weight !== null)?.weight ?? startWeight;
  const lbsLost = startWeight - currentWeight;

  useEffect(() => {
    if (dailyLog?.weight != null) {
      setWeightInput(String(dailyLog.weight));
    } else {
      setWeightInput('');
    }
  }, [dailyLog?.weight, date]);

  const log = dailyLog ?? {
    date,
    weight: null,
    meals: { ...defaultMeals },
    habits: { ...defaultHabits },
    workoutCompleted: false,
    notes: '',
  };

  const completionPct = calculateCompletionPercent(log.meals, log.habits, log.workoutCompleted);

  const saveWeight = useCallback(async () => {
    const val = parseFloat(weightInput);
    if (isNaN(val) || val < 80 || val > 450) return;
    const current = await getOrCreateDailyLog(date);
    await db.dailyLogs.put({ ...current, weight: val });
    navigator.vibrate?.(30);
  }, [date, weightInput]);

  const toggleHabit = useCallback(
    async (key: keyof HabitLog) => {
      const current = await getOrCreateDailyLog(date);
      await db.dailyLogs.put({
        ...current,
        habits: { ...current.habits, [key]: !current.habits[key] },
      });
      navigator.vibrate?.(20);
    },
    [date]
  );

  const toggleWorkout = useCallback(async () => {
    const current = await getOrCreateDailyLog(date);
    await db.dailyLogs.put({ ...current, workoutCompleted: !current.workoutCompleted });
  }, [date]);

  const dayIndex = getDayOfWeek(date);
  const todaysWorkout = getWorkoutForDay(dayIndex, 1);
  const isRestDay = todaysWorkout.type === 'Rest';

  const completionLabel =
    completionPct === 100
      ? '🔥 PERFECT DAY'
      : completionPct >= 75
      ? 'ALMOST THERE'
      : completionPct >= 50
      ? 'HALFWAY DONE'
      : completionPct > 0
      ? "KEEP PUSHING"
      : "LET'S GET IT";

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-archivo font-black text-2xl tracking-tight leading-none text-zinc-100">
              RECOMP
            </h1>
            <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mt-0.5">
              {getDayName(date)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Current</p>
              <p className="font-archivo font-black text-xl leading-tight text-yellow-400">
                {currentWeight.toFixed(1)}
                <span className="text-xs font-normal text-zinc-500 ml-0.5">lb</span>
              </p>
            </div>
            <div className="w-px h-9 bg-zinc-800" />
            <div className="text-right">
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Lost</p>
              <p
                className={`font-archivo font-black text-xl leading-tight ${
                  lbsLost > 0 ? 'text-yellow-400' : 'text-zinc-500'
                }`}
              >
                {lbsLost > 0 ? '-' : '+'}
                {Math.abs(lbsLost).toFixed(1)}
                <span className="text-xs font-normal text-zinc-500 ml-0.5">lb</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Navigator */}
      <DateNavigator date={date} onDateChange={setDate} />

      {/* Completion Hero Card */}
      <div className="mx-4 mb-4 rounded-2xl bg-zinc-900 border border-zinc-800 grid-pattern overflow-hidden p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
              Daily Progress
            </p>
            <p className="font-archivo font-black text-6xl text-zinc-100 leading-none">
              {completionPct}
              <span className="text-3xl font-normal text-zinc-500">%</span>
            </p>
            <p
              className={`font-mono text-[11px] uppercase tracking-widest mt-2 ${
                completionPct === 100 ? 'text-yellow-400' : 'text-zinc-500'
              }`}
            >
              {completionLabel}
            </p>
          </div>
          <CompletionRing percentage={completionPct} size={112} strokeWidth={9}>
            <span className="font-mono text-sm font-bold text-yellow-400">{completionPct}%</span>
          </CompletionRing>
        </div>

        {/* Mini progress bar */}
        <div className="mt-4 flex gap-1.5">
          {[...Array(12)].map((_, i) => {
            const filled =
              i <
              Object.values(log.habits).filter(Boolean).length +
                Object.values(log.meals).filter(Boolean).length +
                (log.workoutCompleted ? 1 : 0);
            return (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  filled ? 'bg-yellow-400' : 'bg-zinc-800'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Weigh-In Card */}
      <div className="mx-4 mb-4 rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
          Morning Weigh-In
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="80"
              max="450"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onBlur={saveWeight}
              onKeyDown={(e) => e.key === 'Enter' && saveWeight()}
              placeholder={currentWeight.toFixed(1)}
              className="w-full bg-zinc-800 rounded-xl px-4 py-3 pr-10 font-mono text-lg text-zinc-100 placeholder-zinc-600 border border-zinc-700 focus:border-yellow-400 focus:outline-none transition-colors duration-200"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-zinc-500">
              lb
            </span>
          </div>
          <button
            onClick={saveWeight}
            className="px-5 py-3 rounded-xl bg-yellow-400 text-zinc-950 font-mono font-bold text-sm uppercase tracking-wider active:bg-yellow-300 active:scale-95 transition-all duration-200"
          >
            Save
          </button>
        </div>
        {log.weight !== null && (
          <p className="font-mono text-[11px] text-yellow-400 mt-2">
            ✓ Logged {log.weight.toFixed(1)} lb today
          </p>
        )}
      </div>

      {/* Daily Habits */}
      <div className="mx-4 mb-4 rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
            Daily Habits
          </p>
          <p className="font-mono text-[10px] text-zinc-600">
            {Object.values(log.habits).filter(Boolean).length}/6
          </p>
        </div>
        <div className="space-y-1.5">
          {HABITS.map(({ key, label, emoji, sublabel }) => {
            const checked = log.habits[key];
            return (
              <button
                key={key}
                onClick={() => toggleHabit(key)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 active:scale-[0.99] ${
                  checked
                    ? 'bg-yellow-400/8 border border-yellow-400/20'
                    : 'bg-zinc-800/60 border border-transparent'
                }`}
              >
                <span className="text-xl w-7 shrink-0 text-center">{emoji}</span>
                <div className="flex-1 text-left min-w-0">
                  <p
                    className={`text-sm font-medium leading-tight ${
                      checked ? 'text-yellow-400' : 'text-zinc-200'
                    }`}
                  >
                    {label}
                  </p>
                  <p className="text-[11px] text-zinc-600 font-mono mt-0.5">{sublabel}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 ${
                    checked ? 'bg-yellow-400' : 'border border-zinc-600'
                  }`}
                >
                  {checked && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6.5L4.5 9L10 3"
                        stroke="#09090b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Workout */}
      <div className="mx-4 mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
            Today&apos;s Workout
          </p>
          {!isRestDay && (
            <button
              onClick={toggleWorkout}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all duration-200 ${
                log.workoutCompleted
                  ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
              }`}
            >
              {log.workoutCompleted ? '✓ Done' : 'Mark Done'}
            </button>
          )}
        </div>

        {isRestDay ? (
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 text-center">
            <p className="text-3xl mb-2">🛋️</p>
            <p className="font-mono text-sm text-zinc-400 uppercase tracking-widest">Rest Day</p>
            <p className="font-mono text-[11px] text-zinc-600 mt-1">
              Active recovery — light walk, stretching
            </p>
          </div>
        ) : (
          <Link href="/workout">
            <div
              className={`rounded-xl border p-4 grid-pattern transition-all duration-200 active:scale-[0.99] ${
                log.workoutCompleted
                  ? 'bg-yellow-400/5 border-yellow-400/25 glow-sm'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    log.workoutCompleted ? 'bg-yellow-400/15' : 'bg-zinc-800'
                  }`}
                >
                  💪
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-archivo font-bold text-lg leading-tight ${
                      log.workoutCompleted ? 'text-yellow-400' : 'text-zinc-100'
                    }`}
                  >
                    {todaysWorkout.type}
                  </p>
                  <p className="font-mono text-[11px] text-zinc-500 mt-0.5">
                    {todaysWorkout.exercises.length} exercises · tap to log
                  </p>
                </div>
                <ChevronRight size={18} className="text-zinc-600 shrink-0" />
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
