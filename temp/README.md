# AzFIT Program Card System — Integration Guide

## What's In This Package

This is the complete **Program Card / Program Builder** system for AzFIT Client Portal. It provides interactive exercise cards where clients can log their workout sets, track volume, manage rest timers, and view lift records.

## Files

```
src/
├── components/
│   └── ProgramBuilder/
│       ├── ExerciseCard.tsx        # Main collapsible exercise card (21KB)
│       ├── LiftRecordModal.tsx     # Per-rep max lift record modal (5.5KB)
│       ├── EditExerciseModal.tsx   # Exercise replacement modal (8.7KB)
│       └── WorkoutSummary.tsx      # Workout progress summary bar (3.3KB)
├── pages/
│   └── ProgramBuilderPage.tsx      # Main page assembling all components
├── hooks/
│   └── useRestTimer.ts             # Per-exercise rest countdown timer hook
├── types/
│   └── program-builder.ts          # TypeScript types for the system
├── KIMI_CODE_PROMPT.md             # Full prompt to send to Kimi Code
└── README.md                       # This file
```

## Quick Integration Steps

### Step 1: Copy Files

Copy the files into your AzFIT project at the same paths:

```bash
# From this package:
src/components/ProgramBuilder/     → your-project/src/components/ProgramBuilder/
src/pages/ProgramBuilderPage.tsx   → your-project/src/pages/ProgramBuilderPage.tsx
src/hooks/useRestTimer.ts          → your-project/src/hooks/useRestTimer.ts
```

### Step 2: Add Types

Merge the types from `src/types/program-builder.ts` into your existing `src/types/index.ts`.

### Step 3: Add Route

In `src/App.tsx`, add:

```tsx
import ProgramBuilderPage from './pages/ProgramBuilderPage';

// Inside <Routes>:
<Route path="/programs/builder" element={<Layout><ProgramBuilderPage /></Layout>} />
```

### Step 4: Add CSS Variables (if needed)

Ensure your `index.css` has these variables (they may already exist):

```css
:root {
  --cyan: #00AEEF;
  --purple: #8B5CF6;
  --success: #22C55E;
  --warning: #F59E0B;
  --danger: #EF4444;
}
```

### Step 5: Replace Demo Data

`ProgramBuilderPage.tsx` currently has hardcoded demo data. Replace the `INITIAL_EXERCISES` array with data from your program system (e.g., output from the All-in-One Program Creator).

## Key Behaviors

| Feature | How It Works |
|---------|-------------|
| Expand/collapse | Only one card open at a time. Chevron toggles. |
| Click Done ☐→✅ | Auto-fills prescribed values, starts rest timer, checks for PR |
| Carry-over | Next empty set auto-fills with last logged actual values |
| Rest timer | Live countdown per exercise. Skip/+30s buttons |
| Pills −2.5/+2.5 | ONLY affect the focused set's Client Load |
| Notes 📝 | Toggle inline note fields per set |
| Type dropdown | Normal/Warm-up/Drop Set/To Failure/AMRAP — no page reload |
| Lift record modal | Per-rep maxes with inheritance (lower rep → higher rep) |
| Edit exercise modal | Replace with similar (muscle group) or different exercise |
| Volume bar | Auto-calculates from logged sets, updates live |
| RPE-based 1RM | More accurate than Epley formula |

## No-Focus-Glitch Guarantee

This version has been specifically fixed to avoid the focus/render loop glitch:
- `focus` events do NOT trigger re-render
- `change` events on select dropdowns do NOT trigger re-render
- Only data-altering actions (Done toggle, Add Set, pill click) trigger re-render
- RPE and Type inputs update data silently without DOM rebuild

## Send to Kimi Code

1. Upload the **KIMI_CODE_PROMPT.md** file to Kimi Code
2. Upload the **src/** folder (or the zip file)
3. Tell Kimi Code to read the prompt first and ask questions before deploying
