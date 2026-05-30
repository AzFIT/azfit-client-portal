# AzFIT Client Portal — Complete Architecture Workflow

> ASCII diagrams showing the full system: routing, data flow, state management, user journeys, and component hierarchy.

---

## 1. HIGH-LEVEL SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           AZFIT CLIENT PORTAL — SYSTEM MAP                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│   │   React 19   │────▶│  Vite 7 Dev  │────▶│  GH Pages    │────▶│   Browser    │   │
│   │   (Source)   │     │   (Build)    │     │  (Deploy)    │     │   (User)     │   │
│   └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘   │
│          │                    │                    │                    │           │
│          │                    │                    │                    │           │
│          ▼                    ▼                    ▼                    ▼           │
│   ┌─────────────────────────────────────────────────────────────────────────┐       │
│   │                         RUNTIME DEPENDENCIES                            │       │
│   │  Tailwind CSS 3  |  shadcn/ui  |  Framer Motion  |  Lucide React        │       │
│   └─────────────────────────────────────────────────────────────────────────┘       │
│                                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────┐       │
│   │                         EXTERNAL DATA SOURCES                           │       │
│   │  ./programs_db.json (84 programs)  |  ./exercises_db.json (255 ex)     │       │
│   └─────────────────────────────────────────────────────────────────────────┘       │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ROUTING & PAGE STRUCTURE (HashRouter, base: `./`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              ROUTER MAP (HashRouter)                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌─────────────┐                                                                   │
│   │    /        │──────▶ LandingPage (Hero + Feature cards + CTA)                  │
│   └─────────────┘                                                                   │
│         │                                                                           │
│         │         ┌─────────────┐                                                   │
│         ├────────▶│   /login    │──────▶ LoginPage                                   │
│         │         └─────────────┘                                                   │
│         │         ┌─────────────┐                                                   │
│         ├────────▶│  /register  │──────▶ RegisterPage                                │
│         │         └─────────────┘                                                   │
│         │                                                                           │
│         │         ┌─────────────┐     ┌─────────────────────────────────────────┐   │
│         ├────────▶│  /programs  │────▶│           PROGRAMS HUB                 │   │
│         │         └─────────────┘     │  ┌─────────────────────────────────┐   │   │
│         │                             │  │  Template Feature Cards (7)     │   │   │
│         │                             │  │  ├─ GVT, GBC, HIIT, PPL          │   │   │
│         │                             │  │  ├─ Full Body, Strength, Custom  │   │   │
│         │                             │  └─────────────────────────────────┘   │   │
│         │                             │  ┌─────────────────────────────────┐   │   │
│         │                             │  │  Program Grid (84 + custom)     │   │   │
│         │                             │  │  ├─ Filter by goal/template      │   │   │
│         │                             │  │  ├─ Sort / Search                │   │   │
│         │                             │  │  └─ Card: progress, badges, CTA  │   │   │
│         │                             │  └─────────────────────────────────┘   │   │
│         │                             └─────────────────────────────────────────┘   │
│         │                                                                           │
│         │         ┌─────────────────────┐                                           │
│         ├────────▶│ /programs/create    │──────▶ AllInOneProgramPage (Creator)     │
│         │         └─────────────────────┘                                           │
│         │                                                                           │
│         │         ┌─────────────────────────────────────────────────────────────┐   │
│         ├────────▶│ /programs/session/:programId                                │   │
│         │         └─────────────────────────────────────────────────────────────┘   │
│         │                              │                                            │
│         │                              ▼                                            │
│         │                   ┌──────────────────────┐                                │
│         │                   │   ProgramBuilderPage │                                │
│         │                   │  ┌────────────────┐  │                                │
│         │                   │  │ Day Tabs       │  │  ◄── multi-day selector       │
│         │                   │  │ Client Profile │  │  ◄── experience/equipment     │
│         │                   │  │ Phase Progress │  │  ◄── Accum→Intens→Realiz      │
│         │                   │  │ Day Method     │  │  ◄── Straight/Superset/Triset │
│         │                   │  │ WorkoutSummary │  │                                │
│         │                   │  │ ExerciseCard[] │  │  ◄── collapsible set tables    │
│         │                   │  │   ├─ Done toggle                                 │
│         │                   │  │   ├─ Quick adjust ±2.5kg                         │
│         │                   │  │   ├─ Per-set rest timer                          │
│         │                   │  │   ├─ Volume bar                                  │
│         │                   │  │   └─ Notes / Lift Records                        │
│         │                   │  └────────────────┘  │                                │
│         │                   └──────────────────────┘                                │
│         │                                                                           │
│         │         ┌─────────────┐                                                   │
│         ├────────▶│ /exercises  │──────▶ ExerciseLibraryPage (255 exercises)      │
│         │         └─────────────┘                                                   │
│         │                                                                           │
│         │         ┌─────────────┐     ┌──────────────────────────────────────┐     │
│         ├────────▶│   /client   │────▶│          CLIENT DASHBOARD            │     │
│         │         └─────────────┘     │  Progress Photos | Metrics | Diet    │     │
│         │                             └──────────────────────────────────────┘     │
│         │                                                                           │
│         │         ┌─────────────┐                                                   │
│         └────────▶│    /chat    │──────▶ AIChat (bottom-left draggable)           │
│                   └─────────────┘                                                   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. DATA FLOW — Program Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         PROGRAM LIFECYCLE DATA FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   STEP 1: CREATION                                                                  │
│   ═════════════════                                                                 │
│                                                                                     │
│   ┌─────────────────┐     ┌──────────────────────────────────────────────────┐     │
│   │  Trainer fills  │     │  AllInOneProgramPage (6-step wizard)             │     │
│   │  program form   │────▶│  ├─ Step 1: Goal + Method + Client Context      │     │
│   └─────────────────┘     │  ├─ Step 2: Weekly Hours + Split                │     │
│                           │  ├─ Step 3: Exercise Selection (255 exercises)  │     │
│                           │  ├─ Step 4: Phase Configuration                 │     │
│                           │  ├─ Step 5: Review + Save                       │     │
│                           │  └─ Step 6: Assign to Client                    │     │
│                           └──────────────────────────────────────────────────┘     │
│                                          │                                          │
│                                          ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐      │
│   │  SAVE ──▶ localStorage['azfit-programs'] = SavedProgram[]              │      │
│   │                                                                         │      │
│   │  SavedProgram {                                                         │      │
│   │    id: string                                                           │      │
│   │    createdAt: ISOString                                                 │      │
│   │    updatedAt: ISOString                                                 │      │
│   │    data: ProgramData {                                                  │      │
│   │      programName, goal, method,                                         │      │
│   │      clientContext: { ageRange, experience, bodyType, ... },           │      │
│   │      phases: [{ id, name, weeks, focus, color, active }],              │      │
│   │      split: [{ day, active, workout }],                                │      │
│   │      exercises: [{ code, name, sets, reps, pct1RM, tempo, rest }],     │      │
│   │      tags, isPublic, assignedClient,                                    │      │
│   │      // ENHANCED FIELDS:                                                │      │
│   │      template?: 'GVT'|'GBC'|'HIIT'|'PPL'|'Full Body'|'Strength'|'Custom'│      │
│   │      trainingMethod?: 'Straight Sets'|'Superset'|'Triset'              │      │
│   │      clientProfile?: { experience, equipment, timePerSession }         │      │
│   │      totalSets?: number                                                 │      │
│   │      days?: [{ day, dayNumber, method, exercises[] }]                  │      │
│   │    }                                                                    │      │
│   │  }                                                                      │      │
│   └─────────────────────────────────────────────────────────────────────────┘      │
│                                          │                                          │
│   STEP 2: BUILT-IN PROGRAMS (84 from CSV)                                           │
│   ═══════════════════════════════════════                                           │
│                                                                                     │
│   ┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────────────┐   │
│   │  temp/ CSVs     │────▶│ generate_programs.cjs│────▶│ public/programs_db.json │   │
│   │  (84 programs)  │     │  (Node script)       │     │  (SavedProgram[] format)│   │
│   └─────────────────┘     └─────────────────────┘     └─────────────────────────┘   │
│                                                                   │                 │
│   STEP 3: DISCOVERY (ProgramsPage)                                                  │
│   ═══════════════════════════════════════                                           │
│                                                                   │                 │
│                                                                   ▼                 │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │  ProgramsPage.loadPrograms()                                                 │   │
│   │    ├─ fetch('./programs_db.json') ──▶ 84 built-in programs                  │   │
│   │    └─ localStorage['azfit-programs'] ──▶ user-created programs              │   │
│   │         ▼                                                                   │   │
│   │    MERGE ──▶ deduplicate by id ──▶ display grid                             │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                          │
│   STEP 4: SESSION START                                                             │
│   ═══════════════════════                                                           │
│                                          │                                          │
│                                          ▼                                          │
│   User clicks "Start Session" on a program card                                     │
│       │                                                                             │
│       ├─── If built-in program ──▶ save to localStorage['azfit-programs'] first    │
       │                                                                             │
│       └─── Navigate to /programs/session/:programId                                │
│                                          │                                          │
│                                          ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │  ProgramBuilderPage loads:                                                   │   │
│   │    1. Find program in localStorage['azfit-programs'] by id                   │   │
│   │    2. Check localStorage[`azfit-session-${programId}`] for existing session  │   │
│   │         ├─ EXISTS ──▶ restore exercises, liftRecords, elapsed, activeDay     │   │
│   │         └─ NEW ──▶ fetch('./exercises_db.json') for muscleGroup mapping      │   │
│   │                   convert CreatorExercise[] ──▶ Exercise[] (builder format)   │   │
│   │    3. If program.data.days exists ──▶ day-aware display with tabs             │   │
│   │       Else ──▶ flat exercise list (legacy)                                   │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                          │
│   STEP 5: SESSION PERSISTENCE                                                       │
│   ═══════════════════════════                                                       │
│                                          │                                          │
│   Every state change ──▶ auto-save to localStorage[`azfit-session-${programId}`]   │
│                                                                                     │
│   {                                                                                 │
│     exercises: Exercise[],      // with _dayIndex, _method, done status            │
│     liftRecords: { [exId]: { [setNum]: { val, date } } },                          │
│     elapsed: number,            // session duration in seconds                     │
│     activeDay: number           // currently selected day index                    │
│   }                                                                                 │
│                                                                                     │
│   STEP 6: EDIT FLOW                                                                 │
│   ═══════════════════                                                               │
│                                                                                     │
│   User clicks "Edit" ──▶ localStorage.setItem('azfit-creator-edit-id', program.id) │
│                    ──▶ navigate('/programs/create')                                  │
│                    ──▶ AllInOneProgramPage reads edit-id and pre-fills form         │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. COMPONENT HIERARCHY

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           COMPONENT TREE (src/)                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  App.tsx                                                                            │
│  └── Layout.tsx  ────────────────────────────────────────────────────────────────┐  │
│       ├── Navbar.tsx (logo, nav links, theme toggle)                              │  │
│       │                                                                           │  │
│       ├── Routes ────────────────────────────────────────────────────────────────│  │
│       │    ├── LandingPage.tsx                                                    │  │
│       │    │    └── FeatureCards, CTASection                                     │  │
│       │    │                                                                      │  │
│       │    ├── ProgramsPage.tsx  ◄── CURRENT HUB                                 │  │
│       │    │    ├── TemplateFeatureCard[]  (7 template selectors)                │  │
│       │    │    ├── FilterBar (search, goal, template, sort)                     │  │
│       │    │    └── ProgramCard[]                                               │  │
│       │    │         ├── Goal badge, Template badge, Method badge                │  │
│       │    │         ├── ClientProfile micro-bar                                 │  │
│       │    │         ├── Stats grid (weeks, days, exercises, sets)               │  │
│       │    │         ├── Progress bar                                            │  │
│       │    │         ├── Phase pills                                             │  │
│       │    │         └── Action buttons (Start, Edit, Duplicate, Delete)         │  │
│       │    │                                                                      │  │
│       │    ├── AllInOneProgramPage.tsx  (6-step creator wizard)                   │  │
│       │    │    ├── StepIndicator                                                │  │
│       │    │    ├── GoalSelector, MethodSelector                                 │  │
│       │    │    ├── ExercisePicker (255 exercises, search, filters)              │  │
│       │    │    ├── PhaseConfigurator (Accum/Intens/Realiz)                      │  │
│       │    │    ├── ProgramReview                                               │  │
│       │    │    └── Save & Assign flow                                          │  │
│       │    │                                                                      │  │
│       │    ├── ProgramBuilderPage.tsx  ◄── WORKOUT SESSION                       │  │
│       │    │    ├── ClientProfileBar (experience, equipment, time)               │  │
│       │    │    ├── PhaseProgress (phase sequence with week counts)              │  │
│       │    │    ├── DayTab[]  (multi-day selector)                               │  │
│       │    │    ├── DayMethodBanner (day name + method + stats)                  │  │
│       │    │    ├── WorkoutSummary (exercises, sets, volume, elapsed time)       │  │
│       │    │    ├── ExerciseCard[]  ◄── CORE INTERACTION                         │  │
│       │    │    │    ├── Header: code badge (A1), name, method badge             │  │
│       │    │    │    │       scheme, target input, expand toggle                 │  │
│       │    │    │    └── Expanded:                                              │  │
│       │    │    │         ├── Set table (prescribed, load, reps, RPE, rest)      │  │
│       │    │    │         │    ├─ Done checkbox (click to toggle)                │  │
│       │    │    │         │    ├─ Quick adjust pills (±2.5kg)                    │  │
│       │    │    │         │    ├─ Per-set rest timer (active on completed set)   │  │
│       │    │    │         │    └─ Row highlight (green when done)                │  │
│       │    │    │         ├── Volume progress bar                                │  │
│       │    │    │         └── Notes section                                      │  │
│       │    │    ├── LiftRecordModal (historical lift data per set)               │  │
│       │    │    └── EditExerciseModal (modify exercise parameters)               │  │
│       │    │                                                                      │  │
│       │    ├── ExerciseLibraryPage.tsx (255 exercises, video modal)               │  │
│       │    ├── ClientDashboardPage.tsx (photos, metrics, diet)                    │  │
│       │    └── /chat ──▶ AIChat.tsx  (bottom-left draggable)                      │  │
│       │                                                                           │  │
│       └── Footer.tsx                                                               │  │
│                                                                                    │  │
│  HOOKS (src/hooks/)                                                                │  │
│  ├── useRestTimer.ts  ──▶ per-exercise, per-set timer state                       │  │
│  └── (others)                                                                      │  │
│                                                                                    │  │
│  STORE (src/store.ts)                                                              │  │
│  └── Zustand store for global UI state                                            │  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. STATE MANAGEMENT MATRIX

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           STATE & STORAGE MAP                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────────────┐   │
│  │      REACT STATE            │  │         LOCAL STORAGE KEYS                  │   │
│  ├─────────────────────────────┤  ├─────────────────────────────────────────────┤   │
│  │                             │  │                                             │   │
│  │  ProgramsPage:              │  │  'azfit-programs'                           │   │
│  │  - programs[]               │  │    └── SavedProgram[] (custom + built-in)   │   │
│  │  - dbPrograms[]             │  │                                             │   │
│  │  - search, filters          │  │  'azfit-session-${programId}'               │   │
│  │  - templateFilter           │  │    └── { exercises, liftRecords, elapsed,   │   │
│  │                             │  │          activeDay }                        │   │
│  ├─────────────────────────────┤  │                                             │   │
│  │  ProgramBuilderPage:        │  │  'azfit-creator-edit-id'                    │   │
│  │  - exercises[]              │  │    └── programId string (for edit flow)     │   │
│  │  - liftRecords{}            │  │                                             │   │
│  │  - elapsed (timer)          │  │  'azfit-theme'                              │   │
│  │  - activeDay                │  │    └── 'light' | 'dark'                     │   │
│  │  - activeExercise (modals)  │  │                                             │   │
│  ├─────────────────────────────┤  │  'azfit-weight-unit'                        │   │
│  │  ExerciseCard (local):      │  │    └── 'kg' (locked, no toggle in UI)       │   │
│  │  - focusedSet               │  │                                             │   │
│  │  - noteSet                  │  │  'azfit-chat-history'                       │   │
│  │  - showPR                   │  │    └── ChatMessage[]                        │   │
│  ├─────────────────────────────┤  │                                             │   │
│  │  useRestTimer hook:         │  └─────────────────────────────────────────────┘   │
│  │  - timers: Record<exId, {   │                                                    │
│  │      active, remaining,      │  ┌─────────────────────────────────────────────┐   │
│  │      total, setIndex }>      │  │         ZUSTAND STORE                       │   │
│  ├─────────────────────────────┤  ├─────────────────────────────────────────────┤   │
│  │  AllInOneProgramPage:       │  │  - UI theme state (sync with localStorage)  │   │
│  │  - form state (6 steps)     │  │  - Global toast / notification queue        │   │
│  │  - selectedExercises[]      │  │  - Modal stack                              │   │
│  │  - phaseConfig              │  └─────────────────────────────────────────────┘   │
│  └─────────────────────────────┘                                                    │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. USER JOURNEY FLOWCHARTS

### Journey A: Trainer Creates & Assigns Program

```
┌─────────┐    ┌──────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Landing│───▶│ Programs │───▶│  New Program │───▶│   Creator   │───▶│   Review    │
│  Page   │    │   Hub    │    │   Button    │    │   Wizard    │    │  & Assign   │
└─────────┘    └──────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
      │            ▲                                                            │
      │            │                     ┌───────────────────────────────────────┘
      │            │                     │
      │     ┌──────┴────────┐            ▼
      │     │  ProgramCard  │◄─────────────────────────┐
      │     │  ├─ Start     │    Save to               │
      │     │  ├─ Edit      │───▶localStorage          │
      │     │  └─ Delete    │                          │
      │     └───────────────┘                          │
      │                                                │
      └────────────────────────────────────────────────┘
```

### Journey B: Client Starts Workout Session

```
┌─────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────────────────────────────┐
│ Programs│───▶│ Program  │───▶│   Session   │───▶│     ProgramBuilderPage            │
│   Hub   │    │  Card    │    │   Start     │    │  ┌────────────────────────────┐   │
└─────────┘    └──────────┘    └─────────────┘    │  │ 1. Pick Day (tab)          │   │
                                                  │  │ 2. See method banner       │   │
                                                  │  │ 3. Expand ExerciseCard     │   │
                                                  │  │ 4. Log sets (load/reps/RPE)│   │
                                                  │  │ 5. Click Done ──▶ rest timer│  │
                                                  │  │ 6. Repeat for all exercises│   │
                                                  │  └────────────────────────────┘   │
                                                  │              │                    │
                                                  │              ▼                    │
                                                  │  Auto-saved every state change    │
                                                  │  to localStorage[session-key]     │
                                                  └───────────────────────────────────┘
```

### Journey C: Resume Existing Session

```
┌─────────┐     ┌─────────────┐     ┌────────────────────────────────────────────┐
│ Programs│────▶│ Resume Btn  │────▶│  ProgramBuilderPage                        │
│   Hub   │     │ (progress>0)│     │  1. Load localStorage[azfit-session-{id}]  │
└─────────┘     └─────────────┘     │  2. Restore exercises (with done states)   │
                                    │  3. Restore liftRecords                    │
                                    │  4. Restore elapsed timer                  │
                                    │  5. Restore activeDay tab                  │
                                    └────────────────────────────────────────────┘
```

---

## 7. THEME SYSTEM FLOW

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           THEME TOGGLE FLOW                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   User clicks theme toggle in Navbar                                               │
│          │                                                                          │
│          ▼                                                                          │
│   ┌────────────────────┐                                                          │
│   │  Layout.tsx        │                                                          │
│   │  setTheme('light') │                                                          │
│   └────────────────────┘                                                          │
│          │                                                                          │
│          ├───▶ document.documentElement.classList.remove('dark')                   │
│          │     document.documentElement.classList.add('light')                      │
│          │                                                                          │
│          ├───▶ localStorage.setItem('azfit-theme', 'light')                        │
│          │                                                                          │
│          └───▶ dispatchEvent(new CustomEvent('azfit-theme-change', { detail }))   │
│                    │                                                                │
│                    ▼                                                                │
│         ┌─────────────────────┐                                                     │
│         │ AIChat.tsx listens  │───▶ updates its own theme state                   │
│         │ for this event      │                                                     │
│         └─────────────────────┘                                                     │
│                                                                                     │
│   CSS OVERRIDES (index.css):                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────┐    │
│   │  .light body { background: #F8F9FA; color: #111827 }                       │    │
│   │  .light .bg-[#0A0A0A] { background-color: #F8F9FA !important }            │    │
│   │  .light .bg-[#141414] { background-color: #FFFFFF !important }             │    │
│   │  .light .text-[#F0F0F0] { color: #111827 !important }                     │    │
│   │  .light .border-[#2A2A2A] { border-color: #E5E7EB !important }            │    │
│   └────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. REST TIMER LIFECYCLE

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        PER-SET REST TIMER FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   User clicks "Done" checkbox on set #3 of Exercise A1                            │
│          │                                                                          │
│          ▼                                                                          │
│   ┌─────────────────────────────────────────────────────────────┐                  │
│   │  handleToggleDone(setIdx=2) in ExerciseCard.tsx            │                  │
│   │                                                             │                  │
│   │  1. Mark set as 'done'                                      │                  │
│   │  2. onStartRest(exercise.id, setIdx, restSeconds)          │                  │
│   │        └──▶ useRestTimer.startTimer('A1', 2, 180)          │                  │
│   │              timers['A1'] = { active: true,                │                  │
│   │                              remaining: 180,               │                  │
│   │                              total: 180,                   │                  │
│   │                              setIndex: 2 }                 │                  │
│   └─────────────────────────────────────────────────────────────┘                  │
│          │                                                                          │
│          ▼                                                                          │
│   ExerciseCard re-renders ──▶ only set row #3 shows active countdown               │
│   (condition: restTimer?.setIndex === si)                                          │
│          │                                                                          │
│          ├─── Timer counts down every second via setInterval                       │
│          │                                                                          │
│          ├─── User can "Skip" or "+30s"                                            │
│          │                                                                          │
│          └─── When remaining <= 0: timer.auto-clear                                │
│                                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │  KEY: Timer is scoped to (exerciseId × setIndex) pair                       │   │
│   │       Only ONE timer active per exercise at a time                          │   │
│   │       Only the most recently completed set shows the countdown              │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. BUILD & DEPLOY PIPELINE

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           DEPLOYMENT WORKFLOW                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   DEVELOPMENT                                                                       │
│   ═══════════                                                                       │
│                                                                                     │
│   npm run dev  ──▶  Vite dev server @ localhost:5173                               │
│        │                                                                            │
│        │    Hot Module Replacement (HMR)                                           │
│        │    React Fast Refresh                                                     │
│        │    Tailwind JIT compilation                                               │
│        ▼                                                                            │
│                                                                                     │
│   BUILD                                                                             │
│   ═════                                                                             │
│                                                                                     │
│   npm run build  ──▶  tsc -b  (type check)                                          │
│        │         ──▶  vite build (bundle + minify)                                  │
│        │                                                                            │
│        ▼                                                                            │
│   dist/                                                                             │
│   ├── index.html                                                                    │
│   ├── assets/                                                                       │
│   │   ├── index-*.js     (1.7MB, gzipped 438KB)                                    │
│   │   └── index-*.css    (147KB, gzipped 24KB)                                     │
│   ├── AzFIT_Logo_*.png                                                              │
│   ├── exercises_db.json                                                             │
│   └── programs_db.json   ◄── 84 built-in programs                                  │
│                                                                                     │
│   DEPLOY                                                                            │
│   ══════                                                                            │
│                                                                                     │
│   npm run deploy  ──▶  gh-pages -d dist                                             │
│        │                                                                            │
│        ▼                                                                            │
│   GitHub Pages @ https://azfit.github.io/azfit-client-portal                       │
│   (gh-pages branch)                                                                 │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. FILE STRUCTURE

```
azfit-client-portal/
│
├── public/                          # Static assets (copied to dist/)
│   ├── programs_db.json            # 84 built-in programs (SavedProgram[])
│   ├── exercises_db.json           # 255 exercises (Name, MuscleGroup, Video)
│   └── AzFIT_Logo_*.png            # Brand assets
│
├── src/
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives (Button, Input, Select, etc.)
│   │   ├── Navbar.tsx              # Top nav with theme toggle
│   │   ├── Footer.tsx              # Site footer
│   │   ├── Layout.tsx              # Page wrapper with theme provider
│   │   ├── ThemeToggle.tsx         # Light/dark toggle button
│   │   ├── AIChat.tsx              # Bottom-left draggable chat
│   │   └── ProgramBuilder/         # Workout session components
│   │       ├── ExerciseCard.tsx    # Collapsible exercise with set table
│   │       ├── WorkoutSummary.tsx  # Session stats header
│   │       ├── LiftRecordModal.tsx # Historical PR modal
│   │       └── EditExerciseModal.tsx # Edit exercise params modal
│   │
│   ├── hooks/
│   │   └── useRestTimer.ts         # Per-exercise, per-set timer hook
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx         # Marketing landing
│   │   ├── ProgramsPage.tsx        # Program hub (templates + grid)
│   │   ├── AllInOneProgramPage.tsx # 6-step program creator
│   │   ├── ProgramBuilderPage.tsx  # Workout session (day-aware)
│   │   ├── ExerciseLibraryPage.tsx # 255 exercise database
│   │   ├── ClientDashboardPage.tsx # Client progress dashboard
│   │   ├── LoginPage.tsx           # Auth login
│   │   └── RegisterPage.tsx        # Auth register
│   │
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   │                                 (Exercise, ProgramData, SavedProgram, etc.)
│   │
│   ├── App.tsx                     # Router configuration
│   ├── main.tsx                    # Entry point (ReactDOM)
│   ├── index.css                   # Global styles + theme overrides
│   └── store.ts                    # Zustand global store
│
├── temp/                           # Development artifacts (not in build)
│   ├── program list.csv            # Source CSV for 84 programs
│   ├── exercise_list.csv           # Source CSV for 255 exercises
│   └── generate_programs.cjs       # Node script to build programs_db.json
│
├── dist/                           # Build output (gh-pages deploy target)
├── index.html                      # Entry HTML
├── vite.config.ts                  # Vite config (base: './', HashRouter)
├── tailwind.config.js              # Tailwind theme extensions
├── tsconfig.json                   # TypeScript config
└── package.json                    # Dependencies + scripts
```

---

## 11. DECISION FLOWCHART

```
                    ┌─────────────────┐
                    │  User arrives   │
                    │   at /programs  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Load programs   │
                    │ from sources    │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌────────────┐   ┌────────────┐   ┌────────────┐
    │  Built-in  │   │  Custom    │   │  Search/   │
    │  (84 from  │   │  (local-   │   │  Filter    │
    │  programs_ │   │  Storage)  │   │  applied?  │
    │  db.json)  │   │            │   │            │
    └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
          │                │                │
          └────────────────┴────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Merge + Sort    │
                    │ + Deduplicate   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Display grid of │
                    │ ProgramCards    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │  Start   │  │  Edit    │  │  Delete  │
       │  Session │  │  (go to  │  │  (remove │
       │          │  │  creator)│  │  from LS)│
       └────┬─────┘  └────┬─────┘  └────┬─────┘
            │             │             │
            ▼             ▼             ▼
       /programs/   /programs/    localStorage
       session/     create        ['azfit-programs']
       :programId   (edit-id)
            │
            ▼
    ┌─────────────────┐
    │ Has existing    │
    │ session in LS?  │
    └────────┬────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌──────────┐  ┌──────────┐
│   YES    │  │    NO    │
│ Restore  │  │ Fresh    │
│ session  │  │ start    │
│ data     │  │          │
└────┬─────┘  └────┬─────┘
     │             │
     └──────┬──────┘
            │
            ▼
    ┌─────────────────┐
    │ Program has     │
    │ days[] array?   │
    └────────┬────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌──────────┐  ┌──────────┐
│   YES    │  │    NO    │
│ Show day │  │ Show all │
│ tabs +   │  │ exercises│
│ filter   │  │ (legacy) │
└────┬─────┘  └────┬─────┘
     │             │
     └──────┬──────┘
            │
            ▼
    ┌─────────────────┐
    │ Auto-save every │
    │ state change to │
    │ localStorage    │
    │ [session-key]   │
    └─────────────────┘
```

---

## 12. DATA MODELS

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              TYPE RELATIONSHIPS                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  SavedProgram                                                                       │
│  ├─ id: string                                                                      │
│  ├─ createdAt: string                                                               │
│  ├─ updatedAt: string                                                               │
│  └─ data: ProgramData ───────────────────────────────────────────────────────┐     │
│       ├─ programName: string                                                 │     │
│       ├─ goal: string  ('strength'|'hypertrophy'|'fatloss'|...)              │     │
│       ├─ method: string                                                      │     │
│       ├─ clientContext: { ageRange, experience, bodyType,                    │     │
│       │                  availability, limitations[], otherLimitation }       │     │
│       ├─ phases: Phase[]                                                     │     │
│       │      └─ { id, name, weeks, focus, color, active }                    │     │
│       ├─ split: SplitDay[]                                                   │     │
│       │      └─ { day, active, workout }                                     │     │
│       ├─ exercises: CreatorExercise[] ◄── flat list (legacy / export)        │     │
│       │      └─ { code, name, sets, reps, pct1RM, tempo, rest }              │     │
│       ├─ tags: string[]                                                      │     │
│       ├─ isPublic: boolean                                                   │     │
│       ├─ assignedClient: string                                              │     │
│       │                                                                      │     │
│       │  ═══ ENHANCED FIELDS ═══                                             │     │
│       ├─ template?: 'GVT'|'GBC'|'HIIT'|'PPL'|'Full Body'|'Strength'|'Custom'│     │
│       ├─ trainingMethod?: 'Straight Sets'|'Superset'|'Triset'               │     │
│       ├─ clientProfile?: { experience, equipment, timePerSession }          │     │
│       ├─ totalSets?: number                                                  │     │
│       └─ days?: DayData[] ◄── structured day grouping                        │     │
│              └─ { day, dayNumber, method, exercises: DayExercise[] }         │     │
│                     └─ { code, name, sets, reps, pct1RM, tempo, rest }       │     │
│                                                                              │     │
│  Exercise (runtime / builder format)                                         │     │
│  ├─ id: string                    ◄── maps to code (A1, A2, B1...)           │     │
│  ├─ name: string                                                             │     │
│  ├─ scheme: string                ◄── "4×6", "3×10"                          │     │
│  ├─ target: string                ◄── target load or %1RM                    │     │
│  ├─ unit: 'kg'|'lbs'              ◄── locked to 'kg'                         │     │
│  ├─ muscleGroup: string                                                      │     │
│  ├─ sets: ExerciseSet[]                                                      │     │
│  │      └─ { set, prescribed, clientLoad, load, reps, rpe,                  │     │
│  │           rest, type, done, note, lastWeekLoad, lastWeekReps }            │     │
│  ├─ _expanded?: boolean                                                      │     │
│  ├─ _showNotes?: boolean                                                     │     │
│  ├─ _dayIndex?: number            ◄── which day this exercise belongs to     │     │
│  └─ _method?: string              ◄── training method for this exercise       │     │
│                                                                              │     │
│  LiftRecord                                                                  │     │
│  └─ { val: string, date: string }                                            │     │
│                                                                              │     │
│  LiftRecordsMap = Record<exerciseId, Record<setNumber, LiftRecord>>         │     │
│                                                                              │     │
└──────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Legend

| Symbol | Meaning                          |
|--------|----------------------------------|
| `───▶` | Data flow / transition           |
| `├─`   | Child item / branch              |
| `│`    | Continuation of parent branch    |
| `└─`   | Last child item                  |
| `◄──`  | Reference / lookup               |
| `[key]`| localStorage key name            |
| `?`    | Optional field                   |

---

> Document version: 2025-05-30  
> Stack: React 19 + TypeScript + Vite 7 + Tailwind CSS 3 + shadcn/ui + Framer Motion
