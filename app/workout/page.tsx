'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getOrCreateWorkoutLog, initSettings } from '@/lib/db';
import type { WorkoutExercise } from '@/lib/db';
import { todayStr, getDayOfWeek, getDayName, getWeekNumber } from '@/lib/utils';
import { getWorkoutForDay } from '@/lib/workout-data';
import type { Exercise } from '@/lib/workout-data';
import { DateNavigator } from '@/components/DateNavigator';

function Checkmark() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2 7.5L5.5 11L12 3" stroke="#09090b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  logEntry: WorkoutExercise | undefined;
  onWeightChange: (exerciseId: string, weight: string) => void;
  onRepChange: (exerciseId: string, setIdx: number, reps: string) => void;
  onToggleDone: (exerciseId: string) => void;
}

function ExerciseCard({ exercise, logEntry, onWeightChange, onRepChange, onToggleDone }: ExerciseCardProps) {
  const done = logEntry?.done ?? false;
  const weight = logEntry?.weight ?? exercise.defaultWeight;
  const setsCompleted = logEntry?.setsCompleted ?? Array(exercise.sets).fill('');

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${
        done
          ? 'bg-yellow-400/5 border-yellow-400/25 glow-sm'
          : 'bg-zinc-900 border-zinc-800'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-archivo font-bold text-base leading-tight ${done ? 'text-yellow-400' : 'text-zinc-100'}`}>
              {exercise.name}
            </p>
            {exercise.isAnchor && (
              <span className="shrink-0 px-1.5 py-0.5 rounded border border-yellow-400/50 font-mono text-[9px] uppercase tracking-widest text-yellow-400 leading-none">
                Anchor
              </span>
            )}
          </div>
          <p className="font-mono text-[10px] text-zinc-600 mt-1 leading-relaxed">
            {exercise.formNote}
          </p>
        </div>
        <button
          onClick={() => onToggleDone(exercise.id)}
          className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90 ${
            done ? 'bg-yellow-400' : 'border border-zinc-600 bg-zinc-800'
          }`}
        >
          {done && <Checkmark />}
        </button>
      </div>

      {/* Sets × Reps + Weight row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Prescribed</p>
          <p className="font-archivo font-bold text-base text-zinc-300">
            {exercise.sets}×{exercise.reps}
          </p>
        </div>
        <div className="flex-1">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Weight</p>
          <input
            type="text"
            value={weight}
            onChange={(e) => onWeightChange(exercise.id, e.target.value)}
            className="w-full bg-zinc-800 rounded-lg px-3 py-1.5 font-mono text-sm text-zinc-100 border border-zinc-700 focus:border-yellow-400 focus:outline-none transition-colors duration-200"
            placeholder={exercise.defaultWeight}
          />
        </div>
      </div>

      {/* Per-set rep inputs */}
      <div>
        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
          Reps per set
        </p>
        <div className={`grid gap-2 ${exercise.sets <= 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {Array.from({ length: exercise.sets }, (_, i) => (
            <div key={i} className="text-center">
              <p className="font-mono text-[9px] text-zinc-600 mb-1">SET {i + 1}</p>
              <input
                type="text"
                inputMode="numeric"
                value={setsCompleted[i] ?? ''}
                onChange={(e) => onRepChange(exercise.id, i, e.target.value)}
                placeholder={exercise.reps === 'AMRAP' || exercise.reps === 'BW' ? '—' : exercise.reps}
                className={`w-full bg-zinc-800 rounded-lg text-center py-2 font-mono text-sm border focus:outline-none transition-colors duration-200 ${
                  setsCompleted[i]
                    ? 'border-yellow-400/40 text-yellow-400'
                    : 'border-zinc-700 text-zinc-400 focus:border-yellow-400'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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

  // Auto-detect week from start date — skip if user manually changed it
  useEffect(() => {
    if (!weekManuallySet && settings?.startDate) {
      setActiveWeek(getWeekNumber(settings.startDate));
    }
  }, [settings?.startDate, weekManuallySet]);

  const dayIndex = getDayOfWeek(date);
  const workout = getWorkoutForDay(dayIndex, activeWeek);
  const isRestDay = workout.type === 'Rest';

  // Initialize workout log when date/week changes
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

  const getLogEntry = (exerciseId: string): WorkoutExercise | undefined =>
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
    (exerciseId: string, weight: string) => {
      updateExercise(exerciseId, { weight });
    },
    [updateExercise]
  );

  const handleRepChange = useCallback(
    (exerciseId: string, setIdx: number, reps: string) => {
      const logEntry = workoutLog?.exercises.find((e) => e.exerciseId === exerciseId);
      const current = logEntry?.setsCompleted ?? [];
      const updated = [...current];
      updated[setIdx] = reps;
      updateExercise(exerciseId, { setsCompleted: updated });
    },
    [updateExercise, workoutLog]
  );

  const handleToggleDone = useCallback(
    (exerciseId: string) => {
      const logEntry = workoutLog?.exercises.find((e) => e.exerciseId === exerciseId);
      updateExercise(exerciseId, { done: !logEntry?.done });
      navigator.vibrate?.(20);
    },
    [updateExercise, workoutLog]
  );

  const doneCount = workoutLog?.exercises.filter((e) => e.done).length ?? 0;
  const totalCount = workout.exercises.length;

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
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-archivo font-black text-2xl tracking-tight leading-none text-zinc-100">
              Workout
            </h1>
            <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mt-0.5">
              {getDayName(date)}
            </p>
          </div>
          {/* Week Selector */}
          <div className="flex items-center gap-1 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
            {([1, 2] as const).map((w) => (
              <button
                key={w}
                onClick={() => { setActiveWeek(w); setWeekManuallySet(true); }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-widest transition-all duration-200 ${
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

      <DateNavigator date={date} onDateChange={setDate} />

      {isRestDay ? (
        <div className="mx-4 mt-4">
          {/* Rest day hero card */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 grid-pattern p-8 text-center">
            <p className="text-5xl mb-3">🛋️</p>
            <h2 className="font-archivo font-black text-3xl text-zinc-100 mb-1">Rest Day</h2>
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-4">
              {getDayName(date)} · Recovery Protocol
            </p>
            <div className="space-y-2 text-left max-w-xs mx-auto">
              {[
                { icon: '🚶', text: 'Light walk 20-30 min (family walk counts)' },
                { icon: '🧘', text: 'Foam roll quads, hamstrings, lats' },
                { icon: '💧', text: 'Still hit your 1 gallon water target' },
                { icon: '😴', text: 'Prioritize 8+ hrs sleep tonight' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-2.5">
                  <span className="text-base mt-0.5 shrink-0">{icon}</span>
                  <p className="font-mono text-xs text-zinc-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-4 mt-0 space-y-4">
          {/* Hero Card */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 grid-pattern overflow-hidden p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                  Week {activeWeek} · {getDayName(date)}
                </p>
                <h2 className="font-archivo font-black text-4xl text-zinc-100 leading-tight">
                  {workout.type}
                </h2>
                <p className="font-mono text-xs text-zinc-500 mt-1.5">{workout.label.split(' — ')[1]}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Done</p>
                <p className="font-archivo font-black text-3xl text-yellow-400">
                  {doneCount}
                  <span className="text-zinc-600 font-normal">/{totalCount}</span>
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                style={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* Elliptical Warmup Card */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-lg shrink-0">
                🏃
              </div>
              <div>
                <p className="font-archivo font-bold text-sm text-zinc-200">Elliptical Warmup</p>
                <p className="font-mono text-[10px] text-zinc-500">Always first · 15 minutes</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { min: '0-5', zone: 'Zone 2', desc: 'Easy pace, conversational' },
                { min: '5-12', zone: 'Zone 3', desc: 'Moderate, light sweat' },
                { min: '12-15', zone: 'Zone 2', desc: 'Cool down, drop intensity' },
              ].map(({ min, zone, desc }) => (
                <div key={min} className="bg-zinc-800/60 rounded-xl p-2.5 text-center">
                  <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wide">{min}m</p>
                  <p className="font-archivo font-bold text-sm text-yellow-400 my-0.5">{zone}</p>
                  <p className="font-mono text-[9px] text-zinc-600 leading-tight">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Exercise Cards */}
          {workout.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              logEntry={getLogEntry(exercise.id)}
              onWeightChange={handleWeightChange}
              onRepChange={handleRepChange}
              onToggleDone={handleToggleDone}
            />
          ))}

          {/* Completion summary */}
          {doneCount === totalCount && totalCount > 0 && (
            <div className="rounded-xl bg-yellow-400/10 border border-yellow-400/30 p-5 text-center glow-yellow">
              <p className="text-3xl mb-2">🔥</p>
              <p className="font-archivo font-black text-2xl text-yellow-400">WORKOUT DONE</p>
              <p className="font-mono text-xs text-zinc-400 mt-1 uppercase tracking-widest">
                All {totalCount} exercises completed
              </p>
            </div>
          )}

          <div className="h-4" />
        </div>
      )}
    </div>
  );
}
