# PHASE 3 — PROGRAM WIZARD
## SEND THIS THIRD (only after Phase 2 works)

Build the program creation system. Coaches select templates, configure training splits and periodization phases, then pick exercises from the 200-exercise database to build customized programs for each client.

---

## STEP 1: PROGRAM TEMPLATE SELECTION

Access: Client profile → "Create Program" button. Also accessible from sidebar "Programs" > "Create New Program".

Page layout:
- Header: "Create Program for [Client Name]" with client goal badge
- Auto-filter bar: "Showing templates matching: Build Muscle | Intermediate | Full Gym" (pills)
- Search input: "Search programs..." (filters by name, category, focus)
- Filter chips row: [All] [Strength] [Hypertrophy] [Fat Loss] [Endurance] [Performance] [Recovery] [Powerlifting] [Bodybuilding] — toggle on/off

Program cards grid (3 columns desktop, 2 tablet, 1 mobile):

Each card:
```
+------------------------------------------+
| [STRENGTH]                    [Advanced] |
| Hypertrophy Upper/Lower                 |
| Intermediate Program                    |
|                                          |
| Duration: 12 weeks    Frequency: 5x/wk  |
| Split: Upper/Lower    Time: ~75 min     |
| Equipment: Full Gym                      |
|                                          |
| [Preview]            [Select Template]   |
+------------------------------------------+
```

Category badge colors:
- Strength: #8B5CF6 (purple)
- Hypertrophy: #06B6D4 (cyan)
- Fat Loss: #EF4444 (red)
- Endurance: #22C55E (green)
- Performance: #F59E0B (amber)
- Recovery: #EC4899 (pink)

Level badge colors:
- Beginner: #22C55E (green)
- Intermediate: #F59E0B (amber)
- Advanced: #EF4444 (red)

Program data source: Import from the Excel database or use this inline data array (84 programs):

```javascript
const PROGRAM_TEMPLATES = [
  { id: "PRG001", name: "Hypertrophy Upper/Lower", category: "Strength", level: "Beginner", durationWeeks: 4, frequency: 5, split: "Upper/Lower", focus: "Hypertrophy", equipment: "Full Gym + Cables", sets: "3-4", reps: "8-12", description: "4-week hypertrophy program using upper/lower split. 5x/week, ~45min/session." },
  { id: "PRG002", name: "Hypertrophy Upper/Lower", category: "Strength", level: "Intermediate", durationWeeks: 12, frequency: 5, split: "Upper/Lower", focus: "Hypertrophy", equipment: "Full Gym", sets: "3-4", reps: "8-12", description: "12-week hypertrophy program using upper/lower split. 5x/week, ~75min/session." },
  { id: "PRG003", name: "Hypertrophy Upper/Lower", category: "Strength", level: "Advanced", durationWeeks: 16, frequency: 5, split: "Upper/Lower", focus: "Hypertrophy", equipment: "Dumbbells Only", sets: "3-4", reps: "8-12", description: "16-week hypertrophy program using upper/lower split. 5x/week, ~60min/session." },
  { id: "PRG004", name: "Hypertrophy Push/Pull/Legs", category: "Strength", level: "Beginner", durationWeeks: 16, frequency: 6, split: "Push/Pull/Legs", focus: "Hypertrophy", equipment: "Full Gym", sets: "3-4", reps: "8-12", description: "16-week hypertrophy program using push/pull/legs split. 6x/week, ~45min/session." },
  { id: "PRG005", name: "Hypertrophy Push/Pull/Legs", category: "Strength", level: "Intermediate", durationWeeks: 4, frequency: 3, split: "Push/Pull/Legs", focus: "Hypertrophy", equipment: "Dumbbells Only", sets: "3-4", reps: "8-12", description: "4-week hypertrophy program using push/pull/legs split. 3x/week, ~45min/session." },
  { id: "PRG006", name: "Hypertrophy Push/Pull/Legs", category: "Strength", level: "Advanced", durationWeeks: 8, frequency: 6, split: "Push/Pull/Legs", focus: "Hypertrophy", equipment: "Minimal", sets: "3-4", reps: "8-12", description: "8-week hypertrophy program using push/pull/legs split. 6x/week, ~90min/session." },
  { id: "PRG007", name: "Hypertrophy Bro Split", category: "Strength", level: "Beginner", durationWeeks: 8, frequency: 5, split: "Bro Split", focus: "Hypertrophy", equipment: "Dumbbells Only", sets: "3-4", reps: "8-12", description: "8-week hypertrophy program using bro split. 5x/week, ~90min/session." },
  { id: "PRG008", name: "Hypertrophy Bro Split", category: "Strength", level: "Intermediate", durationWeeks: 16, frequency: 5, split: "Bro Split", focus: "Hypertrophy", equipment: "Full Gym + Cables", sets: "3-4", reps: "8-12", description: "16-week hypertrophy program using bro split. 5x/week, ~45min/session." },
  { id: "PRG009", name: "Hypertrophy Bro Split", category: "Strength", level: "Advanced", durationWeeks: 16, frequency: 6, split: "Bro Split", focus: "Hypertrophy", equipment: "Minimal", sets: "3-4", reps: "8-12", description: "16-week hypertrophy program using bro split. 6x/week, ~90min/session." },
  { id: "PRG010", name: "Hypertrophy Full Body", category: "Strength", level: "Beginner", durationWeeks: 6, frequency: 3, split: "Full Body", focus: "Hypertrophy", equipment: "Minimal", sets: "3-4", reps: "8-12", description: "6-week hypertrophy program using full body split. 3x/week, ~90min/session." },
  { id: "PRG011", name: "Hypertrophy Full Body", category: "Strength", level: "Intermediate", durationWeeks: 16, frequency: 6, split: "Full Body", focus: "Hypertrophy", equipment: "Full Gym + Cables", sets: "3-4", reps: "8-12", description: "16-week hypertrophy program using full body split. 6x/week, ~45min/session." },
  { id: "PRG012", name: "Hypertrophy Full Body", category: "Strength", level: "Advanced", durationWeeks: 4, frequency: 4, split: "Full Body", focus: "Hypertrophy", equipment: "Minimal", sets: "3-4", reps: "8-12", description: "4-week hypertrophy program using full body split. 4x/week, ~45min/session." },
  { id: "PRG013", name: "Strength Upper/Lower", category: "Strength", level: "Beginner", durationWeeks: 12, frequency: 3, split: "Upper/Lower", focus: "Strength", equipment: "Full Gym + Cables", sets: "4-5", reps: "3-5", description: "12-week strength program using upper/lower split. 3x/week, ~75min/session." },
  { id: "PRG014", name: "Strength Upper/Lower", category: "Strength", level: "Intermediate", durationWeeks: 16, frequency: 6, split: "Upper/Lower", focus: "Strength", equipment: "Dumbbells Only", sets: "4-5", reps: "3-5", description: "16-week strength program using upper/lower split. 6x/week, ~60min/session." },
  { id: "PRG015", name: "Strength Upper/Lower", category: "Strength", level: "Advanced", durationWeeks: 12, frequency: 3, split: "Upper/Lower", focus: "Strength", equipment: "Dumbbells Only", sets: "4-5", reps: "3-5", description: "12-week strength program using upper/lower split. 3x/week, ~45min/session." },
  { id: "PRG016", name: "Strength Push/Pull", category: "Strength", level: "Beginner", durationWeeks: 8, frequency: 5, split: "Push/Pull", focus: "Strength", equipment: "Full Gym + Cables", sets: "4-5", reps: "3-5", description: "8-week strength program using push/pull split. 5x/week, ~75min/session." },
  { id: "PRG017", name: "Strength Push/Pull", category: "Strength", level: "Intermediate", durationWeeks: 4, frequency: 3, split: "Push/Pull", focus: "Strength", equipment: "Full Gym", sets: "4-5", reps: "3-5", description: "4-week strength program using push/pull split. 3x/week, ~75min/session." },
  { id: "PRG018", name: "Strength Push/Pull", category: "Strength", level: "Advanced", durationWeeks: 16, frequency: 6, split: "Push/Pull", focus: "Strength", equipment: "Bodyweight", sets: "4-5", reps: "3-5", description: "16-week strength program using push/pull split. 6x/week, ~45min/session." },
  { id: "PRG019", name: "Strength Full Body", category: "Strength", level: "Beginner", durationWeeks: 4, frequency: 5, split: "Full Body", focus: "Strength", equipment: "Full Gym + Cables", sets: "4-5", reps: "3-5", description: "4-week strength program using full body split. 5x/week, ~75min/session." },
  { id: "PRG020", name: "Strength Full Body", category: "Strength", level: "Intermediate", durationWeeks: 8, frequency: 6, split: "Full Body", focus: "Strength", equipment: "Full Gym", sets: "4-5", reps: "3-5", description: "8-week strength program using full body split. 6x/week, ~75min/session." },
  { id: "PRG021", name: "Strength Full Body", category: "Strength", level: "Advanced", durationWeeks: 12, frequency: 3, split: "Full Body", focus: "Strength", equipment: "Minimal", sets: "4-5", reps: "3-5", description: "12-week strength program using full body split. 3x/week, ~60min/session." },
  { id: "PRG022", name: "Strength Conjugate", category: "Strength", level: "Beginner", durationWeeks: 4, frequency: 3, split: "Conjugate", focus: "Strength", equipment: "Bodyweight", sets: "4-5", reps: "3-5", description: "4-week strength program using conjugate split. 3x/week, ~90min/session." },
  { id: "PRG023", name: "Strength Conjugate", category: "Strength", level: "Intermediate", durationWeeks: 8, frequency: 6, split: "Conjugate", focus: "Strength", equipment: "Dumbbells Only", sets: "4-5", reps: "3-5", description: "8-week strength program using conjugate split. 6x/week, ~75min/session." },
  { id: "PRG024", name: "Strength Conjugate", category: "Strength", level: "Advanced", durationWeeks: 4, frequency: 4, split: "Conjugate", focus: "Strength", equipment: "Full Gym + Cables", sets: "4-5", reps: "3-5", description: "4-week strength program using conjugate split. 4x/week, ~90min/session." },
  { id: "PRG025", name: "Fat Loss Full Body", category: "Cardio", level: "Beginner", durationWeeks: 12, frequency: 3, split: "Full Body", focus: "Fat Loss", equipment: "Full Gym + Cables", sets: "3-4", reps: "10-15", description: "12-week fat loss program using full body split. 3x/week, ~75min/session." },
  { id: "PRG026", name: "Fat Loss Full Body", category: "Cardio", level: "Intermediate", durationWeeks: 12, frequency: 5, split: "Full Body", focus: "Fat Loss", equipment: "Full Gym", sets: "3-4", reps: "10-15", description: "12-week fat loss program using full body split. 5x/week, ~90min/session." },
  { id: "PRG027", name: "Fat Loss Full Body", category: "Cardio", level: "Advanced", durationWeeks: 16, frequency: 4, split: "Full Body", focus: "Fat Loss", equipment: "Bodyweight", sets: "3-4", reps: "10-15", description: "16-week fat loss program using full body split. 4x/week, ~75min/session." },
  { id: "PRG028", name: "Fat Loss Upper/Lower", category: "Cardio", level: "Beginner", durationWeeks: 8, frequency: 4, split: "Upper/Lower", focus: "Fat Loss", equipment: "Full Gym", sets: "3-4", reps: "10-15", description: "8-week fat loss program using upper/lower split. 4x/week, ~75min/session." },
  { id: "PRG029", name: "Fat Loss Upper/Lower", category: "Cardio", level: "Intermediate", durationWeeks: 6, frequency: 5, split: "Upper/Lower", focus: "Fat Loss", equipment: "Full Gym + Cables", sets: "3-4", reps: "10-15", description: "6-week fat loss program using upper/lower split. 5x/week, ~75min/session." },
  { id: "PRG030", name: "Fat Loss Upper/Lower", category: "Cardio", level: "Advanced", durationWeeks: 6, frequency: 4, split: "Upper/Lower", focus: "Fat Loss", equipment: "Dumbbells Only", sets: "3-4", reps: "10-15", description: "6-week fat loss program using upper/lower split. 4x/week, ~45min/session." },
  { id: "PRG031", name: "Fat Loss Circuit", category: "Cardio", level: "Beginner", durationWeeks: 4, frequency: 5, split: "Circuit", focus: "Fat Loss", equipment: "Minimal", sets: "3-4", reps: "10-15", description: "4-week fat loss program using circuit split. 5x/week, ~45min/session." },
  { id: "PRG032", name: "Fat Loss Circuit", category: "Cardio", level: "Intermediate", durationWeeks: 16, frequency: 4, split: "Circuit", focus: "Fat Loss", equipment: "Full Gym + Cables", sets: "3-4", reps: "10-15", description: "16-week fat loss program using circuit split. 4x/week, ~90min/session." },
  { id: "PRG033", name: "Fat Loss Circuit", category: "Cardio", level: "Advanced", durationWeeks: 8, frequency: 6, split: "Circuit", focus: "Fat Loss", equipment: "Full Gym + Cables", sets: "3-4", reps: "10-15", description: "8-week fat loss program using circuit split. 6x/week, ~75min/session." },
  { id: "PRG034", name: "Fat Loss HIIT/Strength", category: "Cardio", level: "Beginner", durationWeeks: 6, frequency: 3, split: "HIIT/Strength", focus: "Fat Loss", equipment: "Minimal", sets: "3-4", reps: "10-15", description: "6-week fat loss program using HIIT/strength split. 3x/week, ~90min/session." },
  { id: "PRG035", name: "Fat Loss HIIT/Strength", category: "Cardio", level: "Intermediate", durationWeeks: 4, frequency: 5, split: "HIIT/Strength", focus: "Fat Loss", equipment: "Minimal", sets: "3-4", reps: "10-15", description: "4-week fat loss program using HIIT/strength split. 5x/week, ~90min/session." },
  { id: "PRG036", name: "Fat Loss HIIT/Strength", category: "Cardio", level: "Advanced", durationWeeks: 8, frequency: 4, split: "HIIT/Strength", focus: "Fat Loss", equipment: "Minimal", sets: "3-4", reps: "10-15", description: "8-week fat loss program using HIIT/strength split. 4x/week, ~90min/session." },
  { id: "PRG037", name: "Endurance Full Body", category: "Cardio", level: "Beginner", durationWeeks: 12, frequency: 3, split: "Full Body", focus: "Endurance", equipment: "Full Gym + Cables", sets: "2-3", reps: "15-20", description: "12-week endurance program using full body split. 3x/week, ~90min/session." },
  { id: "PRG038", name: "Endurance Full Body", category: "Cardio", level: "Intermediate", durationWeeks: 16, frequency: 6, split: "Full Body", focus: "Endurance", equipment: "Full Gym", sets: "2-3", reps: "15-20", description: "16-week endurance program using full body split. 6x/week, ~75min/session." },
  { id: "PRG039", name: "Endurance Full Body", category: "Cardio", level: "Advanced", durationWeeks: 16, frequency: 5, split: "Full Body", focus: "Endurance", equipment: "Full Gym + Cables", sets: "2-3", reps: "15-20", description: "16-week endurance program using full body split. 5x/week, ~45min/session." },
  { id: "PRG040", name: "Endurance Split", category: "Cardio", level: "Beginner", durationWeeks: 8, frequency: 3, split: "Split", focus: "Endurance", equipment: "Bodyweight", sets: "2-3", reps: "15-20", description: "8-week endurance program using split split. 3x/week, ~90min/session." },
  { id: "PRG041", name: "Endurance Split", category: "Cardio", level: "Intermediate", durationWeeks: 12, frequency: 5, split: "Split", focus: "Endurance", equipment: "Bodyweight", sets: "2-3", reps: "15-20", description: "12-week endurance program using split split. 5x/week, ~90min/session." },
  { id: "PRG042", name: "Endurance Split", category: "Cardio", level: "Advanced", durationWeeks: 12, frequency: 5, split: "Split", focus: "Endurance", equipment: "Full Gym", sets: "2-3", reps: "15-20", description: "12-week endurance program using split split. 5x/week, ~75min/session." },
  { id: "PRG043", name: "Endurance Triathlon", category: "Cardio", level: "Beginner", durationWeeks: 12, frequency: 6, split: "Triathlon", focus: "Endurance", equipment: "Full Gym + Cables", sets: "2-3", reps: "15-20", description: "12-week endurance program using triathlon split. 6x/week, ~60min/session." },
  { id: "PRG044", name: "Endurance Triathlon", category: "Cardio", level: "Intermediate", durationWeeks: 16, frequency: 4, split: "Triathlon", focus: "Endurance", equipment: "Minimal", sets: "2-3", reps: "15-20", description: "16-week endurance program using triathlon split. 4x/week, ~75min/session." },
  { id: "PRG045", name: "Endurance Triathlon", category: "Cardio", level: "Advanced", durationWeeks: 12, frequency: 5, split: "Triathlon", focus: "Endurance", equipment: "Minimal", sets: "2-3", reps: "15-20", description: "12-week endurance program using triathlon split. 5x/week, ~45min/session." },
  { id: "PRG046", name: "Athletic Upper/Lower", category: "Performance", level: "Beginner", durationWeeks: 4, frequency: 5, split: "Upper/Lower", focus: "Athletic", equipment: "Dumbbells Only", sets: "3-5", reps: "6-8", description: "4-week athletic program using upper/lower split. 5x/week, ~75min/session." },
  { id: "PRG047", name: "Athletic Upper/Lower", category: "Performance", level: "Intermediate", durationWeeks: 4, frequency: 3, split: "Upper/Lower", focus: "Athletic", equipment: "Dumbbells Only", sets: "3-5", reps: "6-8", description: "4-week athletic program using upper/lower split. 3x/week, ~90min/session." },
  { id: "PRG048", name: "Athletic Upper/Lower", category: "Performance", level: "Advanced", durationWeeks: 16, frequency: 4, split: "Upper/Lower", focus: "Athletic", equipment: "Minimal", sets: "3-5", reps: "6-8", description: "16-week athletic program using upper/lower split. 4x/week, ~60min/session." },
  { id: "PRG049", name: "Athletic Push/Pull", category: "Performance", level: "Beginner", durationWeeks: 8, frequency: 3, split: "Push/Pull", focus: "Athletic", equipment: "Full Gym + Cables", sets: "3-5", reps: "6-8", description: "8-week athletic program using push/pull split. 3x/week, ~45min/session." },
  { id: "PRG050", name: "Athletic Push/Pull", category: "Performance", level: "Intermediate", durationWeeks: 8, frequency: 4, split: "Push/Pull", focus: "Athletic", equipment: "Full Gym + Cables", sets: "3-5", reps: "6-8", description: "8-week athletic program using push/pull split. 4x/week, ~45min/session." },
  { id: "PRG051", name: "Athletic Push/Pull", category: "Performance", level: "Advanced", durationWeeks: 4, frequency: 3, split: "Push/Pull", focus: "Athletic", equipment: "Full Gym + Cables", sets: "3-5", reps: "6-8", description: "4-week athletic program using push/pull split. 3x/week, ~90min/session." },
  { id: "PRG052", name: "Athletic Sport Specific", category: "Performance", level: "Beginner", durationWeeks: 12, frequency: 4, split: "Sport Specific", focus: "Athletic", equipment: "Dumbbells Only", sets: "3-5", reps: "6-8", description: "12-week athletic program using sport specific split. 4x/week, ~60min/session." },
  { id: "PRG053", name: "Athletic Sport Specific", category: "Performance", level: "Intermediate", durationWeeks: 6, frequency: 3, split: "Sport Specific", focus: "Athletic", equipment: "Full Gym", sets: "3-5", reps: "6-8", description: "6-week athletic program using sport specific split. 3x/week, ~90min/session." },
  { id: "PRG054", name: "Athletic Sport Specific", category: "Performance", level: "Advanced", durationWeeks: 8, frequency: 3, split: "Sport Specific", focus: "Athletic", equipment: "Dumbbells Only", sets: "3-5", reps: "6-8", description: "8-week athletic program using sport specific split. 3x/week, ~45min/session." },
  { id: "PRG055", name: "Mobility Full Body", category: "Recovery", level: "Beginner", durationWeeks: 8, frequency: 4, split: "Full Body", focus: "Mobility", equipment: "Full Gym", sets: "1-2", reps: "30s hold", description: "8-week mobility program using full body split. 4x/week, ~75min/session." },
  { id: "PRG056", name: "Mobility Full Body", category: "Recovery", level: "Intermediate", durationWeeks: 8, frequency: 4, split: "Full Body", focus: "Mobility", equipment: "Minimal", sets: "1-2", reps: "30s hold", description: "8-week mobility program using full body split. 4x/week, ~45min/session." },
  { id: "PRG057", name: "Mobility Full Body", category: "Recovery", level: "Advanced", durationWeeks: 12, frequency: 4, split: "Full Body", focus: "Mobility", equipment: "Full Gym + Cables", sets: "1-2", reps: "30s hold", description: "12-week mobility program using full body split. 4x/week, ~90min/session." },
  { id: "PRG058", name: "Mobility Split", category: "Recovery", level: "Beginner", durationWeeks: 4, frequency: 6, split: "Split", focus: "Mobility", equipment: "Minimal", sets: "1-2", reps: "30s hold", description: "4-week mobility program using split split. 6x/week, ~45min/session." },
  { id: "PRG059", name: "Mobility Split", category: "Recovery", level: "Intermediate", durationWeeks: 4, frequency: 4, split: "Split", focus: "Mobility", equipment: "Full Gym + Cables", sets: "1-2", reps: "30s hold", description: "4-week mobility program using split split. 4x/week, ~45min/session." },
  { id: "PRG060", name: "Mobility Split", category: "Recovery", level: "Advanced", durationWeeks: 4, frequency: 6, split: "Split", focus: "Mobility", equipment: "Minimal", sets: "1-2", reps: "30s hold", description: "4-week mobility program using split split. 6x/week, ~75min/session." },
  { id: "PRG061", name: "Mobility Flow", category: "Recovery", level: "Beginner", durationWeeks: 4, frequency: 3, split: "Flow", focus: "Mobility", equipment: "Bodyweight", sets: "1-2", reps: "30s hold", description: "4-week mobility program using flow split. 3x/week, ~45min/session." },
  { id: "PRG062", name: "Mobility Flow", category: "Recovery", level: "Intermediate", durationWeeks: 4, frequency: 4, split: "Flow", focus: "Mobility", equipment: "Dumbbells Only", sets: "1-2", reps: "30s hold", description: "4-week mobility program using flow split. 4x/week, ~90min/session." },
  { id: "PRG063", name: "Mobility Flow", category: "Recovery", level: "Advanced", durationWeeks: 6, frequency: 3, split: "Flow", focus: "Mobility", equipment: "Full Gym", sets: "1-2", reps: "30s hold", description: "6-week mobility program using flow split. 3x/week, ~60min/session." },
  { id: "PRG064", name: "Rehab Full Body", category: "Recovery", level: "Beginner", durationWeeks: 6, frequency: 4, split: "Full Body", focus: "Rehab", equipment: "Full Gym + Cables", sets: "3", reps: "10", description: "6-week rehab program using full body split. 4x/week, ~90min/session." },
  { id: "PRG065", name: "Rehab Full Body", category: "Recovery", level: "Intermediate", durationWeeks: 4, frequency: 3, split: "Full Body", focus: "Rehab", equipment: "Full Gym", sets: "3", reps: "10", description: "4-week rehab program using full body split. 3x/week, ~60min/session." },
  { id: "PRG066", name: "Rehab Full Body", category: "Recovery", level: "Advanced", durationWeeks: 6, frequency: 3, split: "Full Body", focus: "Rehab", equipment: "Full Gym + Cables", sets: "3", reps: "10", description: "6-week rehab program using full body split. 3x/week, ~75min/session." },
  { id: "PRG067", name: "Rehab Isolation", category: "Recovery", level: "Beginner", durationWeeks: 6, frequency: 6, split: "Isolation", focus: "Rehab", equipment: "Dumbbells Only", sets: "3", reps: "10", description: "6-week rehab program using isolation split. 6x/week, ~75min/session." },
  { id: "PRG068", name: "Rehab Isolation", category: "Recovery", level: "Intermediate", durationWeeks: 8, frequency: 5, split: "Isolation", focus: "Rehab", equipment: "Minimal", sets: "3", reps: "10", description: "8-week rehab program using isolation split. 5x/week, ~90min/session." },
  { id: "PRG069", name: "Rehab Isolation", category: "Recovery", level: "Advanced", durationWeeks: 4, frequency: 3, split: "Isolation", focus: "Rehab", equipment: "Dumbbells Only", sets: "3", reps: "10", description: "4-week rehab program using isolation split. 3x/week, ~45min/session." },
  { id: "PRG070", name: "Rehab Prehab", category: "Recovery", level: "Beginner", durationWeeks: 16, frequency: 3, split: "Prehab", focus: "Rehab", equipment: "Full Gym + Cables", sets: "3", reps: "10", description: "16-week rehab program using prehab split. 3x/week, ~75min/session." },
  { id: "PRG071", name: "Rehab Prehab", category: "Recovery", level: "Intermediate", durationWeeks: 6, frequency: 6, split: "Prehab", focus: "Rehab", equipment: "Bodyweight", sets: "3", reps: "10", description: "6-week rehab program using prehab split. 6x/week, ~45min/session." },
  { id: "PRG072", name: "Rehab Prehab", category: "Recovery", level: "Advanced", durationWeeks: 4, frequency: 5, split: "Prehab", focus: "Rehab", equipment: "Minimal", sets: "3", reps: "10", description: "4-week rehab program using prehab split. 5x/week, ~45min/session." },
  { id: "PRG073", name: "Powerlifting Squat/Bench/Dead", category: "Powerlifting", level: "Beginner", durationWeeks: 6, frequency: 5, split: "Squat/Bench/Dead", focus: "Powerlifting", equipment: "Full Gym", sets: "3", reps: "10", description: "6-week powerlifting program using squat/bench/dead split. 5x/week, ~90min/session." },
  { id: "PRG074", name: "Powerlifting Squat/Bench/Dead", category: "Powerlifting", level: "Intermediate", durationWeeks: 16, frequency: 4, split: "Squat/Bench/Dead", focus: "Powerlifting", equipment: "Full Gym", sets: "3", reps: "10", description: "16-week powerlifting program using squat/bench/dead split. 4x/week, ~90min/session." },
  { id: "PRG075", name: "Powerlifting Squat/Bench/Dead", category: "Powerlifting", level: "Advanced", durationWeeks: 8, frequency: 6, split: "Squat/Bench/Dead", focus: "Powerlifting", equipment: "Minimal", sets: "3", reps: "10", description: "8-week powerlifting program using squat/bench/dead split. 6x/week, ~90min/session." },
  { id: "PRG076", name: "Powerlifting Conjugate", category: "Powerlifting", level: "Beginner", durationWeeks: 6, frequency: 6, split: "Conjugate", focus: "Powerlifting", equipment: "Minimal", sets: "3", reps: "10", description: "6-week powerlifting program using conjugate split. 6x/week, ~45min/session." },
  { id: "PRG077", name: "Powerlifting Conjugate", category: "Powerlifting", level: "Intermediate", durationWeeks: 6, frequency: 4, split: "Conjugate", focus: "Powerlifting", equipment: "Dumbbells Only", sets: "3", reps: "10", description: "6-week powerlifting program using conjugate split. 4x/week, ~75min/session." },
  { id: "PRG078", name: "Powerlifting Conjugate", category: "Powerlifting", level: "Advanced", durationWeeks: 16, frequency: 3, split: "Conjugate", focus: "Powerlifting", equipment: "Full Gym", sets: "3", reps: "10", description: "16-week powerlifting program using conjugate split. 3x/week, ~75min/session." },
  { id: "PRG079", name: "Powerlifting Peaking", category: "Powerlifting", level: "Beginner", durationWeeks: 8, frequency: 5, split: "Peaking", focus: "Powerlifting", equipment: "Minimal", sets: "3", reps: "10", description: "8-week powerlifting program using peaking split. 5x/week, ~60min/session." },
  { id: "PRG080", name: "Powerlifting Peaking", category: "Powerlifting", level: "Intermediate", durationWeeks: 8, frequency: 3, split: "Peaking", focus: "Powerlifting", equipment: "Minimal", sets: "3", reps: "10", description: "8-week powerlifting program using peaking split. 3x/week, ~45min/session." },
  { id: "PRG081", name: "Powerlifting Peaking", category: "Powerlifting", level: "Advanced", durationWeeks: 8, frequency: 6, split: "Peaking", focus: "Powerlifting", equipment: "Full Gym", sets: "3", reps: "10", description: "8-week powerlifting program using peaking split. 6x/week, ~60min/session." },
  { id: "PRG082", name: "Bodybuilding Bro Split", category: "Aesthetic", level: "Beginner", durationWeeks: 16, frequency: 3, split: "Bro Split", focus: "Bodybuilding", equipment: "Full Gym + Cables", sets: "3", reps: "10", description: "16-week bodybuilding program using bro split. 3x/week, ~90min/session." },
  { id: "PRG083", name: "Bodybuilding Bro Split", category: "Aesthetic", level: "Intermediate", durationWeeks: 6, frequency: 6, split: "Bro Split", focus: "Bodybuilding", equipment: "Full Gym + Cables", sets: "3", reps: "10", description: "6-week bodybuilding program using bro split. 6x/week, ~45min/session." },
  { id: "PRG084", name: "Bodybuilding Bro Split", category: "Aesthetic", level: "Advanced", durationWeeks: 12, frequency: 4, split: "Bro Split", focus: "Bodybuilding", equipment: "Dumbbells Only", sets: "3", reps: "10", description: "12-week bodybuilding program using bro split. 4x/week, ~45min/session." }
]
```

Also show: [Start from Scratch] button at bottom — creates a blank program template.

---

## STEP 2: TRAINING SPLIT CONFIGURATION

After selecting a template:

- Show selected template name at top (editable)
- Split type selector (horizontal card row):
  - Upper/Lower | Push/Pull/Legs | Full Body | Bro Split | Conjugate | Circuit | HIIT/Strength | Custom
  - Auto-select the template's default split

- Day selector: Mon-Sun toggle buttons
  ```
  Mon    Tue    Wed    Thu    Fri    Sat    Sun
  [ON]   [OFF]  [ON]   [OFF]  [ON]   [OFF]  [OFF]
  Upper  REST   Lower  REST   Upper  REST   REST
  ```
  - Training days: cyan bg, white text, shadow
  - Rest days: muted border, gray text
  - Click toggles between training/rest
  - Counter below: "4 training days selected"

[Back: Templates] [Next: Phases]

---

## STEP 3: PHASE CONFIGURATION

Periodization phases with the classic 3-phase model:

```
+-- PHASE 1: ACCUMULATION ----+  [ weeks 1-4 ]
| Sets:      [ 3-4 ]           |
| Reps:      [ 8-12 ]          |
| Intensity: [ 70% 1RM ]       |
| Rest:      [ 90 sec ]        |
| Tempo:     [ 3-0-1-0 ]       |
+------------------------------+

+-- PHASE 2: INTENSIFICATION -+  [ weeks 5-8 ]
| Sets:      [ 3 ]             |
| Reps:      [ 6-8 ]           |
| Intensity: [ 80% 1RM ]       |
| Rest:      [ 120 sec ]       |
| Tempo:     [ 2-1-1-0 ]       |
+------------------------------+

+-- PHASE 3: REALIZATION -----+  [ weeks 9-12 ]
| Sets:      [ 2-3 ]           |
| Reps:      [ 4-6 ]           |
| Intensity: [ 85% 1RM ]       |
| Rest:      [ 180 sec ]       |
| Tempo:     [ 2-0-X-0 ]       |
+------------------------------+
```

Phase timeline bar:
```
[====ACCUMULATION====][===INTENSIFICATION===][====REALIZATION====]
     (purple)               (amber)               (green)
```

Allow: Add Phase (duplicates last phase) / Remove Phase (confirm first) / Edit any values inline.

Phase colors: Accumulation = #8B5CF6 purple, Intensification = #F59E0B amber, Realization = #22C55E green.

[Back] [Next: Exercises]

---

## STEP 4: EXERCISE SELECTION

The most complex step. Interface:

Left side (40%): Exercise Picker Panel
Right side (60%): Current Day's Workout

### Left Panel — Exercise Picker

- Search bar: "Search exercises..." (searches name, muscle, equipment)
- Filter chips: [All Muscles] [Chest] [Back] [Legs] [Shoulders] [Arms] [Core] | [All Equipment] [Barbell] [Dumbbell] [Cable] [Bodyweight] [Machine]
- Exercise list (scrollable): Each row shows:
  - Exercise ID (small, muted)
  - Name (bold)
  - Primary Muscle (color badge)
  - Equipment (small tag)
  - Difficulty (dot: green/yellow/red)
  - [+] Add button

Use this inline exercise data (200 exercises). At minimum include the first 50 most common:

```javascript
const EXERCISES = [
  { id: "EX001", name: "Barbell Back Squat", primaryMuscle: "Quads", secondaryMuscle: "Glutes", equipment: "Barbell", difficulty: "Intermediate", type: "Compound", description: "High-bar squat full depth brace core. Drive through mid-foot, knees track over toes, chest up.", safetyNotes: "Use safety pins knee valgus check", met: 8.0 },
  { id: "EX002", name: "Romanian Deadlift", primaryMuscle: "Hamstrings", secondaryMuscle: "Glutes", equipment: "Barbell", difficulty: "Intermediate", type: "Compound", description: "Hip hinge neutral spine hamstring stretch.", safetyNotes: "Keep bar close to shins", met: 7.5 },
  { id: "EX003", name: "Bench Press", primaryMuscle: "Chest", secondaryMuscle: "Triceps", equipment: "Barbell", difficulty: "Intermediate", type: "Compound", description: "Retract scapula controlled touch to chest.", safetyNotes: "Spotter required for heavy sets", met: 7.0 },
  { id: "EX004", name: "Overhead Press", primaryMuscle: "Shoulders", secondaryMuscle: "Traps", equipment: "Barbell", difficulty: "Intermediate", type: "Compound", description: "Strict press no leg drive bar path over mid-foot.", safetyNotes: "Squeeze glutes brace abs", met: 6.5 },
  { id: "EX005", name: "Pull-Up", primaryMuscle: "Back", secondaryMuscle: "Biceps", equipment: "Pull-Up Bar", difficulty: "Intermediate", type: "Compound", description: "Full dead hang chin over bar depress scapula.", safetyNotes: "Use band assist if needed", met: 7.0 },
  { id: "EX006", name: "Barbell Row", primaryMuscle: "Back", secondaryMuscle: "Biceps", equipment: "Barbell", difficulty: "Intermediate", type: "Compound", description: "Pendlay style flat back pull to lower chest.", safetyNotes: "Hips hinge bar close to shins", met: 7.0 },
  { id: "EX007", name: "Front Squat", primaryMuscle: "Quads", secondaryMuscle: "Core", equipment: "Barbell", difficulty: "Advanced", type: "Compound", description: "Elbows high upright torso ATG depth.", safetyNotes: "Knees out core tight breathe into belly", met: 8.0 },
  { id: "EX008", name: "Incline Dumbbell Press", primaryMuscle: "Chest", secondaryMuscle: "Shoulders", equipment: "Dumbbells", difficulty: "Intermediate", type: "Compound", description: "30-45 degree incline controlled eccentric.", safetyNotes: "Dumbbells to upper chest press up slightly inward", met: 6.5 },
  { id: "EX009", name: "Dumbbell Lunge", primaryMuscle: "Quads", secondaryMuscle: "Glutes", equipment: "Dumbbells", difficulty: "Beginner", type: "Compound", description: "Step forward back knee near floor push through heel.", safetyNotes: "Torso upright front knee tracks over toe", met: 6.0 },
  { id: "EX010", name: "Leg Press", primaryMuscle: "Quads", secondaryMuscle: "Glutes", equipment: "Leg Press", difficulty: "Beginner", type: "Compound", description: "Full ROM do not lock knees.", safetyNotes: "Feet shoulder-width lower until thighs break 90", met: 6.5 },
  { id: "EX011", name: "Leg Curl", primaryMuscle: "Hamstrings", secondaryMuscle: "", equipment: "Leg Curl", difficulty: "Beginner", type: "Isolation", description: "Control negative avoid momentum.", safetyNotes: "Heels against pad squeeze hamstrings", met: 4.5 },
  { id: "EX012", name: "Leg Extension", primaryMuscle: "Quads", secondaryMuscle: "", equipment: "Leg Extension", difficulty: "Beginner", type: "Isolation", description: "Squeeze at top controlled lowering.", safetyNotes: "Adjust pad above ankle extend fully", met: 4.0 },
  { id: "EX013", name: "Cable Fly", primaryMuscle: "Chest", secondaryMuscle: "", equipment: "Cable", difficulty: "Intermediate", type: "Isolation", description: "Slight elbow bend squeeze at midline.", safetyNotes: "Step forward stretch at bottom cross slightly", met: 5.0 },
  { id: "EX014", name: "Lateral Raise", primaryMuscle: "Shoulders", secondaryMuscle: "", equipment: "Dumbbells", difficulty: "Beginner", type: "Isolation", description: "Lead with elbows control negative slight forward lean.", safetyNotes: "Thumbs up raise to shoulder height no swinging", met: 4.0 },
  { id: "EX015", name: "Face Pull", primaryMuscle: "Rear Delts", secondaryMuscle: "Upper Back", equipment: "Cable", difficulty: "Beginner", type: "Isolation", description: "Pull to face level external rotation at end.", safetyNotes: "Rope attachment elbows high squeeze rear delts", met: 4.5 },
  { id: "EX016", name: "Tricep Pushdown", primaryMuscle: "Triceps", secondaryMuscle: "", equipment: "Cable", difficulty: "Beginner", type: "Isolation", description: "Elbows fixed at sides full extension.", safetyNotes: "Rope or bar hinge slightly forward lock out", met: 4.0 },
  { id: "EX017", name: "Barbell Curl", primaryMuscle: "Biceps", secondaryMuscle: "", equipment: "Barbell", difficulty: "Beginner", type: "Isolation", description: "No swing full stretch at bottom.", safetyNotes: "Shoulders back curl to chin level squeeze biceps", met: 4.5 },
  { id: "EX018", name: "Hammer Curl", primaryMuscle: "Biceps", secondaryMuscle: "Forearms", equipment: "Dumbbells", difficulty: "Beginner", type: "Isolation", description: "Neutral grip brachialis emphasis.", safetyNotes: "Elbows pinned curl toward opposite shoulder", met: 4.0 },
  { id: "EX019", name: "Plank", primaryMuscle: "Core", secondaryMuscle: "", equipment: "Bodyweight", difficulty: "Beginner", type: "Isometric", description: "Neutral spine squeeze glutes hold.", safetyNotes: "Forearms under shoulders brace abs breathe steady", met: 3.5 },
  { id: "EX020", name: "Dead Bug", primaryMuscle: "Core", secondaryMuscle: "", equipment: "Bodyweight", difficulty: "Beginner", type: "Isometric", description: "Lower back pressed to floor slow limb movement.", safetyNotes: "Exhale as limb extends maintain hollow body", met: 3.5 },
  { id: "EX021", name: "Hip Thrust", primaryMuscle: "Glutes", secondaryMuscle: "", equipment: "Barbell", difficulty: "Intermediate", type: "Compound", description: "Chin tucked eyes forward full hip extension.", safetyNotes: "Shoulders on bench squeeze glutes at top no arching back", met: 7.0 },
  { id: "EX022", name: "Bulgarian Split Squat", primaryMuscle: "Quads", secondaryMuscle: "Glutes", equipment: "Dumbbells", difficulty: "Intermediate", type: "Compound", description: "Rear foot elevated torso slight forward lean.", safetyNotes: "Front knee tracks toe drive through heel control down", met: 7.0 },
  { id: "EX023", name: "Snatch", primaryMuscle: "Full Body", secondaryMuscle: "", equipment: "Barbell", difficulty: "Advanced", type: "Olympic", description: "Wide grip explosive triple extension catch overhead.", safetyNotes: "Bar close to body fast drop under stable catch", met: 10.0 },
  { id: "EX024", name: "Clean", primaryMuscle: "Full Body", secondaryMuscle: "", equipment: "Barbell", difficulty: "Advanced", type: "Olympic", description: "Power or full front rack catch elbows fast.", safetyNotes: "Triple extension shrug high rotate elbows around bar", met: 9.5 },
  { id: "EX025", name: "Clean & Jerk", primaryMuscle: "Full Body", secondaryMuscle: "", equipment: "Barbell", difficulty: "Advanced", type: "Olympic", description: "Two-step lift: clean to shoulders jerk overhead.", safetyNotes: "Dip and drive split or push jerk lock arms", met: 10.0 },
  { id: "EX026", name: "Push Press", primaryMuscle: "Shoulders", secondaryMuscle: "Legs", equipment: "Barbell", difficulty: "Intermediate", type: "Compound", description: "Leg dip drive finish with strict press lockout.", safetyNotes: "Dip shallow drive through heels no re-bend", met: 6.5 },
  { id: "EX027", name: "Goblet Squat", primaryMuscle: "Quads", secondaryMuscle: "Core", equipment: "Dumbbells", difficulty: "Beginner", type: "Compound", description: "Hold at chest upright torso full depth.", safetyNotes: "Elbows inside knees drive knees out chest up", met: 5.5 },
  { id: "EX028", name: "Kettlebell Swing", primaryMuscle: "Posterior Chain", secondaryMuscle: "", equipment: "Kettlebell", difficulty: "Intermediate", type: "Compound", description: "Hip hinge not squat explosive snap float at top.", safetyNotes: "Power from hips arms passive snap hips forward", met: 8.0 },
  { id: "EX029", name: "Farmers Walk", primaryMuscle: "Grip", secondaryMuscle: "Traps", equipment: "Dumbbells", difficulty: "Beginner", type: "Compound", description: "Heavy weights tall posture controlled steps.", safetyNotes: "Shoulders back core tight short strides no sway", met: 6.0 },
  { id: "EX030", name: "T-Bar Row", primaryMuscle: "Back", secondaryMuscle: "", equipment: "T-Bar", difficulty: "Intermediate", type: "Compound", description: "Chest supported squeeze shoulder blades.", safetyNotes: "Hinge at hips pull to lower chest control eccentric", met: 7.0 }
  // Include remaining 170 exercises as a JSON import file. Kimi Code should read from the 02_DATABASE/AzFIT_Database_Restructured.xlsx file for the full list.
]
```

**For the full 200 exercises**, read from the database file `EXERCISES` sheet. Each exercise has: Exercise_ID, Name, Primary_Muscle, Secondary_Muscle, Equipment, Difficulty, Type, Description, Safety_Notes, MET_Value.

### Right Panel — Day's Workout

Day tabs at top (only training days): Mon | Wed | Fri | Sat

Current day display:
```
MONDAY — Upper Body
#  Exercise            Sets  Reps  Rest  Phase      
1  Barbell Bench Press  4     12    90s   Acc  [x] [v]
2  Incline DB Press     4     12    90s   Acc  [x] [v]
3  Cable Fly            3     15    60s   Acc  [x] [v]
4  Pull-Up              4     10    90s   Acc  [x] [v]
5  Barbell Row          4     10    90s   Acc  [x] [v]

[+] Add Exercise   [Duplicate Day]   [Clear Day]
```

Each exercise row:
- Drag handle (::) on left for reordering
- Sets, Reps, Rest — editable inline (click → edit → enter to save)
- Phase badge (Acc/Int/Real — purple/amber/green)
- Expand arrow (v) — shows description, safety notes, video URL placeholder
- Remove (x) button

[Back] [Next: Review]

---

## STEP 5: REVIEW & SAVE

Program summary:
- Program name (editable): "[Client Name] — [Template Name]"
- Duration: X weeks
- Frequency: X days/week
- Split: [type]
- Total exercises: X
- Est. session time: ~X min

Phase breakdown bar (visual)
Day-by-day summary (collapsible)

[Save Program] — stores to localStorage key "azfit-programs"

Program schema:
```javascript
{
  id: "prog_" + Date.now(),
  coachId: string,
  clientId: string,
  name: string,
  templateId: string, // or "custom"
  config: {
    goal: string,
    split: string,
    trainingDays: ["Mon", "Wed", "Fri"],
    frequency: 3,
    durationWeeks: 12,
    phases: [
      { name: "Accumulation", weeks: 4, sets: "3-4", reps: "8-12", intensity: "70%", restSeconds: 90, tempo: "3-0-1-0" },
      { name: "Intensification", weeks: 4, sets: "3", reps: "6-8", intensity: "80%", restSeconds: 120, tempo: "2-1-1-0" },
      { name: "Realization", weeks: 4, sets: "2-3", reps: "4-6", intensity: "85%", restSeconds: 180, tempo: "2-0-X-0" }
    ]
  },
  days: [
    {
      day: "Mon",
      name: "Upper Body",
      exercises: [
        { exerciseId: "EX003", sets: 4, reps: 12, restSeconds: 90, phase: "accumulation", notes: "" }
      ]
    }
  ],
  status: "active",
  createdAt: ISO string,
  updatedAt: ISO string
}
```

After save: Redirect to Programs list page. Show success toast.

---

## DELIVERABLE — TEST CHECKLIST

1. [ ] "Programs" sidebar link works
2. [ ] "Create New Program" button opens template selection
3. [ ] Auto-filters show based on client's goal/level/equipment
4. [ ] Search bar filters programs by name
5. [ ] Category filter chips toggle on/off
6. [ ] Select a template → goes to split configuration
7. [ ] Toggle training days on/off
8. [ ] Counter shows correct number of training days
9. [ ] Phase configuration shows 3 default phases
10. [ ] Can edit sets/reps/rest/tempo values
11. [ ] Phase timeline bar shows correct proportions
12. [ ] Exercise search finds exercises by name
13. [ ] Muscle filter shows only matching exercises
14. [ ] Click [+] adds exercise to current day
15. [ ] Can edit sets/reps/rest inline
16. [ ] Can drag to reorder exercises
17. [ ] Can remove exercises
18. [ ] Day tabs switch between different training days
19. [ ] Review page shows correct summary
20. [ ] Save program → appears in programs list
21. [ ] Program is linked to the correct client
