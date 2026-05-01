export interface Exercise {
  id: string;
  name: string;
  isAnchor: boolean;
  formNote: string;
  sets: number;
  reps: string;
  defaultWeight: string;
}

export interface WorkoutDay {
  type: 'Push' | 'Pull' | 'Legs' | 'Upper' | 'Legs+Core' | 'Rest';
  label: string;
  exercises: Exercise[];
}

// 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const schedule: Record<number, WorkoutDay> = {
  0: { type: 'Rest', label: 'Rest Day', exercises: [] },
  6: { type: 'Rest', label: 'Rest Day', exercises: [] },
  1: {
    type: 'Push',
    label: 'Push — Chest / Shoulders / Triceps',
    exercises: [
      {
        id: 'bench-press',
        name: 'Barbell Bench Press',
        isAnchor: true,
        formNote: 'Tuck elbows 45°, pause at chest, drive through full lockout',
        sets: 4,
        reps: '6',
        defaultWeight: '185 lb',
      },
      {
        id: 'ohp',
        name: 'Overhead Press',
        isAnchor: false,
        formNote: 'Brace hard, ribs down, vertical bar path, full lock overhead',
        sets: 3,
        reps: '8',
        defaultWeight: '95 lb',
      },
      {
        id: 'incline-db',
        name: 'Incline DB Press',
        isAnchor: false,
        formNote: '30° incline, elbows at 75°, full stretch at bottom',
        sets: 3,
        reps: '10',
        defaultWeight: '60 lb',
      },
      {
        id: 'lateral-raises',
        name: 'Cable Lateral Raises',
        isAnchor: false,
        formNote: 'Lead with elbows, slight forward lean, 3s eccentric',
        sets: 4,
        reps: '15',
        defaultWeight: '15 lb',
      },
      {
        id: 'tricep-pushdown',
        name: 'Tricep Pushdown',
        isAnchor: false,
        formNote: 'Elbows pinned to sides, squeeze fully at bottom',
        sets: 3,
        reps: '15',
        defaultWeight: '50 lb',
      },
      {
        id: 'chest-fly',
        name: 'Cable Chest Fly',
        isAnchor: false,
        formNote: 'Slight elbow bend throughout, feel the pec stretch',
        sets: 3,
        reps: '15',
        defaultWeight: '25 lb',
      },
    ],
  },
  2: {
    type: 'Pull',
    label: 'Pull — Back / Biceps / Rear Delts',
    exercises: [
      {
        id: 'barbell-row',
        name: 'Barbell Row',
        isAnchor: true,
        formNote: 'Hip hinge, chest up, pull bar to lower sternum, retract scapula',
        sets: 4,
        reps: '6',
        defaultWeight: '155 lb',
      },
      {
        id: 'lat-pulldown',
        name: 'Lat Pulldown',
        isAnchor: false,
        formNote: 'Slight lean back, pull to upper chest, slow 3s ascent',
        sets: 3,
        reps: '10',
        defaultWeight: '120 lb',
      },
      {
        id: 'seated-cable-row',
        name: 'Seated Cable Row',
        isAnchor: false,
        formNote: 'Neutral spine, drive elbows back, pause at waist',
        sets: 3,
        reps: '12',
        defaultWeight: '100 lb',
      },
      {
        id: 'face-pull',
        name: 'Face Pull',
        isAnchor: false,
        formNote: 'Pull to forehead level, external rotate, elbows high throughout',
        sets: 3,
        reps: '15',
        defaultWeight: '40 lb',
      },
      {
        id: 'barbell-curl',
        name: 'Barbell Curl',
        isAnchor: false,
        formNote: 'No elbow swing, full ROM, squeeze bicep hard at top',
        sets: 3,
        reps: '12',
        defaultWeight: '65 lb',
      },
      {
        id: 'hammer-curl',
        name: 'Hammer Curl',
        isAnchor: false,
        formNote: 'Neutral grip, alternate arms, 2s eccentric',
        sets: 3,
        reps: '12',
        defaultWeight: '30 lb',
      },
    ],
  },
  3: {
    type: 'Legs',
    label: 'Legs — Quad / Hamstring / Glutes / Calves',
    exercises: [
      {
        id: 'squat',
        name: 'Barbell Back Squat',
        isAnchor: true,
        formNote: 'Brace hard, depth below parallel, knees track toes, stay tall',
        sets: 4,
        reps: '6',
        defaultWeight: '185 lb',
      },
      {
        id: 'rdl',
        name: 'Romanian Deadlift',
        isAnchor: false,
        formNote: 'Hip hinge, soft knee, bar drags down legs, feel the hamstring',
        sets: 3,
        reps: '10',
        defaultWeight: '135 lb',
      },
      {
        id: 'leg-press',
        name: 'Leg Press',
        isAnchor: false,
        formNote: 'Feet shoulder-width, full ROM, do not lock knees at top',
        sets: 3,
        reps: '12',
        defaultWeight: '270 lb',
      },
      {
        id: 'leg-curl',
        name: 'Lying Leg Curl',
        isAnchor: false,
        formNote: 'Toes pointed, squeeze hamstring at top, 3s eccentric',
        sets: 3,
        reps: '15',
        defaultWeight: '90 lb',
      },
      {
        id: 'calf-raises',
        name: 'Standing Calf Raise',
        isAnchor: false,
        formNote: 'Full stretch at bottom, 1s pause, squeeze hard at top',
        sets: 4,
        reps: '20',
        defaultWeight: '135 lb',
      },
      {
        id: 'leg-ext',
        name: 'Leg Extension',
        isAnchor: false,
        formNote: 'Controlled movement, squeeze quad at full extension',
        sets: 3,
        reps: '15',
        defaultWeight: '80 lb',
      },
    ],
  },
  4: {
    type: 'Upper',
    label: 'Upper — Deadlift + Full Upper',
    exercises: [
      {
        id: 'deadlift',
        name: 'Conventional Deadlift',
        isAnchor: true,
        formNote: 'Hips back, bar over mid-foot, big air breath, drive floor away',
        sets: 3,
        reps: '4',
        defaultWeight: '225 lb',
      },
      {
        id: 'bench-upper',
        name: 'Bench Press',
        isAnchor: false,
        formNote: 'Same cues as Monday, focus on power and speed',
        sets: 3,
        reps: '8',
        defaultWeight: '175 lb',
      },
      {
        id: 'pullup',
        name: 'Pull-ups',
        isAnchor: false,
        formNote: 'Full dead hang, chin clears bar, control the descent',
        sets: 3,
        reps: 'AMRAP',
        defaultWeight: 'BW',
      },
      {
        id: 'db-row',
        name: 'Single-Arm DB Row',
        isAnchor: false,
        formNote: 'Knee on bench, pull elbow to hip pocket, big range of motion',
        sets: 3,
        reps: '10',
        defaultWeight: '80 lb',
      },
      {
        id: 'ohp-upper',
        name: 'Overhead Press',
        isAnchor: false,
        formNote: 'Strict, no leg drive today, vertical bar path',
        sets: 3,
        reps: '10',
        defaultWeight: '85 lb',
      },
      {
        id: 'dips',
        name: 'Weighted Dips',
        isAnchor: false,
        formNote: 'Slight forward lean, elbows flare slightly, full depth',
        sets: 3,
        reps: 'AMRAP',
        defaultWeight: 'BW',
      },
    ],
  },
  5: {
    type: 'Legs+Core',
    label: 'Legs + Core — Volume & Conditioning',
    exercises: [
      {
        id: 'front-squat',
        name: 'Front Squat',
        isAnchor: true,
        formNote: 'Elbows high, upright torso, depth below parallel, stay tight',
        sets: 4,
        reps: '8',
        defaultWeight: '135 lb',
      },
      {
        id: 'leg-press-fri',
        name: 'Leg Press',
        isAnchor: false,
        formNote: 'High foot position for glutes, slow 3s down, explode up',
        sets: 4,
        reps: '15',
        defaultWeight: '250 lb',
      },
      {
        id: 'leg-curl-fri',
        name: 'Seated Leg Curl',
        isAnchor: false,
        formNote: 'Toes dorsiflexed, squeeze at peak, 3s eccentric',
        sets: 3,
        reps: '15',
        defaultWeight: '80 lb',
      },
      {
        id: 'calf-raises-fri',
        name: 'Calf Raises',
        isAnchor: false,
        formNote: 'Full stretch at bottom, pause, explosive up',
        sets: 4,
        reps: '20',
        defaultWeight: '135 lb',
      },
      {
        id: 'plank',
        name: 'Plank Hold',
        isAnchor: false,
        formNote: 'Brace like a punch is coming, glutes squeezed, neutral spine',
        sets: 3,
        reps: '60s',
        defaultWeight: 'BW',
      },
      {
        id: 'ab-wheel',
        name: 'Ab Wheel Rollout',
        isAnchor: false,
        formNote: 'From knees, extend fully, pull back with lats and abs',
        sets: 3,
        reps: '12',
        defaultWeight: 'BW',
      },
    ],
  },
};

// Week 2: hypertrophy focus — higher reps, slightly lower weight
const week2Overrides: Partial<Record<string, { reps: string; defaultWeight: string }>> = {
  'bench-press': { reps: '10', defaultWeight: '165 lb' },
  'ohp': { reps: '12', defaultWeight: '85 lb' },
  'incline-db': { reps: '15', defaultWeight: '55 lb' },
  'barbell-row': { reps: '10', defaultWeight: '140 lb' },
  'lat-pulldown': { reps: '15', defaultWeight: '110 lb' },
  'squat': { reps: '10', defaultWeight: '165 lb' },
  'rdl': { reps: '15', defaultWeight: '115 lb' },
  'deadlift': { reps: '6', defaultWeight: '205 lb' },
  'bench-upper': { reps: '12', defaultWeight: '155 lb' },
  'front-squat': { reps: '12', defaultWeight: '115 lb' },
  'leg-press': { reps: '15', defaultWeight: '250 lb' },
};

export function getWorkoutForDay(dayIndex: number, week: 1 | 2): WorkoutDay {
  const base = schedule[dayIndex];
  if (!base) return { type: 'Rest', label: 'Rest Day', exercises: [] };
  if (week === 1 || base.type === 'Rest') return base;

  return {
    ...base,
    exercises: base.exercises.map((ex) => {
      const override = week2Overrides[ex.id];
      return override ? { ...ex, ...override } : ex;
    }),
  };
}
