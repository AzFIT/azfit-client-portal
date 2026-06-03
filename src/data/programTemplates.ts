export interface ProgramTemplate {
  id: string
  name: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  durationWeeks: number
  frequency: number
  split: string
  focus: string
  equipment: string
  sets: string
  reps: string
  description: string
}

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  { id: 'PRG001', name: 'Hypertrophy Upper/Lower', category: 'Hypertrophy', level: 'Beginner', durationWeeks: 4, frequency: 5, split: 'Upper/Lower', focus: 'Hypertrophy', equipment: 'Full Gym + Cables', sets: '3-4', reps: '8-12', description: '4-week hypertrophy program using upper/lower split. 5x/week, ~45min/session.' },
  { id: 'PRG002', name: 'Hypertrophy Upper/Lower', category: 'Hypertrophy', level: 'Intermediate', durationWeeks: 12, frequency: 5, split: 'Upper/Lower', focus: 'Hypertrophy', equipment: 'Full Gym', sets: '3-4', reps: '8-12', description: '12-week hypertrophy program using upper/lower split. 5x/week, ~75min/session.' },
  { id: 'PRG003', name: 'Hypertrophy Upper/Lower', category: 'Hypertrophy', level: 'Advanced', durationWeeks: 16, frequency: 5, split: 'Upper/Lower', focus: 'Hypertrophy', equipment: 'Dumbbells Only', sets: '3-4', reps: '8-12', description: '16-week hypertrophy program using upper/lower split. 5x/week, ~60min/session.' },
  { id: 'PRG004', name: 'Hypertrophy Push/Pull/Legs', category: 'Hypertrophy', level: 'Beginner', durationWeeks: 16, frequency: 6, split: 'Push/Pull/Legs', focus: 'Hypertrophy', equipment: 'Full Gym', sets: '3-4', reps: '8-12', description: '16-week hypertrophy program using push/pull/legs split. 6x/week, ~45min/session.' },
  { id: 'PRG005', name: 'Hypertrophy Push/Pull/Legs', category: 'Hypertrophy', level: 'Intermediate', durationWeeks: 4, frequency: 3, split: 'Push/Pull/Legs', focus: 'Hypertrophy', equipment: 'Dumbbells Only', sets: '3-4', reps: '8-12', description: '4-week hypertrophy program using push/pull/legs split. 3x/week, ~45min/session.' },
  { id: 'PRG006', name: 'Hypertrophy Push/Pull/Legs', category: 'Hypertrophy', level: 'Advanced', durationWeeks: 8, frequency: 6, split: 'Push/Pull/Legs', focus: 'Hypertrophy', equipment: 'Minimal', sets: '3-4', reps: '8-12', description: '8-week hypertrophy program using push/pull/legs split. 6x/week, ~90min/session.' },
  { id: 'PRG007', name: 'Hypertrophy Bro Split', category: 'Hypertrophy', level: 'Beginner', durationWeeks: 8, frequency: 5, split: 'Bro Split', focus: 'Hypertrophy', equipment: 'Dumbbells Only', sets: '3-4', reps: '8-12', description: '8-week hypertrophy program using bro split. 5x/week, ~90min/session.' },
  { id: 'PRG008', name: 'Hypertrophy Bro Split', category: 'Hypertrophy', level: 'Intermediate', durationWeeks: 16, frequency: 5, split: 'Bro Split', focus: 'Hypertrophy', equipment: 'Full Gym + Cables', sets: '3-4', reps: '8-12', description: '16-week hypertrophy program using bro split. 5x/week, ~45min/session.' },
  { id: 'PRG009', name: 'Hypertrophy Bro Split', category: 'Hypertrophy', level: 'Advanced', durationWeeks: 16, frequency: 6, split: 'Bro Split', focus: 'Hypertrophy', equipment: 'Minimal', sets: '3-4', reps: '8-12', description: '16-week hypertrophy program using bro split. 6x/week, ~90min/session.' },
  { id: 'PRG010', name: 'Hypertrophy Full Body', category: 'Hypertrophy', level: 'Beginner', durationWeeks: 6, frequency: 3, split: 'Full Body', focus: 'Hypertrophy', equipment: 'Minimal', sets: '3-4', reps: '8-12', description: '6-week hypertrophy program using full body split. 3x/week, ~90min/session.' },
  { id: 'PRG011', name: 'Hypertrophy Full Body', category: 'Hypertrophy', level: 'Intermediate', durationWeeks: 16, frequency: 6, split: 'Full Body', focus: 'Hypertrophy', equipment: 'Full Gym + Cables', sets: '3-4', reps: '8-12', description: '16-week hypertrophy program using full body split. 6x/week, ~45min/session.' },
  { id: 'PRG012', name: 'Hypertrophy Full Body', category: 'Hypertrophy', level: 'Advanced', durationWeeks: 4, frequency: 4, split: 'Full Body', focus: 'Hypertrophy', equipment: 'Minimal', sets: '3-4', reps: '8-12', description: '4-week hypertrophy program using full body split. 4x/week, ~45min/session.' },
  { id: 'PRG013', name: 'Strength Upper/Lower', category: 'Strength', level: 'Beginner', durationWeeks: 12, frequency: 3, split: 'Upper/Lower', focus: 'Strength', equipment: 'Full Gym + Cables', sets: '4-5', reps: '3-5', description: '12-week strength program using upper/lower split. 3x/week, ~75min/session.' },
  { id: 'PRG014', name: 'Strength Upper/Lower', category: 'Strength', level: 'Intermediate', durationWeeks: 16, frequency: 6, split: 'Upper/Lower', focus: 'Strength', equipment: 'Dumbbells Only', sets: '4-5', reps: '3-5', description: '16-week strength program using upper/lower split. 6x/week, ~60min/session.' },
  { id: 'PRG015', name: 'Strength Upper/Lower', category: 'Strength', level: 'Advanced', durationWeeks: 12, frequency: 3, split: 'Upper/Lower', focus: 'Strength', equipment: 'Dumbbells Only', sets: '4-5', reps: '3-5', description: '12-week strength program using upper/lower split. 3x/week, ~45min/session.' },
  { id: 'PRG016', name: 'Strength Push/Pull', category: 'Strength', level: 'Beginner', durationWeeks: 8, frequency: 5, split: 'Push/Pull', focus: 'Strength', equipment: 'Full Gym + Cables', sets: '4-5', reps: '3-5', description: '8-week strength program using push/pull split. 5x/week, ~75min/session.' },
  { id: 'PRG017', name: 'Strength Push/Pull', category: 'Strength', level: 'Intermediate', durationWeeks: 4, frequency: 3, split: 'Push/Pull', focus: 'Strength', equipment: 'Full Gym', sets: '4-5', reps: '3-5', description: '4-week strength program using push/pull split. 3x/week, ~75min/session.' },
  { id: 'PRG018', name: 'Strength Push/Pull', category: 'Strength', level: 'Advanced', durationWeeks: 16, frequency: 6, split: 'Push/Pull', focus: 'Strength', equipment: 'Bodyweight', sets: '4-5', reps: '3-5', description: '16-week strength program using push/pull split. 6x/week, ~45min/session.' },
  { id: 'PRG019', name: 'Strength Full Body', category: 'Strength', level: 'Beginner', durationWeeks: 4, frequency: 5, split: 'Full Body', focus: 'Strength', equipment: 'Full Gym + Cables', sets: '4-5', reps: '3-5', description: '4-week strength program using full body split. 5x/week, ~75min/session.' },
  { id: 'PRG020', name: 'Strength Full Body', category: 'Strength', level: 'Intermediate', durationWeeks: 8, frequency: 6, split: 'Full Body', focus: 'Strength', equipment: 'Full Gym', sets: '4-5', reps: '3-5', description: '8-week strength program using full body split. 6x/week, ~75min/session.' },
  { id: 'PRG021', name: 'Strength Full Body', category: 'Strength', level: 'Advanced', durationWeeks: 12, frequency: 3, split: 'Full Body', focus: 'Strength', equipment: 'Minimal', sets: '4-5', reps: '3-5', description: '12-week strength program using full body split. 3x/week, ~60min/session.' },
  { id: 'PRG022', name: 'Strength Conjugate', category: 'Strength', level: 'Beginner', durationWeeks: 4, frequency: 3, split: 'Conjugate', focus: 'Strength', equipment: 'Bodyweight', sets: '4-5', reps: '3-5', description: '4-week strength program using conjugate split. 3x/week, ~90min/session.' },
  { id: 'PRG023', name: 'Strength Conjugate', category: 'Strength', level: 'Intermediate', durationWeeks: 8, frequency: 6, split: 'Conjugate', focus: 'Strength', equipment: 'Dumbbells Only', sets: '4-5', reps: '3-5', description: '8-week strength program using conjugate split. 6x/week, ~75min/session.' },
  { id: 'PRG024', name: 'Strength Conjugate', category: 'Strength', level: 'Advanced', durationWeeks: 4, frequency: 4, split: 'Conjugate', focus: 'Strength', equipment: 'Full Gym + Cables', sets: '4-5', reps: '3-5', description: '4-week strength program using conjugate split. 4x/week, ~90min/session.' },
  { id: 'PRG025', name: 'Fat Loss Full Body', category: 'Fat Loss', level: 'Beginner', durationWeeks: 12, frequency: 3, split: 'Full Body', focus: 'Fat Loss', equipment: 'Full Gym + Cables', sets: '3-4', reps: '10-15', description: '12-week fat loss program using full body split. 3x/week, ~75min/session.' },
  { id: 'PRG026', name: 'Fat Loss Full Body', category: 'Fat Loss', level: 'Intermediate', durationWeeks: 12, frequency: 5, split: 'Full Body', focus: 'Fat Loss', equipment: 'Full Gym', sets: '3-4', reps: '10-15', description: '12-week fat loss program using full body split. 5x/week, ~90min/session.' },
  { id: 'PRG027', name: 'Fat Loss Full Body', category: 'Fat Loss', level: 'Advanced', durationWeeks: 16, frequency: 4, split: 'Full Body', focus: 'Fat Loss', equipment: 'Bodyweight', sets: '3-4', reps: '10-15', description: '16-week fat loss program using full body split. 4x/week, ~75min/session.' },
  { id: 'PRG028', name: 'Fat Loss Upper/Lower', category: 'Fat Loss', level: 'Beginner', durationWeeks: 8, frequency: 4, split: 'Upper/Lower', focus: 'Fat Loss', equipment: 'Full Gym', sets: '3-4', reps: '10-15', description: '8-week fat loss program using upper/lower split. 4x/week, ~75min/session.' },
  { id: 'PRG029', name: 'Fat Loss Upper/Lower', category: 'Fat Loss', level: 'Intermediate', durationWeeks: 6, frequency: 5, split: 'Upper/Lower', focus: 'Fat Loss', equipment: 'Full Gym + Cables', sets: '3-4', reps: '10-15', description: '6-week fat loss program using upper/lower split. 5x/week, ~75min/session.' },
  { id: 'PRG030', name: 'Fat Loss Upper/Lower', category: 'Fat Loss', level: 'Advanced', durationWeeks: 6, frequency: 4, split: 'Upper/Lower', focus: 'Fat Loss', equipment: 'Dumbbells Only', sets: '3-4', reps: '10-15', description: '6-week fat loss program using upper/lower split. 4x/week, ~45min/session.' },
  { id: 'PRG031', name: 'Fat Loss Circuit', category: 'Fat Loss', level: 'Beginner', durationWeeks: 4, frequency: 5, split: 'Circuit', focus: 'Fat Loss', equipment: 'Minimal', sets: '3-4', reps: '10-15', description: '4-week fat loss program using circuit split. 5x/week, ~45min/session.' },
  { id: 'PRG032', name: 'Fat Loss Circuit', category: 'Fat Loss', level: 'Intermediate', durationWeeks: 16, frequency: 4, split: 'Circuit', focus: 'Fat Loss', equipment: 'Full Gym + Cables', sets: '3-4', reps: '10-15', description: '16-week fat loss program using circuit split. 4x/week, ~90min/session.' },
  { id: 'PRG033', name: 'Fat Loss Circuit', category: 'Fat Loss', level: 'Advanced', durationWeeks: 8, frequency: 6, split: 'Circuit', focus: 'Fat Loss', equipment: 'Full Gym + Cables', sets: '3-4', reps: '10-15', description: '8-week fat loss program using circuit split. 6x/week, ~75min/session.' },
  { id: 'PRG034', name: 'Fat Loss HIIT/Strength', category: 'Fat Loss', level: 'Beginner', durationWeeks: 6, frequency: 3, split: 'HIIT/Strength', focus: 'Fat Loss', equipment: 'Minimal', sets: '3-4', reps: '10-15', description: '6-week fat loss program using HIIT/strength split. 3x/week, ~90min/session.' },
  { id: 'PRG035', name: 'Fat Loss HIIT/Strength', category: 'Fat Loss', level: 'Intermediate', durationWeeks: 4, frequency: 5, split: 'HIIT/Strength', focus: 'Fat Loss', equipment: 'Minimal', sets: '3-4', reps: '10-15', description: '4-week fat loss program using HIIT/strength split. 5x/week, ~90min/session.' },
  { id: 'PRG036', name: 'Fat Loss HIIT/Strength', category: 'Fat Loss', level: 'Advanced', durationWeeks: 8, frequency: 4, split: 'HIIT/Strength', focus: 'Fat Loss', equipment: 'Minimal', sets: '3-4', reps: '10-15', description: '8-week fat loss program using HIIT/strength split. 4x/week, ~90min/session.' },
  { id: 'PRG037', name: 'Endurance Full Body', category: 'Endurance', level: 'Beginner', durationWeeks: 12, frequency: 3, split: 'Full Body', focus: 'Endurance', equipment: 'Full Gym + Cables', sets: '2-3', reps: '15-20', description: '12-week endurance program using full body split. 3x/week, ~90min/session.' },
  { id: 'PRG038', name: 'Endurance Full Body', category: 'Endurance', level: 'Intermediate', durationWeeks: 16, frequency: 6, split: 'Full Body', focus: 'Endurance', equipment: 'Full Gym', sets: '2-3', reps: '15-20', description: '16-week endurance program using full body split. 6x/week, ~75min/session.' },
  { id: 'PRG039', name: 'Endurance Full Body', category: 'Endurance', level: 'Advanced', durationWeeks: 16, frequency: 5, split: 'Full Body', focus: 'Endurance', equipment: 'Full Gym + Cables', sets: '2-3', reps: '15-20', description: '16-week endurance program using full body split. 5x/week, ~45min/session.' },
  { id: 'PRG040', name: 'Endurance Split', category: 'Endurance', level: 'Beginner', durationWeeks: 8, frequency: 3, split: 'Split', focus: 'Endurance', equipment: 'Bodyweight', sets: '2-3', reps: '15-20', description: '8-week endurance program using split split. 3x/week, ~90min/session.' },
  { id: 'PRG041', name: 'Endurance Split', category: 'Endurance', level: 'Intermediate', durationWeeks: 12, frequency: 5, split: 'Split', focus: 'Endurance', equipment: 'Bodyweight', sets: '2-3', reps: '15-20', description: '12-week endurance program using split split. 5x/week, ~90min/session.' },
  { id: 'PRG042', name: 'Endurance Split', category: 'Endurance', level: 'Advanced', durationWeeks: 12, frequency: 5, split: 'Split', focus: 'Endurance', equipment: 'Full Gym', sets: '2-3', reps: '15-20', description: '12-week endurance program using split split. 5x/week, ~75min/session.' },
  { id: 'PRG043', name: 'Endurance Triathlon', category: 'Endurance', level: 'Beginner', durationWeeks: 12, frequency: 6, split: 'Triathlon', focus: 'Endurance', equipment: 'Full Gym + Cables', sets: '2-3', reps: '15-20', description: '12-week endurance program using triathlon split. 6x/week, ~60min/session.' },
  { id: 'PRG044', name: 'Endurance Triathlon', category: 'Endurance', level: 'Intermediate', durationWeeks: 16, frequency: 4, split: 'Triathlon', focus: 'Endurance', equipment: 'Minimal', sets: '2-3', reps: '15-20', description: '16-week endurance program using triathlon split. 4x/week, ~75min/session.' },
  { id: 'PRG045', name: 'Endurance Triathlon', category: 'Endurance', level: 'Advanced', durationWeeks: 12, frequency: 5, split: 'Triathlon', focus: 'Endurance', equipment: 'Minimal', sets: '2-3', reps: '15-20', description: '12-week endurance program using triathlon split. 5x/week, ~45min/session.' },
  { id: 'PRG046', name: 'Athletic Upper/Lower', category: 'Performance', level: 'Beginner', durationWeeks: 4, frequency: 5, split: 'Upper/Lower', focus: 'Athletic', equipment: 'Dumbbells Only', sets: '3-5', reps: '6-8', description: '4-week athletic program using upper/lower split. 5x/week, ~75min/session.' },
  { id: 'PRG047', name: 'Athletic Upper/Lower', category: 'Performance', level: 'Intermediate', durationWeeks: 4, frequency: 3, split: 'Upper/Lower', focus: 'Athletic', equipment: 'Dumbbells Only', sets: '3-5', reps: '6-8', description: '4-week athletic program using upper/lower split. 3x/week, ~90min/session.' },
  { id: 'PRG048', name: 'Athletic Upper/Lower', category: 'Performance', level: 'Advanced', durationWeeks: 16, frequency: 4, split: 'Upper/Lower', focus: 'Athletic', equipment: 'Minimal', sets: '3-5', reps: '6-8', description: '16-week athletic program using upper/lower split. 4x/week, ~60min/session.' },
  { id: 'PRG049', name: 'Athletic Push/Pull', category: 'Performance', level: 'Beginner', durationWeeks: 8, frequency: 3, split: 'Push/Pull', focus: 'Athletic', equipment: 'Full Gym + Cables', sets: '3-5', reps: '6-8', description: '8-week athletic program using push/pull split. 3x/week, ~45min/session.' },
  { id: 'PRG050', name: 'Athletic Push/Pull', category: 'Performance', level: 'Intermediate', durationWeeks: 8, frequency: 4, split: 'Push/Pull', focus: 'Athletic', equipment: 'Full Gym + Cables', sets: '3-5', reps: '6-8', description: '8-week athletic program using push/pull split. 4x/week, ~45min/session.' },
  { id: 'PRG051', name: 'Athletic Push/Pull', category: 'Performance', level: 'Advanced', durationWeeks: 4, frequency: 3, split: 'Push/Pull', focus: 'Athletic', equipment: 'Full Gym + Cables', sets: '3-5', reps: '6-8', description: '4-week athletic program using push/pull split. 3x/week, ~90min/session.' },
  { id: 'PRG052', name: 'Athletic Sport Specific', category: 'Performance', level: 'Beginner', durationWeeks: 12, frequency: 4, split: 'Sport Specific', focus: 'Athletic', equipment: 'Dumbbells Only', sets: '3-5', reps: '6-8', description: '12-week athletic program using sport specific split. 4x/week, ~60min/session.' },
  { id: 'PRG053', name: 'Athletic Sport Specific', category: 'Performance', level: 'Intermediate', durationWeeks: 6, frequency: 3, split: 'Sport Specific', focus: 'Athletic', equipment: 'Full Gym', sets: '3-5', reps: '6-8', description: '6-week athletic program using sport specific split. 3x/week, ~90min/session.' },
  { id: 'PRG054', name: 'Athletic Sport Specific', category: 'Performance', level: 'Advanced', durationWeeks: 8, frequency: 3, split: 'Sport Specific', focus: 'Athletic', equipment: 'Dumbbells Only', sets: '3-5', reps: '6-8', description: '8-week athletic program using sport specific split. 3x/week, ~45min/session.' },
  { id: 'PRG055', name: 'Mobility Full Body', category: 'Recovery', level: 'Beginner', durationWeeks: 8, frequency: 4, split: 'Full Body', focus: 'Mobility', equipment: 'Full Gym', sets: '1-2', reps: '30s hold', description: '8-week mobility program using full body split. 4x/week, ~75min/session.' },
  { id: 'PRG056', name: 'Mobility Full Body', category: 'Recovery', level: 'Intermediate', durationWeeks: 8, frequency: 4, split: 'Full Body', focus: 'Mobility', equipment: 'Minimal', sets: '1-2', reps: '30s hold', description: '8-week mobility program using full body split. 4x/week, ~45min/session.' },
  { id: 'PRG057', name: 'Mobility Full Body', category: 'Recovery', level: 'Advanced', durationWeeks: 12, frequency: 4, split: 'Full Body', focus: 'Mobility', equipment: 'Full Gym + Cables', sets: '1-2', reps: '30s hold', description: '12-week mobility program using full body split. 4x/week, ~90min/session.' },
  { id: 'PRG058', name: 'Mobility Split', category: 'Recovery', level: 'Beginner', durationWeeks: 4, frequency: 6, split: 'Split', focus: 'Mobility', equipment: 'Minimal', sets: '1-2', reps: '30s hold', description: '4-week mobility program using split split. 6x/week, ~45min/session.' },
  { id: 'PRG059', name: 'Mobility Split', category: 'Recovery', level: 'Intermediate', durationWeeks: 4, frequency: 4, split: 'Split', focus: 'Mobility', equipment: 'Full Gym + Cables', sets: '1-2', reps: '30s hold', description: '4-week mobility program using split split. 4x/week, ~45min/session.' },
  { id: 'PRG060', name: 'Mobility Split', category: 'Recovery', level: 'Advanced', durationWeeks: 4, frequency: 6, split: 'Split', focus: 'Mobility', equipment: 'Minimal', sets: '1-2', reps: '30s hold', description: '4-week mobility program using split split. 6x/week, ~75min/session.' },
  { id: 'PRG061', name: 'Mobility Flow', category: 'Recovery', level: 'Beginner', durationWeeks: 4, frequency: 3, split: 'Flow', focus: 'Mobility', equipment: 'Bodyweight', sets: '1-2', reps: '30s hold', description: '4-week mobility program using flow split. 3x/week, ~45min/session.' },
  { id: 'PRG062', name: 'Mobility Flow', category: 'Recovery', level: 'Intermediate', durationWeeks: 4, frequency: 4, split: 'Flow', focus: 'Mobility', equipment: 'Dumbbells Only', sets: '1-2', reps: '30s hold', description: '4-week mobility program using flow split. 4x/week, ~90min/session.' },
  { id: 'PRG063', name: 'Mobility Flow', category: 'Recovery', level: 'Advanced', durationWeeks: 6, frequency: 3, split: 'Flow', focus: 'Mobility', equipment: 'Full Gym', sets: '1-2', reps: '30s hold', description: '6-week mobility program using flow split. 3x/week, ~60min/session.' },
  { id: 'PRG064', name: 'Rehab Full Body', category: 'Recovery', level: 'Beginner', durationWeeks: 6, frequency: 4, split: 'Full Body', focus: 'Rehab', equipment: 'Full Gym + Cables', sets: '3', reps: '10', description: '6-week rehab program using full body split. 4x/week, ~90min/session.' },
  { id: 'PRG065', name: 'Rehab Full Body', category: 'Recovery', level: 'Intermediate', durationWeeks: 4, frequency: 3, split: 'Full Body', focus: 'Rehab', equipment: 'Full Gym', sets: '3', reps: '10', description: '4-week rehab program using full body split. 3x/week, ~60min/session.' },
  { id: 'PRG066', name: 'Rehab Full Body', category: 'Recovery', level: 'Advanced', durationWeeks: 6, frequency: 3, split: 'Full Body', focus: 'Rehab', equipment: 'Full Gym + Cables', sets: '3', reps: '10', description: '6-week rehab program using full body split. 3x/week, ~75min/session.' },
  { id: 'PRG067', name: 'Rehab Isolation', category: 'Recovery', level: 'Beginner', durationWeeks: 6, frequency: 6, split: 'Isolation', focus: 'Rehab', equipment: 'Dumbbells Only', sets: '3', reps: '10', description: '6-week rehab program using isolation split. 6x/week, ~75min/session.' },
  { id: 'PRG068', name: 'Rehab Isolation', category: 'Recovery', level: 'Intermediate', durationWeeks: 8, frequency: 5, split: 'Isolation', focus: 'Rehab', equipment: 'Minimal', sets: '3', reps: '10', description: '8-week rehab program using isolation split. 5x/week, ~90min/session.' },
  { id: 'PRG069', name: 'Rehab Isolation', category: 'Recovery', level: 'Advanced', durationWeeks: 4, frequency: 3, split: 'Isolation', focus: 'Rehab', equipment: 'Dumbbells Only', sets: '3', reps: '10', description: '4-week rehab program using isolation split. 3x/week, ~45min/session.' },
  { id: 'PRG070', name: 'Rehab Prehab', category: 'Recovery', level: 'Beginner', durationWeeks: 16, frequency: 3, split: 'Prehab', focus: 'Rehab', equipment: 'Full Gym + Cables', sets: '3', reps: '10', description: '16-week rehab program using prehab split. 3x/week, ~75min/session.' },
  { id: 'PRG071', name: 'Rehab Prehab', category: 'Recovery', level: 'Intermediate', durationWeeks: 6, frequency: 6, split: 'Prehab', focus: 'Rehab', equipment: 'Bodyweight', sets: '3', reps: '10', description: '6-week rehab program using prehab split. 6x/week, ~45min/session.' },
  { id: 'PRG072', name: 'Rehab Prehab', category: 'Recovery', level: 'Advanced', durationWeeks: 4, frequency: 5, split: 'Prehab', focus: 'Rehab', equipment: 'Minimal', sets: '3', reps: '10', description: '4-week rehab program using prehab split. 5x/week, ~45min/session.' },
  { id: 'PRG073', name: 'Powerlifting Squat/Bench/Dead', category: 'Powerlifting', level: 'Beginner', durationWeeks: 6, frequency: 5, split: 'Squat/Bench/Dead', focus: 'Powerlifting', equipment: 'Full Gym', sets: '3', reps: '10', description: '6-week powerlifting program using squat/bench/dead split. 5x/week, ~90min/session.' },
  { id: 'PRG074', name: 'Powerlifting Squat/Bench/Dead', category: 'Powerlifting', level: 'Intermediate', durationWeeks: 16, frequency: 4, split: 'Squat/Bench/Dead', focus: 'Powerlifting', equipment: 'Full Gym', sets: '3', reps: '10', description: '16-week powerlifting program using squat/bench/dead split. 4x/week, ~90min/session.' },
  { id: 'PRG075', name: 'Powerlifting Squat/Bench/Dead', category: 'Powerlifting', level: 'Advanced', durationWeeks: 8, frequency: 6, split: 'Squat/Bench/Dead', focus: 'Powerlifting', equipment: 'Minimal', sets: '3', reps: '10', description: '8-week powerlifting program using squat/bench/dead split. 6x/week, ~90min/session.' },
  { id: 'PRG076', name: 'Powerlifting Conjugate', category: 'Powerlifting', level: 'Beginner', durationWeeks: 6, frequency: 6, split: 'Conjugate', focus: 'Powerlifting', equipment: 'Minimal', sets: '3', reps: '10', description: '6-week powerlifting program using conjugate split. 6x/week, ~45min/session.' },
  { id: 'PRG077', name: 'Powerlifting Conjugate', category: 'Powerlifting', level: 'Intermediate', durationWeeks: 6, frequency: 4, split: 'Conjugate', focus: 'Powerlifting', equipment: 'Dumbbells Only', sets: '3', reps: '10', description: '6-week powerlifting program using conjugate split. 4x/week, ~75min/session.' },
  { id: 'PRG078', name: 'Powerlifting Conjugate', category: 'Powerlifting', level: 'Advanced', durationWeeks: 16, frequency: 3, split: 'Conjugate', focus: 'Powerlifting', equipment: 'Full Gym', sets: '3', reps: '10', description: '16-week powerlifting program using conjugate split. 3x/week, ~75min/session.' },
  { id: 'PRG079', name: 'Powerlifting Peaking', category: 'Powerlifting', level: 'Beginner', durationWeeks: 8, frequency: 5, split: 'Peaking', focus: 'Powerlifting', equipment: 'Minimal', sets: '3', reps: '10', description: '8-week powerlifting program using peaking split. 5x/week, ~60min/session.' },
  { id: 'PRG080', name: 'Powerlifting Peaking', category: 'Powerlifting', level: 'Intermediate', durationWeeks: 8, frequency: 3, split: 'Peaking', focus: 'Powerlifting', equipment: 'Minimal', sets: '3', reps: '10', description: '8-week powerlifting program using peaking split. 3x/week, ~45min/session.' },
  { id: 'PRG081', name: 'Powerlifting Peaking', category: 'Powerlifting', level: 'Advanced', durationWeeks: 8, frequency: 6, split: 'Peaking', focus: 'Powerlifting', equipment: 'Full Gym', sets: '3', reps: '10', description: '8-week powerlifting program using peaking split. 6x/week, ~60min/session.' },
  { id: 'PRG082', name: 'Bodybuilding Bro Split', category: 'Bodybuilding', level: 'Beginner', durationWeeks: 16, frequency: 3, split: 'Bro Split', focus: 'Bodybuilding', equipment: 'Full Gym + Cables', sets: '3', reps: '10', description: '16-week bodybuilding program using bro split. 3x/week, ~90min/session.' },
  { id: 'PRG083', name: 'Bodybuilding Bro Split', category: 'Bodybuilding', level: 'Intermediate', durationWeeks: 6, frequency: 6, split: 'Bro Split', focus: 'Bodybuilding', equipment: 'Full Gym + Cables', sets: '3', reps: '10', description: '6-week bodybuilding program using bro split. 6x/week, ~45min/session.' },
  { id: 'PRG084', name: 'Bodybuilding Bro Split', category: 'Bodybuilding', level: 'Advanced', durationWeeks: 12, frequency: 4, split: 'Bro Split', focus: 'Bodybuilding', equipment: 'Dumbbells Only', sets: '3', reps: '10', description: '12-week bodybuilding program using bro split. 4x/week, ~45min/session.' },
]

export const CATEGORY_COLORS: Record<string, string> = {
  Strength: '#8B5CF6',
  Hypertrophy: '#06B6D4',
  'Fat Loss': '#EF4444',
  Endurance: '#22C55E',
  Performance: '#F59E0B',
  Recovery: '#EC4899',
  Powerlifting: '#8B5CF6',
  Bodybuilding: '#06B6D4',
}

export const LEVEL_COLORS: Record<string, string> = {
  Beginner: '#22C55E',
  Intermediate: '#F59E0B',
  Advanced: '#EF4444',
}

export const SPLIT_OPTIONS = [
  'Upper/Lower',
  'Push/Pull/Legs',
  'Full Body',
  'Bro Split',
  'Conjugate',
  'Circuit',
  'HIIT/Strength',
  'Custom',
]

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export interface PhaseConfig {
  name: string
  weeks: number
  sets: string
  reps: string
  intensity: string
  restSeconds: number
  tempo: string
  color: string
}

export const DEFAULT_PHASES: PhaseConfig[] = [
  { name: 'Accumulation', weeks: 4, sets: '3-4', reps: '8-12', intensity: '70% 1RM', restSeconds: 90, tempo: '3-0-1-0', color: '#8B5CF6' },
  { name: 'Intensification', weeks: 4, sets: '3', reps: '6-8', intensity: '80% 1RM', restSeconds: 120, tempo: '2-1-1-0', color: '#F59E0B' },
  { name: 'Realization', weeks: 4, sets: '2-3', reps: '4-6', intensity: '85% 1RM', restSeconds: 180, tempo: '2-0-X-0', color: '#22C55E' },
]
