// ── Program Builder Types ── Add these to your existing src/types/index.ts

export type SetType = 'Normal' | 'Warm-up' | 'Drop Set' | 'To Failure' | 'AMRAP';
export type SetStatus = 'done' | 'warning' | 'empty';
export type ExerciseUnit = 'kg' | 'lbs';

export interface ExerciseSet {
  set: number;
  prescribed: string;
  clientLoad: string;
  load: string;
  reps: string;
  rpe: string;
  rest: string;
  type: SetType;
  done: SetStatus;
  note?: string;
  lastWeekLoad?: string;
  lastWeekReps?: string;
}

export interface Exercise {
  id: string;
  name: string;
  scheme: string;
  target: string;
  unit: ExerciseUnit;
  sets: ExerciseSet[];
  muscleGroup: string;
  _expanded?: boolean;
  _showNotes?: boolean;
}

export interface WorkoutSession {
  name: string;
  exercises: Exercise[];
  startTime?: Date;
}

export interface LiftRecord {
  val: string;
  date: string;
}

export type LiftRecordsMap = Record<string, Record<string, LiftRecord>>;
