'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getOrCreateWorkoutLog, initSettings } from '@/lib/db';
import type { WorkoutExercise } from '@/lib/db';
import { todayStr, getDayOfWeek, getDayName, getWeekNumber } from '@/lib/utils';
import { getWorkoutForDay, getProgram, programs } from '@/lib/workout-data';
import type { Exercise } from '@/lib/workout-data';
import { DateNavigator } from '@/components/DateNavigator';

// ─── Weight stepper ───────────────────────────────────────────────────────────

function adjustWeight(current: string, delta: number): string {
  const m = current.match(/^(\d+\.?\d*)\s*(lb|kg)?/i);
  if (!m) return current;
  const next = Math.max(0, Math.round((parseFloat(m[1]) + delta) * 4) / 4);
  return `${next} ${(m[2] || 'lb').toLowerCase()}`;
}

function WeightStepper({ weight, onChange }: { weight: string; onChange: (v: string) => void }) {
  if (/^bw$/i.test(weight.trim())) {
    return (
      <span className="font-mono text-sm text-zinc-400">Bodyweight</span>
    );
  }
  return (
    <div className="inline-flex items-center border border-zinc-200 rounded-lg overflow-hidden">
      <button
        onClick={() => onChange(adjustWeight(weight, -2.5))}
        className="w-9 h-8 flex items-center justify-center text-zinc-400 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-base font-mono border-r border-zinc-200"
      >
        −
      </button>
      <input
        type="text"
        inputMode="decimal"
        value={weight}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 text-center h-8 bg-white font-mono text-sm text-zinc-800 focus:outline-none"
      />
      <button
        onClick={() => onChange(adjustWeight(weight, 2.5))}
        className="w-9 h-8 flex items-center justify-center text-zinc-400 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-base font-mono border-l border-zinc-200"
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

function ExerciseCard({ exercise, logEntry, index, onWeightChange, onRepChange, onToggleDone }: ExerciseCardProps) {
  const done = logEntry?.done ?? false;
  const weight = logEntry?.weight ?? exercise.defaultWeight;
  const setsCompleted = logEntry?.setsCompleted ?? Array(exercise.sets).fill('');
  const filledSets = setsCompleted.filter(Boolean).length;

  const cols =
    exercise.sets <= 3 ? 'grid-cols-3' : exercise.sets === 5 ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <div className={`border rounded-xl transition-colors duration-200 ${done ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-200 bg-white'}`}>
      <div className="p-4">
        {/* Name row */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[10px] text-zinc-300 shrink-0 tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className={`font-archivo font-bold text-base leading-tight ${done ? 'text-zinc-400' : 'text-zinc-900'}`}>
              {exercise.name}
            </p>
            {exercise.isAnchor && (
              <span className="shrink-0 font-mono text-[9px] text-zinc-400 border border-zinc-200 rounded px-1 py-px leading-none uppercase tracking-wide">
                main
              </span>
            )}
          </div>
          <button
            onClick={() => onToggleDone(exercise.id)}
            className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-200 active:scale-90 ${
              done ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 hover:border-zinc-400'
            }`}
          >
            {done && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6.5L4.5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>

        {/* Form note */}
        <p className="font-mono text-[11px] text-zinc-400 leading-relaxed mb-3 ml-6">
          {exercise.formNote}
        </p>

        {/* Prescribed + weight row */}
        <div className="flex items-center gap-3 ml-6 mb-4">
          <span className="font-mono text-sm text-zinc-500">
            {exercise.sets}×{exercise.reps}
          </span>
          <span className="text-zinc-200">·</span>
          <WeightStepper weight={weight} onChange={(v) => onWeightChange(exercise.id, v)} />
        </div>

        {/* Set inputs */}
        <div className={`grid ${cols} gap-2 ml-6`}>
          {Array.from({ length: exercise.sets }, (_, i) => {
            const val = setsCompleted[i] ?? '';
            const filled = !!val;
            return (
              <div key={i}>
                <p className="font-mono text-[9px] text-zinc-400 text-center mb-1 uppercase tracking-widest">
                  S{i + 1}
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={val}
                  onChange={(e) => onRepChange(exercise.id, i, e.target.value)}
                  placeholder={exercise.reps === 'AMRAP' || exercise.reps === 'BW' ? '∞' : exercise.reps}
                  className={`w-full text-center py-2.5 rounded-lg font-mono text-sm border focus:outline-none transition-all duration-150 ${
                    filled
                      ? 'bg-zinc-900 border-zinc-900 text-white'
                      : 'bg-white border-zinc-200 text-zinc-400 placeholder-zinc-300 focus:border-zinc-400'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Set fill indicator */}
        {filledSets > 0 && (
          <div className="flex gap-1 mt-3 ml-6">
            {Array.from({ length: exercise.sets }, (_, i) => (
              <div
                key={i}
                className={`h-px flex-1 rounded-full transition-all duration-300 ${
                  i < filledSets ? 'bg-zinc-400' : 'bg-zinc-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Elapsed timer ────────────────────────────────────────────────────────────

function useElapsedTime(active: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const [start] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [active, start]);

  return `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkoutPage() {
  const [date, setDate] = useState(todayStr());
  const [activeWeek, setActiveWeek] = useState<1 | 2>(1);
  const [weekManuallySet, setWeekManuallySet] = useState(false);
  const [programId, setProgramId] = useState('ppl');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initSettings().then(() => setReady(true));
    const saved = localStorage.getItem('recomp:program');
    if (saved) setProgramId(saved);
  }, []);

  const selectProgram = (id: string) => {
    setProgramId(id);
    localStorage.setItem('recomp:program', id);
  };

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
  const workout = getWorkoutForDay(dayIndex, activeWeek, programId);
  const isRestDay = workout.type === 'Rest';
  const program = getProgram(programId);

  useEffect(() => {
    if (!ready || isRestDay) return;
    const w = getWorkoutForDay(getDayOfWeek(date), activeWeek, programId);
    const defaultExercises: WorkoutExercise[] = w.exercises.map((ex) => ({
      exerciseId: ex.id,
      weight: ex.defaultWeight,
      setsCompleted: Array(ex.sets).fill(''),
      done: false,
    }));
    getOrCreateWorkoutLog(date, defaultExercises);
  }, [date, activeWeek, programId, ready, isRestDay]);

  const elapsed = useElapsedTime(ready && !isRestDay);

  const getLogEntry = (exerciseId: string) =>
    workoutLog?.exercises.find((e) => e.exerciseId === exerciseId);

  const updateExercise = useCallback(
    async (exerciseId: string, updates: Partial<WorkoutExercise>) => {
      const log = await db.workoutLogs.get(date);
      if (!log) return;
      await db.workoutLogs.put({
        ...log,
        exercises: log.exercises.map((ex) =>
          ex.exerciseId === exerciseId ? { ...ex, ...updates } : ex
        ),
      });
    },
    [date]
  );

  const handleWeightChange = useCallback(
    (id: string, weight: string) => updateExercise(id, { weight }),
    [updateExercise]
  );

  const handleRepChange = useCallback(
    (id: string, setIdx: number, reps: string) => {
      const entry = workoutLog?.exercises.find((e) => e.exerciseId === id);
      const updated = [...(entry?.setsCompleted ?? [])];
      updated[setIdx] = reps;
      updateExercise(id, { setsCompleted: updated });
    },
    [updateExercise, workoutLog]
  );

  const handleToggleDone = useCallback(
    (id: string) => {
      const entry = workoutLog?.exercises.find((e) => e.exerciseId === id);
      updateExercise(id, { done: !entry?.done });
      navigator.vibrate?.(15);
    },
    [updateExercise, workoutLog]
  );

  const doneCount = workoutLog?.exercises.filter((e) => e.done).length ?? 0;
  const totalCount = workout.exercises.length;
  const allDone = totalCount > 0 && doneCount === totalCount;

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest animate-pulse">
          Loading
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-archivo font-black text-xl tracking-tight leading-none text-zinc-900">
              Workout
            </h1>
            <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">
              {getDayName(date)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isRestDay && (
              <p className="font-mono text-xs text-zinc-400 tabular-nums">{elapsed}</p>
            )}
            {/* Week selector */}
            <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
              {([1, 2] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => { setActiveWeek(w); setWeekManuallySet(true); }}
                  className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors duration-150 ${
                    activeWeek === w
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  Wk {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Program selector */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {programs.map((p) => (
            <button
              key={p.id}
              onClick={() => selectProgram(p.id)}
              className={`shrink-0 flex flex-col items-start px-3 py-2 rounded-lg border transition-all duration-150 ${
                programId === p.id
                  ? 'bg-zinc-900 border-zinc-900 text-white'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              <span className={`font-archivo font-bold text-sm leading-tight ${programId === p.id ? 'text-white' : 'text-zinc-800'}`}>
                {p.tag}
              </span>
              <span className={`font-mono text-[9px] leading-tight mt-0.5 ${programId === p.id ? 'text-zinc-400' : 'text-zinc-400'}`}>
                {p.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <DateNavigator date={date} onDateChange={setDate} />

      {isRestDay ? (
        <div className="mx-4 mt-4 border border-zinc-200 rounded-xl p-8 text-center">
          <h2 className="font-archivo font-black text-2xl text-zinc-900 mb-1">Rest Day</h2>
          <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-6">
            {getDayName(date)}
          </p>
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              'Light walk 20–30 min',
              'Foam roll quads, hamstrings, lats',
              'Hit your 1 gallon water target',
              'Prioritize 8+ hrs sleep tonight',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-zinc-300 shrink-0" />
                <p className="font-mono text-xs text-zinc-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-4 space-y-3 pb-10">
          {/* Hero */}
          <div className="border border-zinc-200 rounded-xl p-5 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-2">
                  {program.name} · Week {activeWeek}
                </p>
                <h2 className="font-archivo font-black text-[44px] leading-none tracking-tight text-zinc-900 uppercase">
                  {workout.type}
                </h2>
                <p className="font-mono text-[11px] text-zinc-400 mt-1.5">
                  {workout.label.split(' — ')[1] ?? workout.label}
                </p>
              </div>
              <div className="shrink-0 text-right pt-1">
                <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-1">
                  Done
                </p>
                <p className="font-archivo font-black text-3xl leading-none tabular-nums text-zinc-900">
                  {doneCount}
                  <span className="text-zinc-300 text-xl font-normal">/{totalCount}</span>
                </p>
              </div>
            </div>

            {/* Per-exercise progress segments */}
            <div className="mt-5 flex gap-1">
              {workout.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className={`h-px flex-1 rounded-full transition-all duration-500 ${
                    getLogEntry(ex.id)?.done ? 'bg-zinc-900' : 'bg-zinc-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Warmup */}
          <div className="border border-zinc-200 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <p className="font-archivo font-bold text-sm text-zinc-900">Elliptical Warmup</p>
              <p className="font-mono text-xs text-zinc-400">15 min</p>
            </div>
            <div className="flex items-center gap-0 text-[11px] font-mono">
              {[
                { label: 'Zone 2', time: '0–5m', active: false },
                { label: 'Zone 3', time: '5–12m', active: true },
                { label: 'Zone 2', time: '12–15m', active: false },
              ].map((phase, i) => (
                <div key={i} className="flex items-center">
                  {i > 0 && <span className="text-zinc-300 mx-2">→</span>}
                  <div>
                    <p className={`font-bold ${phase.active ? 'text-zinc-800' : 'text-zinc-400'}`}>
                      {phase.label}
                    </p>
                    <p className="text-zinc-400">{phase.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exercise list */}
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

          {/* Completion */}
          {allDone && (
            <div className="border border-zinc-200 rounded-xl p-6 text-center bg-zinc-50">
              <p className="font-archivo font-black text-2xl text-zinc-900 mb-1">Done</p>
              <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                {totalCount} exercises · {elapsed}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
