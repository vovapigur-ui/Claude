import Dexie, { type Table } from 'dexie';

export interface MealLog {
  [key: string]: boolean;
  preworkout: boolean;
  breakfast: boolean;
  lunch: boolean;
  snack: boolean;
  dinner: boolean;
}

export interface HabitLog {
  [key: string]: boolean;
  protein: boolean;
  water: boolean;
  steps: boolean;
  sleep: boolean;
  supplements: boolean;
  walk: boolean;
}

export interface DailyLog {
  date: string;
  weight: number | null;
  meals: MealLog;
  habits: HabitLog;
  workoutCompleted: boolean;
  notes: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  weight: string;
  setsCompleted: string[];
  done: boolean;
}

export interface WorkoutLog {
  date: string;
  exercises: WorkoutExercise[];
}

export interface AppSettings {
  id: number;
  startDate: string;
  startWeight: number;
  goalWeight: number;
  height: string;
  dailyCalTarget: number;
  dailyProteinTarget: number;
  syncEnabled: boolean;
}

class RecompDB extends Dexie {
  dailyLogs!: Table<DailyLog, string>;
  workoutLogs!: Table<WorkoutLog, string>;
  settings!: Table<AppSettings, number>;

  constructor() {
    super('RecompDB');
    this.version(1).stores({
      dailyLogs: 'date',
      workoutLogs: 'date',
      settings: 'id',
    });
  }
}

// Lazy singleton — never instantiated on the server
let _instance: RecompDB | null = null;

function getInstance(): RecompDB {
  if (!_instance) {
    _instance = new RecompDB();
  }
  return _instance;
}

// Proxy that defers all property access until client-side
export const db = new Proxy({} as RecompDB, {
  get(_target, prop) {
    if (typeof window === 'undefined') return undefined;
    return getInstance()[prop as keyof RecompDB];
  },
});

export const defaultMeals: MealLog = {
  preworkout: false,
  breakfast: false,
  lunch: false,
  snack: false,
  dinner: false,
};

export const defaultHabits: HabitLog = {
  protein: false,
  water: false,
  steps: false,
  sleep: false,
  supplements: false,
  walk: false,
};

const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  startDate: '2025-01-06',
  startWeight: 206,
  goalWeight: 175,
  height: "5'7\"",
  dailyCalTarget: 2500,
  dailyProteinTarget: 200,
  syncEnabled: false,
};

export async function initSettings(): Promise<void> {
  if (typeof window === 'undefined') return;
  const d = getInstance();
  const existing = await d.settings.get(1);
  if (!existing) {
    await d.settings.put(DEFAULT_SETTINGS);
  }
}

export async function getOrCreateDailyLog(date: string): Promise<DailyLog> {
  const d = getInstance();
  const existing = await d.dailyLogs.get(date);
  if (existing) return existing;
  const newLog: DailyLog = {
    date,
    weight: null,
    meals: { ...defaultMeals },
    habits: { ...defaultHabits },
    workoutCompleted: false,
    notes: '',
  };
  await d.dailyLogs.put(newLog);
  return newLog;
}

export async function getOrCreateWorkoutLog(
  date: string,
  defaultExercises: WorkoutExercise[] = []
): Promise<WorkoutLog> {
  const d = getInstance();
  const existing = await d.workoutLogs.get(date);
  if (existing) return existing;
  const newLog: WorkoutLog = { date, exercises: defaultExercises };
  await d.workoutLogs.put(newLog);
  return newLog;
}
