'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initSettings, getOrCreateDailyLog, defaultMeals } from '@/lib/db';
import type { MealLog } from '@/lib/db';
import { todayStr, getDayOfWeek, getDayName } from '@/lib/utils';
import { mealPlans } from '@/lib/meal-data';
import type { Meal } from '@/lib/meal-data';
import { DateNavigator } from '@/components/DateNavigator';

const MEAL_EMOJIS: Record<string, string> = {
  preworkout: '⚡',
  breakfast: '🍳',
  lunch: '🥗',
  snack: '🍎',
  dinner: '🍽️',
};

interface MealCardProps {
  meal: Meal;
  eaten: boolean;
  onToggle: (id: Meal['id']) => void;
}

function MealCard({ meal, eaten, onToggle }: MealCardProps) {
  return (
    <button
      onClick={() => onToggle(meal.id)}
      className={`w-full text-left rounded-xl border p-4 transition-all duration-200 active:scale-[0.99] ${
        eaten
          ? 'bg-yellow-400/6 border-yellow-400/22 glow-sm'
          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5 shrink-0">{MEAL_EMOJIS[meal.id]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                {meal.time}
              </p>
              <p className={`font-archivo font-bold text-base leading-tight mt-0.5 ${eaten ? 'text-yellow-400' : 'text-zinc-100'}`}>
                {meal.name}
              </p>
            </div>
            <div
              className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-1 transition-all duration-200 ${
                eaten ? 'bg-yellow-400' : 'border border-zinc-600 bg-zinc-800'
              }`}
            >
              {eaten && (
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7.5L5.5 11L12 3"
                    stroke="#09090b"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
          <p className="font-mono text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
            {meal.description}
          </p>
          {/* Macros */}
          <div className="flex items-center gap-3 mt-2.5">
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] text-zinc-600 uppercase">P</span>
              <span className="font-mono text-[11px] text-zinc-300 font-bold">{meal.protein}g</span>
            </div>
            <div className="w-px h-3 bg-zinc-700" />
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] text-zinc-600 uppercase">C</span>
              <span className="font-mono text-[11px] text-zinc-400">{meal.carbs}g</span>
            </div>
            <div className="w-px h-3 bg-zinc-700" />
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] text-zinc-600 uppercase">F</span>
              <span className="font-mono text-[11px] text-zinc-400">{meal.fat}g</span>
            </div>
            <div className="w-px h-3 bg-zinc-700" />
            <span className="font-mono text-[11px] text-zinc-500">{meal.calories} cal</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function MealsPage() {
  const [date, setDate] = useState(todayStr());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initSettings().then(() => setReady(true));
  }, []);

  const dailyLog = useLiveQuery(() => db?.dailyLogs?.get?.(date), [date]);

  const meals = dailyLog?.meals ?? { ...defaultMeals };
  const dayIndex = getDayOfWeek(date);
  const plan = mealPlans[dayIndex];

  const eatenCount = Object.values(meals).filter(Boolean).length;
  const totalMacros = {
    eaten: plan.meals.reduce(
      (acc, m) => ({
        protein: acc.protein + (meals[m.id] ? m.protein : 0),
        calories: acc.calories + (meals[m.id] ? m.calories : 0),
        carbs: acc.carbs + (meals[m.id] ? m.carbs : 0),
        fat: acc.fat + (meals[m.id] ? m.fat : 0),
      }),
      { protein: 0, calories: 0, carbs: 0, fat: 0 }
    ),
    total: { protein: plan.totalProtein, calories: plan.totalCalories, carbs: plan.totalCarbs, fat: plan.totalFat },
  };

  const toggleMeal = useCallback(
    async (id: MealLog[keyof MealLog] extends boolean ? keyof MealLog : never) => {
      const current = await getOrCreateDailyLog(date);
      await db.dailyLogs.put({
        ...current,
        meals: { ...current.meals, [id]: !current.meals[id as keyof MealLog] },
      });
      navigator.vibrate?.(20);
    },
    [date]
  );

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
            <h1 className="font-archivo font-black text-2xl tracking-tight leading-none text-zinc-100">Meals</h1>
            <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mt-0.5">
              {getDayName(date)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Eaten</p>
            <p className="font-archivo font-black text-xl text-yellow-400 leading-tight">
              {eatenCount}
              <span className="text-zinc-600 font-normal text-base">/5</span>
            </p>
          </div>
        </div>
      </div>

      <DateNavigator date={date} onDateChange={setDate} />

      {/* Hero Macro Card */}
      <div className="mx-4 mb-4 rounded-2xl bg-zinc-900 border border-zinc-800 grid-pattern overflow-hidden p-5">
        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{plan.theme}</p>
        <div className="flex items-baseline gap-2 mb-4">
          <p className="font-archivo font-black text-4xl text-zinc-100">
            {totalMacros.eaten.calories}
          </p>
          <p className="font-mono text-sm text-zinc-500">
            / {plan.totalCalories} cal
          </p>
        </div>

        {/* Macro bars */}
        <div className="space-y-2.5">
          {[
            { label: 'Protein', eaten: totalMacros.eaten.protein, total: plan.totalProtein, unit: 'g', color: 'bg-yellow-400' },
            { label: 'Carbs', eaten: totalMacros.eaten.carbs, total: plan.totalCarbs, unit: 'g', color: 'bg-zinc-400' },
            { label: 'Fat', eaten: totalMacros.eaten.fat, total: plan.totalFat, unit: 'g', color: 'bg-zinc-500' },
          ].map(({ label, eaten, total, unit, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{label}</span>
                <span className="font-mono text-[11px] text-zinc-300">
                  <span className="text-zinc-100 font-bold">{eaten}{unit}</span> / {total}{unit}
                </span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min((eaten / total) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal Cards */}
      <div className="mx-4 space-y-3 mb-6">
        {plan.meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            eaten={meals[meal.id] ?? false}
            onToggle={(id) => toggleMeal(id as Parameters<typeof toggleMeal>[0])}
          />
        ))}
      </div>

      {/* Protocol note */}
      <div className="mx-4 mb-8 rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Daily Protocol</p>
        <div className="space-y-1.5">
          {[
            '🕐 Eat every 3-4 hours to keep protein synthesis elevated',
            '🥩 Prioritize protein at every meal — 40-60g per sitting',
            '💧 Drink 500ml water before each meal',
            '📱 Log meals in real-time for accuracy',
          ].map((note) => (
            <p key={note} className="font-mono text-[11px] text-zinc-500 leading-relaxed">
              {note}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
