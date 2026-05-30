export type PhotoCategory = 'Front' | 'Back' | 'Side' | 'Other';

export interface ProgressPhoto {
  id: string;
  clientId: string;
  url: string;
  thumbnailUrl: string;
  date: string;
  category: PhotoCategory;
  notes?: string;
  weight?: number;
  bodyFatPercentage?: number;
  trainerNotes?: string;
  isMilestone?: boolean;
  isGoalAchieved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  avatar: string;
  status: 'Active' | 'Inactive' | 'On Hold';
  clientId: string;
  age: number;
  sex: string;
  weight: number;
  bodyFat: number;
  sessions: number;
  goalWeight: number;
  startWeight: number;
  startDate: string;
  program: string;
  programPhase: string;
}

// ── Program Builder Types ──

export type SetType = 'Normal' | 'Warm-up' | 'Drop Set' | 'To Failure' | 'AMRAP';
export type SetStatus = 'done' | 'empty';
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
  _dayIndex?: number;
  _method?: string;
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

// ── Saved Program (from All-in-One Creator) ──

export interface CreatorExercise {
  code: string;
  name: string;
  sets: number;
  reps: string;
  pct1RM: string;
  tempo: string;
  rest: string;
}

export interface ClientProfile {
  experience: string;
  equipment: string;
  timePerSession: number;
}

export interface DayExercise {
  code: string;
  name: string;
  sets: number;
  reps: string;
  pct1RM: string;
  tempo: string;
  rest: string;
}

export interface DayData {
  day: string;
  dayNumber: number;
  method: string;
  exercises: DayExercise[];
}

export interface ProgramData {
  id?: string;
  goal: string;
  method: string;
  clientContext: {
    ageRange: string;
    experience: string;
    bodyType: string;
    availability: string;
    limitations: string[];
    otherLimitation: string;
  };
  phases: { id: string; name: string; weeks: number; focus: string; color: string; active: boolean }[];
  weeklyHours: number;
  split: { day: string; active: boolean; workout: string }[];
  exercises: CreatorExercise[];
  programName: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  assignedClient: string;
  template?: string;
  trainingMethod?: string;
  clientProfile?: ClientProfile;
  totalSets?: number;
  days?: DayData[];
}

export interface SavedProgram {
  id: string;
  createdAt: string;
  updatedAt: string;
  data: ProgramData;
}

// ── Program Matcher Types ──

export interface ClientPreferences {
  goal: string;
  daysPerWeek: number;
  experience: string;
  equipment: string;
  timePerSession: number;
  limitations?: string[];
}

export interface MatchBreakdown {
  goalScore: number;
  daysScore: number;
  experienceScore: number;
  equipmentScore: number;
  timeScore: number;
  bonusScore: number;
}

export interface MatchResult {
  program: SavedProgram;
  score: number;
  maxScore: number;
  percentage: number;
  breakdown: MatchBreakdown;
  exactDayMatch: boolean;
}

export interface MatchingRules {
  version: string;
  generatedAt: string;
  goalMethodMatrix: Array<{ goal: string; method: string; score: number }>;
  goalProgramPipelines: Array<{ goal: string; method: string; program: string; score: number }>;
  canonicalLists: Record<string, string[]>;
  equipmentCompatibility: Record<string, string[]>;
  experienceMethodPreference: Record<string, string[]>;
  scoringWeights: {
    goal: number;
    days: number;
    experience: number;
    equipment: number;
    time: number;
  };
}
