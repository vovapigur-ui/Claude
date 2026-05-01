'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getOrCreateWorkoutLog, initSettings } from '@/lib/db';
import type { WorkoutExercise } from '@/lib/db';
import { todayStr, getDayOfWeek, getDayName, getWeekNumber } from '@/lib/utils';
import { getWorkoutForDay } from '@/lib/workout-data';
import type { Exercise } from '@/lib/workout-data';
import { DateNavigator } from '@/components/DateNavigator';

// ─── Weight stepper ───────────────────────────────────────────────────────────

function parseWeightNum(w: string): { num: number; unit: string } | null {
  const m = w.match(/^(\d+\.?\d*)\s*(lb|kg)?/i);
  if (!m) return null;
  return { num: parseFloat(m[1]), unit: (m[2] || 'lb').toLowerCase() };
}

function adjustWeight(current: string, delta: number): string {
  const parsed = parseWeightNum(current);
  if (!parsed) return current;
  const next = Math.max(0, Math.round((parsed.num + delta) * 4) / 4);
  return `${next} ${parsed.unit}`;
}

function WeightStepper({
  weight,
  onChange,
}: {
  weight: string;
  onChange: (v: string) => void;
}) {
  const isBodyweight = /^bw$/i.test(weight.trim());

  if (isBodyweight) {
    return (
      <div className="h-11 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 px-4">
        <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Bodyweight</span>
      </div>
    );
  }

  return (
    <div className="flex items-stretch h-11 rounded-xl border border-zinc-800 overflow-hidden">
      <button
        onClick={() => onChange(adjustWeight(weight, -2.5))}
        className="w-11 flex items-center justify-center bg-zinc-900 text-zinc-500 active:bg-zinc-800 active:text-zinc-200 transition-colors border-r border-zinc-800 text-lg font-mono leading-none"
      >
        −
      </button>
      <input
        type="text"
        inputMode="decimal"
        value={weight}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 text-center bg-zinc-950 font-mono text-sm text-zinc-100 focus:outline-none"
      />
      <button
        onClick={() => onChange(adjustWeight(weight, 2.5))}
        className="w-11 flex items-center justify-center bg-zinc-900 text-zinc-500 active:bg-zinc-800 active:text-zinc-200 transition-colors border-l border-zinc-800 text-lg font-mono leading-none"
      >
        +
      </button>
    </div>
  );
}

// ─── Exercise card ────────────────────────────────────────────────────────────

interface ExerciseCardProps {
  exercise: Exercise;
  logEntry: WorkoutExercise | undefined;
  index: number;
  onWeightChange: (id: string, weight: string) => void;
  onRepChange: (id: string, setIdx: number, reps: string) => void;
  onToggleDone: (id: string) => void;
}

function ExerciseCard({
  exercise,
  logEntry,
  index,
  onWeightChange,
  onRepChange,
  onToggleDone,
}: ExerciseCardProps) {
  const done = logEntry?.done ?? false;
  const weight = logEntry?.weight ?? exercise.defaultWeight;
  const setsCompleted = logEntry?.setsCompleted ?? Array(exercise.sets).fill('');
  const filledSets = setsCompleted.filter(Boolean).length;

  const colsClass =
    exercise.sets <= 3
      ? 'grid-cols-3'
      : exercise.sets === 5
      ? 'grid-cols-5'
      : 'grid-cols-4';

  return (
    <div
      className={`relative rounded-2xl border overflow-hidden transition-all duration-300 card-depth ${
        done
          ? 'bg-yellow-400/[0.04] border-yellow-400/20 glow-sm'
          : exercise.isAnchor
          ? 'bg-zinc-900/90 border-zinc-700/50'
          : 'bg-zinc-900/70 border-zinc-800'
      }`}
    >
      {/* Anchor accent bar */}
      {exercise.isAnchor && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full transition-all duration-300 ${
            done ? 'bg-yellow-400' : 'bg-yellow-400/35'
          }`}
        />
      )}

      <div className="p-4 pl-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] text-zinc-700 tabular-nums tracking-widest">
                {String(index + 1).padStart(2, '0')}
              </span>
              {exercise.isAnchor && (
                <span className="px-1.5 py-px rounded font-mono text-[9px] uppercase tracking-widest border border-yellow-400/30 text-yellow-400/60 leading-none">
                  Anchor
                </span>
              )}
            </div>
            <p
              className={`font-archivo font-bold text-[18px] leading-tight tracking-tight ${
                done ? 'text-yellow-400' : 'text-zinc-100'
              }`}
            >
              {exercise.name}
            </p>
            <p className="font-mono text-[11px] text-zinc-600 mt-1.5 leading-relaxed">
              {exercise.formNote}
            </p>
          </div>

          <button
            onClick={() => onToggleDone(exercise.id)}
            className={`shrink-0 mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
              done
                ? 'bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.45)]'
                : 'bg-zinc-800 border border-zinc-700 hover:border-zinc-600'
            }`}
          >
            {done && (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 7.5L5.5 11L12 3"
                  stroke="#09090b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Prescribed + Weight */}
        <div className="flex items-end gap-3 mb-4">
          <div className="shrink-0">
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-1.5">
              Prescribed
            </p>
            <p className="font-archivo font-black text-2xl text-zinc-200 leading-none tabular-nums">
              {exercise.sets}
              <span className="text-zinc-600 text-lg font-normal mx-1">×</span>
              {exercise.reps}
            </p>
          </div>
          <div className="w-px h-8 bg-zinc-800 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-1.5">
              Weight
            </p>
            <WeightStepper
              weight={weight}
              onChange={(v) => onWeightChange(exercise.id, v)}
            />
          </div>
        </div>

        {/* Set inputs */}
        <div>
          <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-2">
            Reps per set
          </p>
          <div className={`grid ${colsClass} gap-2`}>
            {Array.from({ length: exercise.sets }, (_, i) => {
              const val = setsCompleted[i] ?? '';
              const filled = !!val;
              return (
                <div key={i}>
                  <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest text-center mb-1.5">
                    S{i + 1}
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={val}
                    onChange={(e) => onRepChange(exercise.id, i, e.target.value)}
                    placeholder={
                      exercise.reps === 'AMRAP' || exercise.reps === 'BW'
                        ? '∞'
                        : exercise.reps
                    }
                    className={`w-full text-center py-3 rounded-xl font-archivo font-bold text-base border transition-all duration-200 focus:outline-none ${
                      filled
                        ? 'bg-yellow-400/10 border-yellow-400/25 text-yellow-400'
                        : 'bg-zinc-800/70 border-zinc-700/60 text-zinc-600 placeholder-zinc-700 focus:border-zinc-500 focus:text-zinc-200'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Set completion bar */}
        {filledSets > 0 && (
          <div className="mt-3.5 flex gap-1">
            {Array.from({ length: exercise.sets }, (_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                  i < filledSets ? 'bg-yellow-400/50' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Warmup card ──────────────────────────────────────────────────────────────

function WarmupCard() {
  return (
    <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 overflow-hidden card-depth">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-1">
              Always first
            </p>
            <p className="font-archivo font-bold text-lg text-zinc-100 leading-tight">
              Elliptical Warmup
            </p>
          </div>
          <div className="text-right">
            <p className="font-archivo font-black text-3xl text-zinc-100 leading-none">15</p>
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-0.5">
              min
            </p>
          </div>
        </div>

        <div className="space-y-0 relative">
          {/* Vertical connector */}
          <div className="absolute left-[5px] top-3 bottom-3 w-px bg-zinc-800" />

          {[
            { min: '0–5m', zone: 'Zone 2', desc: 'Easy pace, conversational', accent: false },
            { min: '5–12m', zone: 'Zone 3', desc: 'Moderate, light sweat', accent: true },
            { min: '12–15m', zone: 'Zone 2', desc: 'Cool down, drop intensity', accent: false },
          ].map(({ min, zone, desc, accent }) => (
            <div key={min} className="flex items-center gap-3 py-2">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 border-2 relative z-10 ${
                  accent
                    ? 'bg-yellow-400 border-yellow-400'
                    : 'bg-zinc-700 border-zinc-600'
                }`}
              />
              <div className="flex items-center justify-between flex-1 min-w-0">
                <div>
                  <p className={`font-archivo font-bold text-sm ${accent ? 'text-yellow-400' : 'text-zinc-300'}`}>
                    {zone}
                  </p>
                  <p className="font-mono text-[10px] text-zinc-600">{desc}</p>
                </div>
                <p className="font-mono text-[11px] text-zinc-600 tabular-nums">{min}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Elapsed timer ────────────────────────────────────────────────────────────

function useElapsedTime(active: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useState(() => Date.now())[0];

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [active, startRef]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkoutPage() {
  const [date, setDate] = useState(todayStr());
  const [activeWeek, setActiveWeek] = useState<1 | 2>(1);
  const [weekManuallySet, setWeekManuallySet] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initSettings().then(() => setReady(true));
  }, []);

  const settings = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.settings.get(1) : undefined)
  );
  const workoutLog = useLiveQuery(
    () => (typeof window !== 'undefined' ? db.workoutLogs.get(date) : undefined),
    [date]
  );

  useEffect(() => {
    if (!weekManuallySet && settings?.startDate) {
      setActiveWeek(getWeekNumber(settings.startDate));
    }
  }, [settings?.startDate, weekManuallySet]);

  const dayIndex = getDayOfWeek(date);
  const workout = getWorkoutForDay(dayIndex, activeWeek);
  const isRestDay = workout.type === 'Rest';

  useEffect(() => {
    if (!ready || isRestDay) return;
    const w = getWorkoutForDay(getDayOfWeek(date), activeWeek);
    const defaultExercises: WorkoutExercise[] = w.exercises.map((ex) => ({
      exerciseId: ex.id,
      weight: ex.defaultWeight,
      setsCompleted: Array(ex.sets).fill(''),
      done: false,
    }));
    getOrCreateWorkoutLog(date, defaultExercises);
  }, [date, activeWeek, ready, isRestDay]);

  const elapsed = useElapsedTime(ready && !isRestDay);

  const getLogEntry = (exerciseId: string) =>
    workoutLog?.exercises.find((e) => e.exerciseId === exerciseId);

  const updateExercise = useCallback(
    async (exerciseId: string, updates: Partial<WorkoutExercise>) => {
      const log = await db.workoutLogs.get(date);
      if (!log) return;
      const exercises = log.exercises.map((ex) =>
        ex.exerciseId === exerciseId ? { ...ex, ...updates } : ex
      );
      await db.workoutLogs.put({ ...log, exercises });
    },
    [date]
  );

  const handleWeightChange = useCallback(
    (id: string, weight: string) => updateExercise(id, { weight }),
    [updateExercise]
  );

  const handleRepChange = useCallback(
    (id: string, setIdx: number, reps: string) => {
      const logEntry = workoutLog?.exercises.find((e) => e.exerciseId === id);
      const updated = [...(logEntry?.setsCompleted ?? [])];
      updated[setIdx] = reps;
      updateExercise(id, { setsCompleted: updated });
    },
    [updateExercise, workoutLog]
  );

  const handleToggleDone = useCallback(
    (id: string) => {
      const logEntry = workoutLog?.exercises.find((e) => e.exerciseId === id);
      updateExercise(id, { done: !logEntry?.done });
      navigator.vibrate?.(20);
    },
    [updateExercise, workoutLog]
  );

  const doneCount = workoutLog?.exercises.filter((e) => e.done).length ?? 0;
  const totalCount = workout.exercises.length;
  const allDone = totalCount > 0 && doneCount === totalCount;

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
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-archivo font-black text-2xl tracking-tight leading-none text-zinc-100">
              Workout
            </h1>
            <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mt-0.5">
              {getDayName(date)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isRestDay && (
              <p className="font-mono text-sm text-zinc-600 tabular-nums">{elapsed}</p>
            )}
            <div className="flex items-center gap-1 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
              {([1, 2] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    setActiveWeek(w);
                    setWeekManuallySet(true);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-widest transition-all duration-200 ${
                    activeWeek === w
                      ? 'bg-yellow-400 text-zinc-950 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Wk {w}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DateNavigator date={date} onDateChange={setDate} />

      {isRestDay ? (
        <div className="mx-4 mt-4 rounded-2xl bg-zinc-900 border border-zinc-800 grid-pattern p-8 text-center card-depth">
          <p className="text-5xl mb-3">🛋️</p>
          <h2 className="font-archivo font-black text-3xl text-zinc-100 mb-1">Rest Day</h2>
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-6">
            {getDayName(date)} · Recovery Protocol
          </p>
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              { icon: '🚶', text: 'Light walk 20–30 min (family walk counts)' },
              { icon: '🧘', text: 'Foam roll quads, hamstrings, lats' },
              { icon: '💧', text: 'Still hit your 1 gallon water target' },
              { icon: '😴', text: 'Prioritize 8+ hrs sleep tonight' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-base shrink-0">{icon}</span>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-4 space-y-3 pb-10">
          {/* Hero card */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 grid-pattern overflow-hidden p-5 card-depth">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-2">
                  Week {activeWeek} · {getDayName(date)}
                </p>
                <h2 className="font-archivo font-black text-[52px] leading-none tracking-tight text-zinc-100 uppercase">
                  {workout.type}
                </h2>
                <p className="font-mono text-[11px] text-zinc-500 mt-2">
                  {workout.label.split(' — ')[1]}
                </p>
              </div>
              <div className="shrink-0 text-right pt-1">
                <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-1">
                  Done
                </p>
                <p className="font-archivo font-black text-4xl leading-none tabular-nums">
                  <span className={allDone ? 'text-yellow-400' : 'text-zinc-100'}>
                    {doneCount}
                  </span>
                  <span className="text-zinc-700 text-2xl font-normal">/{totalCount}</span>
                </p>
              </div>
            </div>

            {/* Per-exercise progress segments */}
            <div className="mt-5 flex gap-1.5">
              {workout.exercises.map((ex) => {
                const entry = getLogEntry(ex.id);
                return (
                  <div
                    key={ex.id}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      entry?.done ? 'bg-yellow-400' : 'bg-zinc-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Warmup */}
          <WarmupCard />

          {/* Exercise cards */}
          {workout.exercises.map((exercise, i) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              logEntry={getLogEntry(exercise.id)}
              index={i}
              onWeightChange={handleWeightChange}
              onRepChange={handleRepChange}
              onToggleDone={handleToggleDone}
            />
          ))}

          {/* Completion banner */}
          {allDone && (
            <div className="rounded-2xl bg-yellow-400/8 border border-yellow-400/25 p-7 text-center glow-yellow">
              <p className="text-4xl mb-3">🔥</p>
              <p className="font-archivo font-black text-3xl text-yellow-400 tracking-tight">
                WORKOUT DONE
              </p>
              <p className="font-mono text-[11px] text-zinc-500 mt-2 uppercase tracking-widest">
                {totalCount} exercises · {elapsed} elapsed
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
