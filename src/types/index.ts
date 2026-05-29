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
