# Kimi Code Prompt: AzFIT Program Card System

## Context
This is for the **AzFIT Client Portal** — a personal training client management app built with React 19, Vite, TypeScript, Tailwind CSS, and shadcn/ui. The app has a dark mode theme with a deep charcoal/navy aesthetic and cyan accent colors.

## What You Need to Implement
The **Program Card / Program Builder** component system that displays workout exercises in an interactive, collapsible card format for clients to log their sets during workouts.

## Where It Fits in the App
After the user completes the **"All-in-One Program Creator"** (`AllInOneProgramPage.tsx`), the generated program data should feed into this **Program Card** system. When a client opens their assigned program for the day, they see exercise cards where they can log each set.

## Files Included in This Package

| File | Purpose |
|------|---------|
| `ExerciseCard.tsx` | Main collapsible exercise card with set table, inputs, pills |
| `LiftRecordModal.tsx` | Modal for viewing/editing per-rep max lift records |
| `EditExerciseModal.tsx` | Modal for replacing exercises with similar or different ones |
| `WorkoutSummary.tsx` | Top summary bar showing workout progress, volume, time |
| `ProgramBuilderPage.tsx` | Main page assembling all components together |
| `useRestTimer.ts` | Hook for managing per-exercise rest countdown timers |
| `types.ts` | TypeScript types for exercises, sets, lift records |
| `index.css` | Additional CSS variables for the program card theme |

## Complete Feature List

### 1. Exercise Card (Collapsed State)
```
A1. Barbell Back Squat | 4×6 | 120 kg ▼ ✎
```
- **Exercise ID + Name** (clickable → opens Lift Record modal)
- **Scheme** (e.g., 4×6) 
- **Target weight** (editable input, no brackets — e.g., "120 kg")
- **Chevron ▼/▲** — expands/collapses card (only one card expanded at a time)
- **✎ Edit icon** — opens Edit Exercise modal

### 2. Exercise Card (Expanded State)
9-column table:
| Column | Description |
|--------|-------------|
| **Set** | Set number (1, 2, 3...) |
| **Prescribed** | Target from program (e.g., "4×6 @ 120 kg") |
| **Client Load** | Editable input — what the client actually lifted |
| **Load** | Display value (synced from Client Load) |
| **Reps** | Display value |
| **RPE** | Editable input (1-10 scale) |
| **Rest (s)** | Static target OR live countdown timer when active |
| **Type** | Dropdown: Normal / Warm-up / Drop Set / To Failure / AMRAP |
| **Done** | ☐ → ✅ toggle button |

### 3. Interactive Features

**Click "Done" (☐ → ✅):**
- Auto-fills Client Load and Reps from prescribed values if empty
- Checks against lift records — if PR achieved, shows "NEW PR! ✨" flash animation for 2.5s
- Starts rest timer countdown
- Carries over actual values to next empty set
- Row turns green (done) or amber (warning if below target)

**Rest Timer:**
- Auto-starts when set marked ✅
- Shows live countdown (e.g., "⏱️ 1:23")
- Turns amber (< 30s), red + pulse (< 15s)
- Skip Rest and +30s buttons during countdown

**Quick Adjust Pills (−2.5kg / +2.5kg):**
- ONLY affect the currently focused set (the row whose Client Load input has focus)
- Disabled until a Client Load field is focused
- Show "Set X:" label indicating which set is targeted

**Per-Set Notes (📝):**
- Small toggle button in bottom-right of card
- When toggled on, shows inline text fields for each set
- Notes persist with the set data

**Volume Progress Bar:**
- Full-width bar at bottom of card
- Cyan-to-purple gradient fill
- Shows percentage, volume (kg lifted / kg target), avg RPE, estimated 1RM

**+ Add Set button:**
- Adds a bonus set inheriting values from the last set

### 4. Lift Record Modal
- Opens when clicking exercise title
- Shows per-rep max records (reps 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12)
- **Inheritance logic:** Lower rep records auto-fill higher rep slots
- Explicit records shown with date; inherited values shown as "Inherited" in italic
- Editable — save updates records

### 5. Edit Exercise Modal
- Opens when clicking ✎ icon
- Two modes:
  - **Replace with Similar:** Shows 6 exercise suggestions based on muscle group (auto-detected)
  - **Replace with Different:** Full exercise library search
- Warning: "This change will update your program phase automatically."

### 6. Workout Summary (Top of Page)
```
🏋️ Lower Body Day | 4 exercises | 8/12 sets | 💪 2,027 kg | ⏱️ 32:00 | [██████████░░░] 70%
```
- Shows overall workout progress
- Elapsed time counter
- Volume progress bar

### 7. Theme Support
- Uses CSS custom properties matching existing AzFIT dark theme
- Compatible with the existing theme toggle system
- Cards have gradient backgrounds matching the toolbar/sidebar aesthetic

## Data Structures

```typescript
interface ExerciseSet {
  set: number;
  prescribed: string;      // e.g., "4×6 @ 120 kg"
  clientLoad: string;      // editable input value
  load: string;            // display value
  reps: string;
  rpe: string;
  rest: string;            // rest in seconds
  type: 'Normal' | 'Warm-up' | 'Drop Set' | 'To Failure' | 'AMRAP';
  done: 'done' | 'warning' | 'empty';
  note?: string;
  lastWeekLoad?: string;   // for comparison tooltip
  lastWeekReps?: string;
}

interface Exercise {
  id: string;              // e.g., "A1"
  name: string;
  scheme: string;          // e.g., "4×6"
  target: string;          // e.g., "120"
  unit: 'kg' | 'lbs';
  muscleGroup: string;     // e.g., "Quads, Glutes"
  sets: ExerciseSet[];
  _expanded?: boolean;
}

interface LiftRecord {
  val: string;             // weight in kg
  date: string;            // e.g., "May 15, 2024"
}
```

## Integration Notes

### Where to place files:
- Components → `src/components/ProgramBuilder/`
- Hook → `src/hooks/useRestTimer.ts`
- Types → merge into `src/types/index.ts`
- Page → `src/pages/ProgramBuilderPage.tsx`
- Route → add `<Route path="/programs/builder" element={<Layout><ProgramBuilderPage /></Layout>} />` in `App.tsx`

### How it connects to existing program data:
The `ProgramBuilderPage.tsx` currently has hardcoded demo data. You should replace this with data from:
- The All-in-One Program Creator output
- Or a program assignment system (trainer assigns program → client views it)
- Each exercise in the program becomes an `Exercise` card

### CSS Variables to add to existing `index.css`:
```css
:root {
  --cyan: #00AEEF;
  --purple: #8B5CF6;
  --success: #22C55E;
  --warning: #F59E0B;
  --danger: #EF4444;
}
```

## CRITICAL: Before Deploying

**Please ask me these questions first:**

1. **Where does the program data come from?** Should I connect to the existing All-in-One Program Creator output, or use the hardcoded demo data for now?

2. **What route should this live at?** `/programs/builder`? Or should it replace the existing Programs page?

3. **Should I modify existing files** (App.tsx, types/index.ts) or do you want me to create a standalone page first?

4. **Do you want to keep the existing ProgramCreatorPage.tsx** alongside this, or replace it?

5. **For the Edit Exercise "Replace with Similar" feature:** Should I build a full exercise database, or start with the hardcoded muscle-group mappings included in the code?

## Known Issues Already Fixed in This Version

- ✅ Focus glitching when clicking inputs (fixed by removing `render()` from focus handlers)
- ✅ Dropdown/select closing immediately (fixed by adding `event.stopPropagation()` and removing `render()` on change)
- ✅ Per-set pills only affect focused set (not all sets)
- ✅ Brackets removed from target weight display
- ✅ Dark theme glow aesthetic preserved

## Before You Start

Please review the included files and ask any clarifying questions. I want to be efficient and avoid unnecessary iterations. Let me know if any of the features should be simplified or if there are integration concerns with the existing codebase.
