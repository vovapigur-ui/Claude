export interface Exercise {
  id: string;
  name: string;
  isAnchor: boolean;
  formNote: string;
  sets: number;
  reps: string;
  defaultWeight: string;
}

export type WorkoutType =
  | 'Push'
  | 'Pull'
  | 'Legs'
  | 'Upper'
  | 'Lower'
  | 'Legs+Core'
  | 'Squat'
  | 'Bench'
  | 'Deadlift'
  | 'OHP'
  | 'Rest';

export interface WorkoutDay {
  type: WorkoutType;
  label: string;
  exercises: Exercise[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  tag: string;
  description: string;
  schedule: Record<number, WorkoutDay>;
  weekOverrides?: Partial<Record<string, { reps: string; defaultWeight: string }>>;
}

// ─── PPL ──────────────────────────────────────────────────────────────────────

const pplSchedule: Record<number, WorkoutDay> = {
  0: { type: 'Rest', label: 'Rest Day', exercises: [] },
  6: { type: 'Rest', label: 'Rest Day', exercises: [] },
  1: {
    type: 'Push',
    label: 'Push — Chest / Shoulders / Triceps',
    exercises: [
      { id: 'bench-press', name: 'Barbell Bench Press', isAnchor: true, formNote: 'Tuck elbows 45°, pause at chest, drive through full lockout', sets: 4, reps: '6', defaultWeight: '185 lb' },
      { id: 'ohp', name: 'Overhead Press', isAnchor: false, formNote: 'Brace hard, ribs down, vertical bar path, full lockout overhead', sets: 3, reps: '8', defaultWeight: '95 lb' },
      { id: 'incline-db', name: 'Incline DB Press', isAnchor: false, formNote: '30° incline, elbows at 75°, full stretch at bottom', sets: 3, reps: '10', defaultWeight: '60 lb' },
      { id: 'lateral-raises', name: 'Cable Lateral Raises', isAnchor: false, formNote: 'Lead with elbows, slight forward lean, 3s eccentric', sets: 4, reps: '15', defaultWeight: '15 lb' },
      { id: 'tricep-pushdown', name: 'Tricep Pushdown', isAnchor: false, formNote: 'Elbows pinned to sides, squeeze fully at bottom', sets: 3, reps: '15', defaultWeight: '50 lb' },
      { id: 'chest-fly', name: 'Cable Chest Fly', isAnchor: false, formNote: 'Slight elbow bend throughout, feel the pec stretch', sets: 3, reps: '15', defaultWeight: '25 lb' },
    ],
  },
  2: {
    type: 'Pull',
    label: 'Pull — Back / Biceps / Rear Delts',
    exercises: [
      { id: 'barbell-row', name: 'Barbell Row', isAnchor: true, formNote: 'Hip hinge, chest up, pull bar to lower sternum, retract scapula', sets: 4, reps: '6', defaultWeight: '155 lb' },
      { id: 'lat-pulldown', name: 'Lat Pulldown', isAnchor: false, formNote: 'Slight lean back, pull to upper chest, slow 3s ascent', sets: 3, reps: '10', defaultWeight: '120 lb' },
      { id: 'seated-cable-row', name: 'Seated Cable Row', isAnchor: false, formNote: 'Neutral spine, drive elbows back, pause at waist', sets: 3, reps: '12', defaultWeight: '100 lb' },
      { id: 'face-pull', name: 'Face Pull', isAnchor: false, formNote: 'Pull to forehead level, external rotate, elbows high', sets: 3, reps: '15', defaultWeight: '40 lb' },
      { id: 'barbell-curl', name: 'Barbell Curl', isAnchor: false, formNote: 'No elbow swing, full ROM, squeeze bicep hard at top', sets: 3, reps: '12', defaultWeight: '65 lb' },
      { id: 'hammer-curl', name: 'Hammer Curl', isAnchor: false, formNote: 'Neutral grip, alternate arms, 2s eccentric', sets: 3, reps: '12', defaultWeight: '30 lb' },
    ],
  },
  3: {
    type: 'Legs',
    label: 'Legs — Quad / Hamstring / Glutes',
    exercises: [
      { id: 'squat', name: 'Barbell Back Squat', isAnchor: true, formNote: 'Brace hard, depth below parallel, knees track toes, stay tall', sets: 4, reps: '6', defaultWeight: '185 lb' },
      { id: 'rdl', name: 'Romanian Deadlift', isAnchor: false, formNote: 'Hip hinge, soft knee, bar drags down legs, feel the hamstring', sets: 3, reps: '10', defaultWeight: '135 lb' },
      { id: 'leg-press', name: 'Leg Press', isAnchor: false, formNote: 'Feet shoulder-width, full ROM, do not lock knees at top', sets: 3, reps: '12', defaultWeight: '270 lb' },
      { id: 'leg-curl', name: 'Lying Leg Curl', isAnchor: false, formNote: 'Toes pointed, squeeze hamstring at top, 3s eccentric', sets: 3, reps: '15', defaultWeight: '90 lb' },
      { id: 'calf-raises', name: 'Standing Calf Raise', isAnchor: false, formNote: 'Full stretch at bottom, 1s pause, squeeze hard at top', sets: 4, reps: '20', defaultWeight: '135 lb' },
      { id: 'leg-ext', name: 'Leg Extension', isAnchor: false, formNote: 'Controlled movement, squeeze quad at full extension', sets: 3, reps: '15', defaultWeight: '80 lb' },
    ],
  },
  4: {
    type: 'Upper',
    label: 'Upper — Deadlift + Full Upper',
    exercises: [
      { id: 'deadlift', name: 'Conventional Deadlift', isAnchor: true, formNote: 'Hips back, bar over mid-foot, big air breath, drive floor away', sets: 3, reps: '4', defaultWeight: '225 lb' },
      { id: 'bench-upper', name: 'Bench Press', isAnchor: false, formNote: 'Same cues as Monday, focus on power and speed', sets: 3, reps: '8', defaultWeight: '175 lb' },
      { id: 'pullup', name: 'Pull-ups', isAnchor: false, formNote: 'Full dead hang, chin clears bar, control the descent', sets: 3, reps: 'AMRAP', defaultWeight: 'BW' },
      { id: 'db-row', name: 'Single-Arm DB Row', isAnchor: false, formNote: 'Knee on bench, pull elbow to hip pocket, big range of motion', sets: 3, reps: '10', defaultWeight: '80 lb' },
      { id: 'ohp-upper', name: 'Overhead Press', isAnchor: false, formNote: 'Strict, no leg drive today, vertical bar path', sets: 3, reps: '10', defaultWeight: '85 lb' },
      { id: 'dips', name: 'Weighted Dips', isAnchor: false, formNote: 'Slight forward lean, elbows flare slightly, full depth', sets: 3, reps: 'AMRAP', defaultWeight: 'BW' },
    ],
  },
  5: {
    type: 'Legs+Core',
    label: 'Legs + Core — Volume & Conditioning',
    exercises: [
      { id: 'front-squat', name: 'Front Squat', isAnchor: true, formNote: 'Elbows high, upright torso, depth below parallel, stay tight', sets: 4, reps: '8', defaultWeight: '135 lb' },
      { id: 'leg-press-fri', name: 'Leg Press', isAnchor: false, formNote: 'High foot position for glutes, slow 3s down, explode up', sets: 4, reps: '15', defaultWeight: '250 lb' },
      { id: 'leg-curl-fri', name: 'Seated Leg Curl', isAnchor: false, formNote: 'Toes dorsiflexed, squeeze at peak, 3s eccentric', sets: 3, reps: '15', defaultWeight: '80 lb' },
      { id: 'calf-raises-fri', name: 'Calf Raises', isAnchor: false, formNote: 'Full stretch at bottom, pause, explosive up', sets: 4, reps: '20', defaultWeight: '135 lb' },
      { id: 'plank', name: 'Plank Hold', isAnchor: false, formNote: 'Brace like a punch is coming, glutes squeezed, neutral spine', sets: 3, reps: '60s', defaultWeight: 'BW' },
      { id: 'ab-wheel', name: 'Ab Wheel Rollout', isAnchor: false, formNote: 'From knees, extend fully, pull back with lats and abs', sets: 3, reps: '12', defaultWeight: 'BW' },
    ],
  },
};

const pplWeek2: Partial<Record<string, { reps: string; defaultWeight: string }>> = {
  'bench-press':  { reps: '10', defaultWeight: '165 lb' },
  'ohp':          { reps: '12', defaultWeight: '85 lb' },
  'incline-db':   { reps: '15', defaultWeight: '55 lb' },
  'barbell-row':  { reps: '10', defaultWeight: '140 lb' },
  'lat-pulldown': { reps: '15', defaultWeight: '110 lb' },
  'squat':        { reps: '10', defaultWeight: '165 lb' },
  'rdl':          { reps: '15', defaultWeight: '115 lb' },
  'deadlift':     { reps: '6',  defaultWeight: '205 lb' },
  'bench-upper':  { reps: '12', defaultWeight: '155 lb' },
  'front-squat':  { reps: '12', defaultWeight: '115 lb' },
  'leg-press':    { reps: '15', defaultWeight: '250 lb' },
};

// ─── Upper / Lower ────────────────────────────────────────────────────────────

const ulSchedule: Record<number, WorkoutDay> = {
  0: { type: 'Rest', label: 'Rest Day', exercises: [] },
  3: { type: 'Rest', label: 'Rest Day', exercises: [] },
  6: { type: 'Rest', label: 'Rest Day', exercises: [] },
  1: {
    type: 'Upper',
    label: 'Upper A — Push Emphasis',
    exercises: [
      { id: 'ul-bench',    name: 'Barbell Bench Press', isAnchor: true,  formNote: 'Tuck elbows 45°, pause at chest, leg drive through full lockout', sets: 4, reps: '5', defaultWeight: '190 lb' },
      { id: 'ul-row-a',   name: 'Barbell Row',          isAnchor: false, formNote: 'Hip hinge, chest up, pull to lower sternum, retract scapula',     sets: 4, reps: '5', defaultWeight: '160 lb' },
      { id: 'ul-ohp-a',   name: 'Overhead Press',       isAnchor: false, formNote: 'Brace hard, ribs down, vertical bar path, full lockout',           sets: 3, reps: '8', defaultWeight: '100 lb' },
      { id: 'ul-pullup-a',name: 'Pull-ups',              isAnchor: false, formNote: 'Full dead hang, chin clears bar, slow 3s descent',                 sets: 3, reps: 'AMRAP', defaultWeight: 'BW' },
      { id: 'ul-incline', name: 'Incline DB Press',     isAnchor: false, formNote: '30° incline, elbows at 75°, full stretch at bottom',               sets: 3, reps: '10', defaultWeight: '65 lb' },
      { id: 'ul-lat-a',   name: 'Cable Lateral Raise',  isAnchor: false, formNote: 'Lead with elbows, slight forward lean, 3s eccentric',              sets: 3, reps: '15', defaultWeight: '15 lb' },
    ],
  },
  2: {
    type: 'Lower',
    label: 'Lower A — Squat Emphasis',
    exercises: [
      { id: 'ul-squat',   name: 'Barbell Back Squat',   isAnchor: true,  formNote: 'Brace hard, depth below parallel, knees track toes, stay tall',   sets: 4, reps: '5', defaultWeight: '195 lb' },
      { id: 'ul-rdl-a',   name: 'Romanian Deadlift',    isAnchor: false, formNote: 'Hip hinge, soft knee, bar drags down shins, feel the hamstring',   sets: 3, reps: '10', defaultWeight: '135 lb' },
      { id: 'ul-legpress-a', name: 'Leg Press',         isAnchor: false, formNote: 'Feet shoulder-width, full ROM, do not lock knees at top',          sets: 3, reps: '12', defaultWeight: '270 lb' },
      { id: 'ul-legcurl-a',  name: 'Lying Leg Curl',    isAnchor: false, formNote: 'Toes pointed, squeeze hamstring at top, 3s eccentric',             sets: 3, reps: '12', defaultWeight: '90 lb' },
      { id: 'ul-calf-a',  name: 'Standing Calf Raise',  isAnchor: false, formNote: 'Full stretch at bottom, 1s pause, explosive up',                  sets: 4, reps: '15', defaultWeight: '135 lb' },
    ],
  },
  4: {
    type: 'Upper',
    label: 'Upper B — Pull Emphasis',
    exercises: [
      { id: 'ul-ohp-b',   name: 'Overhead Press',       isAnchor: true,  formNote: 'Brace hard, ribs down, vertical bar path, full lockout overhead', sets: 4, reps: '5', defaultWeight: '100 lb' },
      { id: 'ul-bench-b', name: 'Bench Press',           isAnchor: false, formNote: 'Same cues as Monday, focus on bar speed',                         sets: 3, reps: '8', defaultWeight: '175 lb' },
      { id: 'ul-pullup-b',name: 'Pull-ups',              isAnchor: false, formNote: 'Full dead hang, chin clears bar, control the descent',             sets: 4, reps: 'AMRAP', defaultWeight: 'BW' },
      { id: 'ul-row-b',   name: 'Barbell Row',           isAnchor: false, formNote: 'Hip hinge, chest up, pull bar to lower sternum',                  sets: 3, reps: '8', defaultWeight: '155 lb' },
      { id: 'ul-facepull',name: 'Face Pull',             isAnchor: false, formNote: 'Pull to forehead level, external rotate, elbows high',            sets: 3, reps: '20', defaultWeight: '40 lb' },
      { id: 'ul-dips',    name: 'Weighted Dips',         isAnchor: false, formNote: 'Slight forward lean, elbows flare slightly, full depth',           sets: 3, reps: 'AMRAP', defaultWeight: 'BW' },
    ],
  },
  5: {
    type: 'Lower',
    label: 'Lower B — Deadlift Emphasis',
    exercises: [
      { id: 'ul-deadlift', name: 'Conventional Deadlift', isAnchor: true,  formNote: 'Hips back, bar over mid-foot, big breath, drive floor away',     sets: 3, reps: '5', defaultWeight: '235 lb' },
      { id: 'ul-frontsq',  name: 'Front Squat',           isAnchor: false, formNote: 'Elbows high, upright torso, depth below parallel',               sets: 3, reps: '8', defaultWeight: '135 lb' },
      { id: 'ul-legpress-b', name: 'Leg Press',           isAnchor: false, formNote: 'High foot position, slow 3s eccentric, explode up',              sets: 3, reps: '15', defaultWeight: '250 lb' },
      { id: 'ul-legcurl-b',  name: 'Seated Leg Curl',     isAnchor: false, formNote: 'Toes dorsiflexed, squeeze at peak, 3s eccentric',               sets: 3, reps: '15', defaultWeight: '85 lb' },
      { id: 'ul-calf-b',   name: 'Calf Raises',           isAnchor: false, formNote: 'Full stretch at bottom, pause at top, controlled down',          sets: 4, reps: '20', defaultWeight: '135 lb' },
    ],
  },
};

const ulWeek2: Partial<Record<string, { reps: string; defaultWeight: string }>> = {
  'ul-bench':    { reps: '8',  defaultWeight: '175 lb' },
  'ul-row-a':   { reps: '8',  defaultWeight: '145 lb' },
  'ul-ohp-a':   { reps: '12', defaultWeight: '90 lb' },
  'ul-squat':   { reps: '8',  defaultWeight: '175 lb' },
  'ul-ohp-b':   { reps: '8',  defaultWeight: '90 lb' },
  'ul-deadlift':{ reps: '8',  defaultWeight: '215 lb' },
};

// ─── 5/3/1 ────────────────────────────────────────────────────────────────────

const fslSchedule: Record<number, WorkoutDay> = {
  0: { type: 'Rest', label: 'Rest Day', exercises: [] },
  3: { type: 'Rest', label: 'Rest Day', exercises: [] },
  6: { type: 'Rest', label: 'Rest Day', exercises: [] },
  1: {
    type: 'Squat',
    label: 'Squat — Main Lift + Accessories',
    exercises: [
      { id: 'fsl-squat',    name: 'Barbell Back Squat',  isAnchor: true,  formNote: 'Brace hard, depth below parallel, knees track toes, stay tall',  sets: 3, reps: '5', defaultWeight: '185 lb' },
      { id: 'fsl-fsq',      name: 'Front Squat',         isAnchor: false, formNote: 'Elbows high, upright torso — supplemental volume at 60% 1RM',    sets: 5, reps: '10', defaultWeight: '115 lb' },
      { id: 'fsl-legpress', name: 'Leg Press',            isAnchor: false, formNote: 'Feet shoulder-width, full ROM, controlled eccentric',            sets: 3, reps: '15', defaultWeight: '250 lb' },
      { id: 'fsl-legcurl',  name: 'Lying Leg Curl',       isAnchor: false, formNote: 'Toes pointed, squeeze hamstring at top, 3s eccentric',           sets: 3, reps: '15', defaultWeight: '90 lb' },
      { id: 'fsl-calf',     name: 'Calf Raise',           isAnchor: false, formNote: 'Full stretch at bottom, 1s pause, squeeze hard at top',          sets: 5, reps: '10', defaultWeight: '135 lb' },
    ],
  },
  2: {
    type: 'Bench',
    label: 'Bench — Main Lift + Accessories',
    exercises: [
      { id: 'fsl-bench',    name: 'Barbell Bench Press',  isAnchor: true,  formNote: 'Tuck elbows 45°, pause at chest, drive through full lockout',    sets: 3, reps: '5', defaultWeight: '190 lb' },
      { id: 'fsl-incline',  name: 'Incline DB Press',     isAnchor: false, formNote: '30° incline — supplemental volume at 60% 1RM',                  sets: 5, reps: '10', defaultWeight: '60 lb' },
      { id: 'fsl-fly',      name: 'Cable Chest Fly',      isAnchor: false, formNote: 'Slight elbow bend throughout, feel the pec stretch at bottom',   sets: 3, reps: '15', defaultWeight: '25 lb' },
      { id: 'fsl-tricep',   name: 'Tricep Pushdown',      isAnchor: false, formNote: 'Elbows pinned to sides, squeeze fully at bottom',                sets: 3, reps: '15', defaultWeight: '50 lb' },
      { id: 'fsl-lat-b',    name: 'Cable Lateral Raise',  isAnchor: false, formNote: 'Lead with elbows, slight forward lean, 3s eccentric',            sets: 3, reps: '15', defaultWeight: '15 lb' },
    ],
  },
  4: {
    type: 'Deadlift',
    label: 'Deadlift — Main Lift + Accessories',
    exercises: [
      { id: 'fsl-deadlift', name: 'Conventional Deadlift', isAnchor: true,  formNote: 'Hips back, bar over mid-foot, big air breath, drive floor away', sets: 3, reps: '5', defaultWeight: '235 lb' },
      { id: 'fsl-rdl',      name: 'Romanian Deadlift',     isAnchor: false, formNote: 'Hip hinge, soft knee — supplemental volume at 60% 1RM',         sets: 5, reps: '10', defaultWeight: '135 lb' },
      { id: 'fsl-pulldown', name: 'Lat Pulldown',          isAnchor: false, formNote: 'Slight lean back, pull to upper chest, slow 3s ascent',         sets: 3, reps: '12', defaultWeight: '120 lb' },
      { id: 'fsl-cabrow',   name: 'Seated Cable Row',      isAnchor: false, formNote: 'Neutral spine, drive elbows back, pause at waist',              sets: 3, reps: '12', defaultWeight: '100 lb' },
      { id: 'fsl-curl',     name: 'Barbell Curl',          isAnchor: false, formNote: 'No elbow swing, full ROM, squeeze bicep hard at top',           sets: 3, reps: '12', defaultWeight: '65 lb' },
    ],
  },
  5: {
    type: 'OHP',
    label: 'OHP — Main Lift + Accessories',
    exercises: [
      { id: 'fsl-ohp',      name: 'Overhead Press',        isAnchor: true,  formNote: 'Brace hard, ribs down, vertical bar path, full lock overhead',  sets: 3, reps: '5', defaultWeight: '95 lb' },
      { id: 'fsl-pullup',   name: 'Pull-ups',              isAnchor: false, formNote: 'Full dead hang, chin clears bar, slow 3s descent',              sets: 5, reps: 'AMRAP', defaultWeight: 'BW' },
      { id: 'fsl-dbrow',    name: 'Single-Arm DB Row',     isAnchor: false, formNote: 'Knee on bench, pull elbow to hip pocket, big range of motion',  sets: 3, reps: '12', defaultWeight: '80 lb' },
      { id: 'fsl-facepull', name: 'Face Pull',             isAnchor: false, formNote: 'Pull to forehead level, external rotate, elbows high',          sets: 3, reps: '20', defaultWeight: '40 lb' },
      { id: 'fsl-hammer',   name: 'Hammer Curl',           isAnchor: false, formNote: 'Neutral grip, alternate arms, 2s eccentric',                   sets: 3, reps: '15', defaultWeight: '30 lb' },
    ],
  },
};

const fslWeek2: Partial<Record<string, { reps: string; defaultWeight: string }>> = {
  'fsl-squat':    { reps: '3', defaultWeight: '210 lb' },
  'fsl-bench':    { reps: '3', defaultWeight: '215 lb' },
  'fsl-deadlift': { reps: '3', defaultWeight: '260 lb' },
  'fsl-ohp':      { reps: '3', defaultWeight: '105 lb' },
};

// ─── Programs registry ────────────────────────────────────────────────────────

export const programs: WorkoutProgram[] = [
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    tag: 'PPL',
    description: '5 days · strength & hypertrophy',
    schedule: pplSchedule,
    weekOverrides: pplWeek2,
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower',
    tag: 'U/L',
    description: '4 days · strength split',
    schedule: ulSchedule,
    weekOverrides: ulWeek2,
  },
  {
    id: '531',
    name: '5/3/1',
    tag: '5/3/1',
    description: '4 days · main lifts + BBB',
    schedule: fslSchedule,
    weekOverrides: fslWeek2,
  },
];

export function getProgram(id: string): WorkoutProgram {
  return programs.find((p) => p.id === id) ?? programs[0];
}

export function getWorkoutForDay(dayIndex: number, week: 1 | 2, programId = 'ppl'): WorkoutDay {
  const program = getProgram(programId);
  const base = program.schedule[dayIndex] ?? { type: 'Rest' as WorkoutType, label: 'Rest Day', exercises: [] };
  if (week === 1 || !program.weekOverrides || base.type === 'Rest') return base;

  return {
    ...base,
    exercises: base.exercises.map((ex) => {
      const override = program.weekOverrides![ex.id];
      return override ? { ...ex, ...override } : ex;
    }),
  };
}
