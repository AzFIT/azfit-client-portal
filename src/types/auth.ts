export interface Coach {
  id: string
  fullName: string
  email: string
  passwordHash: string
  businessName: string
  specialty: string
  yearsExperience: number
  role: 'admin' | 'coach'
  createdAt: string
  lastLogin: string
  settings: {
    theme: 'dark' | 'light'
    unitSystem: 'metric' | 'imperial'
    defaultSessionDuration: number
  }
}

export interface Client {
  id: string
  coachId: string
  personal: {
    fullName: string
    email: string
    phone: string
    dateOfBirth: string
    gender: 'male' | 'female' | 'other'
    age: number
    emergencyContact: {
      name: string
      phone: string
    }
  }
  goals: {
    primary: string
    secondary: string
    experienceLevel: string
    equipment: string[]
    sessionsPerWeek: number
    sessionDuration: number
  }
  bodyAssessment: {
    weight: number // kg
    height: number // cm
    bmi: number
    skinfolds: Record<string, number | undefined>
    sumOfSkinfolds: number
    bodyFatPercent: number
    leanMass: number
    fatMass: number
    circumferences: Record<string, number | undefined>
  }
  tdee: {
    bmr: number
    tdee: number
    activityLevel: string
    bodyFatPercent: number
  }
  medical: {
    injuries: string
    medications: string
    allergies: string
    clearedToExercise: string
    restrictions: string
    safetyCheckboxes: Record<string, boolean>
  }
  nutrition: {
    maintenanceCalories: number
    fatLossCalories: number
    aggressiveFatLoss: number
    muscleGainCalories: number
    dietPreference: 'balanced' | 'lowCarb' | 'highCarb' | 'highProtein'
    macros: Record<string, { protein: number; carbs: number; fat: number; calories: number }>
  }
  status: 'active' | 'paused' | 'archived'
  createdAt: string
  updatedAt: string
  assessmentHistory?: AssessmentRecord[]
}

export interface AssessmentRecord {
  date: string
  weight: number
  bodyFatPercent: number
  skinfolds: Record<string, number | undefined>
  circumferences: Record<string, number | undefined>
  tdee: number
  bmr: number
}
