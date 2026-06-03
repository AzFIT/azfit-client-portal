# AZFIT — PHASED BUILD PROMPT FOR KIMI CODE
## How to Send: Copy each PHASE section as a separate message to Kimi Code.
## Do NOT send all phases at once. Wait for each phase to complete before sending the next.

---

# OVERVIEW (Read this first — gives context for all phases)

**AzFIT** is an AI-powered personal training platform for professional fitness coaches. The app has:
- A **public landing page** (marketing)
- A **protected coach portal** (dashboard, client management, program builder)
- **Real client data** — no demo/fake data. Every coach sees only their own clients.
- **TDEE & Macro Calculator** integrated into client nutrition tracking
- **BioPrint 7-Site Assessment** for body composition tracking (Charles Poliquin method)
- **Program Wizard** for creating customized training programs
- **200-exercise database** linked to program builder

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Framer Motion + localStorage persistence
**Colors:** Dark navy (#0B1120) background, cyan (#00AEEF) accent, white text
**Deploy:** GitHub Pages static hosting

---

# PHASE 1: CORE INFRASTRUCTURE
## Send this FIRST to Kimi Code

```
PHASE 1 — CORE INFRASTRUCTURE

Build the foundation of AzFIT. After this phase, I should be able to:
1. Sign up as a new coach
2. Log in as an existing coach
3. See an empty dashboard with "Add your first client" prompt
4. Add a new client via a form
5. See the client in my dashboard

---

STEP 1: AUTHENTICATION (Coach Signup/Login)

Create pages:
- /signup — Coach registration form
- /login — Coach login form

Fields for signup:
- Full Name (required, min 2 chars)
- Email (required, valid email format)
- Password (required, min 8 chars, 1 uppercase, 1 number)
- Confirm Password (must match)
- Business/Studio Name (optional)
- Specialty (dropdown: Strength, Hypertrophy, Fat Loss, Athletic, Rehab, General)
- Years of Experience (number 0-50, optional)

Storage: Use localStorage. Key: "azfit-coaches"
Schema per coach:
{
  id: "coach_" + timestamp,
  fullName: string,
  email: string,
  passwordHash: string (use simple hash: btoa(password) for now),
  businessName: string,
  specialty: string,
  yearsExperience: number,
  createdAt: ISO string,
  lastLogin: ISO string,
  settings: { theme: "dark", unitSystem: "metric", defaultSessionDuration: 60 }
}

Auth token: Store "azfit-auth-token" in localStorage = coach's ID.
Auto-login: Check token on app load. If valid, go to dashboard.
Logout: Clear token, redirect to landing page.

Login: Email + password validation against localStorage coaches array.

No demo credentials. No fake data. The system starts empty.

---

STEP 2: LAYOUT & NAVIGATION

Create the main app layout:
- Top bar: AzFIT logo (small cyan "A" icon) + coach name + logout button
- Sidebar navigation (collapsible on mobile):
  - Dashboard
  - Clients
  - Programs
  - Exercise Library
  - Calendar (placeholder page)
  - Settings
- Main content area
- Floating Action Button (FAB) bottom-right: Cyan circle, white + icon, pulse glow animation. Used for quick-add client.

Dark theme throughout: bg #0B1120, cards #151D2E, borders #2A3A50, text #F1F5F9 primary / #94A3B8 secondary.

---

STEP 3: EMPTY DASHBOARD

When a coach logs in with NO clients yet:
- Show illustration area (simple SVG of a person with a clipboard)
- Heading: "Welcome to AzFIT, [Coach Name]!"
- Subtext: "Start by adding your first client. Track their progress, build programs, and transform results."
- Two CTAs:
  - "+ Add New Client" (primary cyan button)
  - "Learn How It Works" (secondary outline button — links to placeholder)
- Hide all stat cards when no clients exist.

---

STEP 4: CLIENT LIST / DASHBOARD WITH CLIENTS

When clients exist, show:
- 4 metric cards in 4-column grid (desktop) / 2-column (tablet/mobile):
  - Total Clients (count)
  - Active Clients (count where status === "active")
  - New This Week (count created in last 7 days)
  - Sessions This Week (count of logged sessions — 0 for now)
- Client list table/card view below:
  - Avatar circle with initials (e.g., "JD" for John Doe)
  - Name
  - Age / Gender
  - Goal
  - Status badge (Active = green, Paused = yellow, Archived = gray)
  - Last assessment date
  - "View Profile" button
- Search bar to filter clients by name

Client storage: localStorage key "azfit-clients" = array of client objects.
Client schema (Phase 1 — basic fields):
{
  id: "client_" + timestamp,
  coachId: string (links to coach),
  personal: {
    fullName: string,
    email: string,
    phone: string,
    dateOfBirth: string,
    gender: "male" | "female" | "other",
    age: number (auto-calculated from DOB)
  },
  goals: {
    primary: string,
    experienceLevel: string,
    sessionsPerWeek: number,
    sessionDuration: number
  },
  status: "active" | "paused" | "archived",
  createdAt: ISO string,
  updatedAt: ISO string
}

---

STEP 5: "+ ADD NEW CLIENT" FORM (Simplified Phase 1 version)

Triggered by: FAB button OR sidebar "Clients" > "Add New Client"

Form fields (all on one page for Phase 1):
- Full Name * (text input)
- Email (email input)
- Phone (tel input)
- Date of Birth * (date picker)
- Gender * (radio: Male / Female / Other)
- Primary Goal * (select: Lose Weight / Build Muscle / Strength / Endurance / Athletic Performance / Rehab/Mobility / General Fitness)
- Experience Level * (select: Beginner / Intermediate / Advanced)
- Sessions Per Week * (select: 2 / 3 / 4 / 5 / 6)
- Session Duration * (select: 30 / 45 / 60 / 90 minutes)
- Available Equipment * (checkboxes: Full Gym / Dumbbells Only / Bodyweight / Home Gym Limited / Commercial Gym)
- Emergency Contact Name (text)
- Emergency Contact Phone (tel)

On submit:
- Save to localStorage "azfit-clients" array
- Calculate age from DOB
- Show success toast: "[Name] has been added as a new client."
- Redirect to client's profile page

---

DELIVERABLE FOR PHASE 1:
I should be able to:
1. Open the app, see a landing page with Login/Signup
2. Sign up as a new coach
3. Log in and see empty dashboard with "Add first client" prompt
4. Click "+ Add New Client" and fill out the form
5. See the client appear in the dashboard with correct stats
6. Log out and log back in, still see my data
7. Add multiple clients, see them all in the list
8. Search/filter clients by name

Do NOT build: TDEE calculator, BioPrint, Program Wizard, Exercise Library, detailed profile pages, or complex UI animations. Keep it functional and clean.
```

---

# PHASE 2: CLIENT INTAKE, TDEE & BIOPRINT
## Send AFTER Phase 1 is complete and working

```
PHASE 2 — CLIENT INTAKE WIZARD + TDEE CALCULATOR + BIOPRINT ASSESSMENT

Now that coaches can add basic clients, we need:
1. A proper multi-step client intake wizard (5 steps)
2. TDEE calculator with full macro breakdown (integrated into client nutrition)
3. BioPrint 7-Site body composition assessment (Charles Poliquin method)

All three connect to the client's profile and persist in localStorage.

---

STEP 1: MULTI-STEP CLIENT INTAKE WIZARD

Replace the Phase 1 single-page form with a proper wizard.

Access: Clicking "+ Add New Client" now opens the wizard instead of the simple form.

Wizard flow:
Step 1: Personal Info → Step 2: Goals & Preferences → Step 3: Body Assessment → Step 4: Medical & Safety → Step 5: Review & Confirm

Progress bar at top: 5 steps, cyan fill, shows current step.

---

STEP 1A: PERSONAL INFORMATION

Fields (same as Phase 1 basic):
- Full Name *
- Email
- Phone
- Date of Birth * (date picker — auto-calculate age)
- Gender * (radio: Male / Female / Other)
- Emergency Contact Name
- Emergency Contact Phone

Navigation: [Cancel] [Next: Goals]

---

STEP 1B: GOALS & PREFERENCES

Fields:
- PRIMARY GOAL * (selectable cards: Lose Weight / Build Muscle / Strength / Endurance / Athletic Performance / Rehab/Mobility / General Fitness)
- SECONDARY GOAL (select: None / same options as primary)
- EXPERIENCE LEVEL * (radio cards: Beginner / Intermediate / Advanced)
- AVAILABLE EQUIPMENT * (checkbox cards: Full Gym / Dumbbells Only / Bodyweight / Home Gym / Commercial Gym)
- SESSIONS PER WEEK * (select: 2 / 3 / 4 / 5 / 6)
- SESSION DURATION * (select: 30 / 45 / 60 / 90 minutes)

Navigation: [Back] [Next: Body Assessment]

---

STEP 1C: BODY ASSESSMENT (BIO-PRINT + TDEE INPUTS)

This is the MOST IMPORTANT step. Two sections:

=== SECTION A: BODY MEASUREMENTS ===

Weight & Height row:
- Weight * (number input, kg — with lb toggle. If lb: store as kg internally: kg = lb / 2.2046)
- Height * (cm input — with ft/in toggle. If ft/in: cm = (ft * 30.48) + (in * 2.54))

Auto-calculate and display:
- BMI = weight(kg) / (height(m))²
  Show BMI category:
  - < 18.5 = Underweight (yellow)
  - 18.5–24.9 = Normal (green)
  - 25–29.9 = Overweight (orange)
  - 30+ = Obese (red)

=== SECTION B: BIOPRINT 7-SITE SKINFOLD ===

12 skinfold sites in mm (all optional for TDEE, but required for BioPrint):
Layout: 3 columns of 4 inputs each

Top section (priority sites):
- CHIN (mm)
- CHEEK (mm)
- PECTORAL (PEC) (mm)
- TRICEP (mm)
- SUB-SCAPULAR (SUB-SCAP) (mm)
- MID-AXILLARY (MID-AX) (mm)
- SUPRAILIAC (SUPRA) (mm)
- UMBILICAL (UMBIL) (mm)
- KNEE (mm)
- CALF (mm)
- QUAD (mm)
- HAMSTRING (HAM) (mm)

As user types each value, auto-calculate:
1. SUM = sum of ALL entered skinfolds
2. If CHIN entered: show BF% from chin
3. If CHEEK entered: show BF% from cheek
4. If enough sites entered (at least 3): show estimated Body Fat % using the Poliquin formula

POLIQUIN BODY FAT % FORMULA (extracted from Excel):
```
// For males (primary formula used in BioSignature):
bodyFatPercent = POWER(ABS(((((sumOfSkinfolds - 40) / 20) * (POWER(weight, 0.425) * POWER(height, 0.725) * 71.74 * 0.739) / 10000) / weight) - 0.003), 0.5) * 100 * 0.7

// Alternative formula (also from the Excel):
// For males: BF% = (495 / (1.1614 - (0.05 * LOG10(sumOfAll12Skinfolds)) - (0.000506 * age))) - 450
// For females: BF% = (501 / ((1.16 - (0.045 * LOG10(sumOfAll12Skinfolds)) - (0.000506 * age))) - 457

// Simplified Jackson-Pollock 7-site (use this if only 7 sites entered):
// Male: bodyDensity = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7²) - (0.00028826 * age)
//       bodyFat = ((4.95 / bodyDensity) - 4.5) * 100
// Female: bodyDensity = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7²) - (0.00012828 * age)
//         bodyFat = ((4.95 / bodyDensity) - 4.5) * 100
```

// IMPLEMENT ALL THREE and show the user:
// - Method 1 (Poliquin full 12-site)
// - Method 2 (Siri/Log formula)
// - Method 3 (Jackson-Pollock 7-site)
// - Average of all three

Display results in real-time as numbers are entered:
```
+-----------------------------------+
|  LIVE CALCULATIONS                |
|  Sum of Skinfolds: ___ mm         |
|  Est. Body Fat: ___%              |
|  Lean Body Mass: ___ kg           |
|  Fat Mass: ___ kg                 |
+-----------------------------------+
```

=== SECTION C: CIRCUMFERENCE MEASUREMENTS ===

Below the skinfolds, add a second panel:

- Arm (cm) — left
- Arm (cm) — right
- Thigh (cm) — left
- Thigh (cm) — right
- Hips (cm)
- Waist (cm)
- Shoulder (cm)
- Neck (cm)
- Chest (cm)

Store these with the assessment. They're for tracking progress over time.

=== SECTION D: TDEE INPUTS (for nutrition calculator) ===

These fields feed into the TDEE calculator:
- Activity Level * (select cards):
  - Sedentary (office job, little exercise)
  - Lightly Active (1-2 days/week)
  - Moderately Active (3-5 days/week)
  - Very Active (6-7 days/week)
  - Athlete (2x per day)

- Body Fat % (optional — pre-filled from BioPrint if calculated)

Auto-calculate TDEE immediately when these are selected:

TDEE FORMULA (Mifflin-St Jeor — from tdeecalculator.net research):
```
// Step 1: Calculate BMR
if (gender === "male") {
  BMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
} else {
  BMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
}

// Step 2: Apply activity multiplier
activityMultipliers = {
  "sedentary": 1.2,
  "light": 1.375,
  "moderate": 1.55,
  "very": 1.725,
  "athlete": 1.9
}

TDEE = BMR * activityMultiplier
```

Display TDEE result live:
```
+-----------------------------------+
|  TDEE CALCULATION                 |
|  BMR: ____ kcal/day               |
|  TDEE: ____ kcal/day              |
|  BMI: __.__ (category)            |
+-----------------------------------+
```

Navigation: [Back] [Next: Medical]

---

STEP 1D: MEDICAL & SAFETY

Fields:
- Injuries or Conditions (textarea)
- Medications (textarea)
- Allergies (textarea)
- Cleared to Exercise * (radio: Yes / No / With Restrictions)
- If "With Restrictions": show textarea for details

Safety Checkboxes (all optional):
[ ] No cardiovascular conditions
[ ] No uncontrolled blood pressure
[ ] No dizziness or fainting history
[ ] No joint pain during movement
[ ] Cleared for resistance training
[ ] Cleared for high-intensity exercise

Navigation: [Back] [Next: Review]

---

STEP 1E: REVIEW & CONFIRM

Show ALL collected data in a clean summary layout, grouped by section:
- Personal Info (editable inline)
- Goals (editable inline)
- Body Assessment with calculated values
- TDEE results
- Medical info

[Back] [Confirm & Save Client]

On save:
- Store full client object in localStorage
- Show success: "[Name] added successfully!"
- Ask: "Would you like to create a program for [Name]?" [Yes] [Later]
- If Yes → go to Program Wizard (Phase 3)
- If Later → go to client profile page

---

STEP 2: TDEE MACRO CALCULATOR (Nutrition Tab)

Add a "Nutrition" tab to each client's profile.

This displays:
1. TDEE result (already calculated during intake)
2. Calorie targets for different goals
3. Macro breakdown (protein/carbs/fat in grams)

=== CALORIE TARGETS ===

Calculate 4 targets from TDEE:
```
maintenanceCalories = TDEE
fatLossCalories = TDEE - 500  // ~1 lb/week loss
aggressiveFatLoss = TDEE - 750 // ~1.5 lb/week loss
muscleGainCalories = TDEE + 250 // ~0.5 lb/week gain
```

Show as cards:
```
+------------+ +------------+ +------------+ +------------+
|Maintenance | | Fat Loss   | | Aggressive | | Muscle Gain|
|  2,450     | |  1,950     | |  1,700     | |  2,700     |
|  kcal/day  | |  -500/day  | |  -750/day  | |  +250/day  |
+------------+ +------------+ +------------+ +------------+
```

=== MACRO BREAKDOWN ===

For EACH calorie target, calculate macros using the user's selected diet preference:

Diet preference selector:
- Balanced (default): 30% Protein / 35% Carbs / 35% Fat
- Low Carb: 35% Protein / 15% Carbs / 50% Fat
- High Carb: 25% Protein / 55% Carbs / 20% Fat
- High Protein: 40% Protein / 30% Carbs / 30% Fat

Protein calculation (override if needed):
- Default: 1.6-2.2g per kg of body weight (higher end for advanced/athletes)
- Or use the percentage-based calculation above
- Use whichever is HIGHER

Macro math:
```
proteinGrams = max((calories * proteinPercent / 100) / 4, weight_kg * 1.6)
carbGrams = (calories * carbPercent / 100) / 4
fatGrams = (calories * fatPercent / 100) / 9

// Where: Protein = 4 cal/g, Carbs = 4 cal/g, Fat = 9 cal/g
```

Display as donut chart or segmented bar:
```
Protein: ████████░░ 140g (560 cal)
Carbs:   ██████████ 180g (720 cal)
Fat:     ██████░░░░  80g (720 cal)
         ────────────────────
         Total: 2,000 kcal
```

=== SAVE TO CLIENT ===

Store in client object:
```
nutrition: {
  tdee: number,
  bmr: number,
  bmi: number,
  bodyFatPercent: number,
  maintenanceCalories: number,
  fatLossCalories: number,
  aggressiveFatLoss: number,
  muscleGainCalories: number,
  macros: {
    balanced: { protein, carbs, fat, calories },
    lowCarb: { protein, carbs, fat, calories },
    highCarb: { protein, carbs, fat, calories },
    highProtein: { protein, carbs, fat, calories }
  },
  dietPreference: "balanced" | "lowCarb" | "highCarb" | "highProtein",
  assessments: [  // history of all re-assessments
    { date, weight, bodyFatPercent, tdee, bmi }
  ]
}
```

Coach can re-assess anytime: "Re-calculate TDEE" button updates all values.

---

STEP 3: BIOPRINT ADVANCED RATIOS (For experienced coaches)

Below the basic TDEE/nutrition display, add an "Advanced BioPrint Analysis" toggle that expands to show:

Poliquin ratios calculated from the skinfolds:
```
// From the Excel formulas:

// Site-specific body fat estimates
chinBF = chinSkinfold * specificCoefficient
cheekBF = cheekSkinfold * specificCoefficient
pecBF = pecSkinfold * specificCoefficient
tricepBF = tricepSkinfold * specificCoefficient
subscapBF = subscapSkinfold * specificCoefficient
midaxBF = midaxSkinfold * specificCoefficient
supraBF = supraSkinfold * specificCoefficient
umbilBF = umbilSkinfold * specificCoefficient
kneeBF = kneeSkinfold * specificCoefficient
calfBF = calfSkinfold * specificCoefficient
quadBF = quadSkinfold * specificCoefficient
hamBF = hamSkinfold * specificCoefficient

// Regional comparisons (Poliquin method)
upperBodySum = chin + cheek + pec + tricep + subscap + midax + supra + umbil
lowerBodySum = knee + calf + quad + ham

// Key Poliquin ratios:
upperToLowerRatio = upperBodySum / lowerBodySum
// Ideal: ~1.0 (balanced)
// > 1.2: Upper body dominant fat storage (often cortisol/stress related)
// < 0.8: Lower body dominant fat storage (often estrogen dominant)

// Subscapular to Tricep ratio
subscapToTricep = subscap / tricep
// High ratio suggests insulin resistance pattern

// Suprailiac to Subscapular ratio
supraToSubscap = supra / subscap
// Imbalance suggests carb tolerance issues

// Quad to Hamstring ratio
quadToHam = quad / ham
// Imbalance can indicate training/recovery issues
```

Display as:
- Bar charts comparing each skinfold site to "ideal" ranges
- Color coding: Green (within range), Yellow (slightly elevated), Red (high)
- Ratio cards showing the key Poliquin comparisons
- Simple interpretation text (e.g., "Umbilical site is elevated — this may indicate cortisol/stress-related fat storage. Consider stress management and sleep optimization.")

This gives coaches the POLIQUIN BIO-SIGNATURE analysis that the Excel calculates.

---

DELIVERABLE FOR PHASE 2:
I should be able to:
1. Click "+ Add New Client" and walk through the 5-step wizard
2. Enter body measurements and see BMI calculate live
3. Enter 7-12 skinfold sites and see body fat % estimate live
4. Enter activity level and see TDEE + BMR calculate live
5. Save the client and see all calculated values in their profile
6. Visit the "Nutrition" tab and see TDEE + 4 calorie targets + macro breakdown
7. Switch between diet preferences (Balanced/Low Carb/High Carb/High Protein)
8. See advanced BioPrint ratios and site-by-site analysis
9. Re-assess a client (update weight/skinfolds) and see updated calculations
```

---

# PHASE 3: PROGRAM WIZARD
## Send AFTER Phase 2 is complete and working

```
PHASE 3 — PROGRAM WIZARD

Now coaches can create training programs for their clients.

---

STEP 1: PROGRAM TEMPLATE SELECTION

Access: Client profile → "Create Program" button

Show filtered program templates from the database (84 programs).

Auto-filters based on client profile:
- Goal match (e.g., if client goal = "Build Muscle", show Hypertrophy programs first)
- Experience match (Beginner/Intermediate/Advanced)
- Equipment match

Search bar at top.
Filter chips: [All Categories] [Strength] [Hypertrophy] [Fat Loss] [Endurance] etc.

Each program card shows:
- Name
- Category badge
- Level badge (color: Beginner=green, Intermediate=yellow, Advanced=red)
- Duration
- Frequency (days/week)
- Split type
- Equipment needed
- "Preview" and "Select" buttons

"Start from scratch" option at bottom.

---

STEP 2: TRAINING SPLIT CONFIGURATION

After selecting a template, configure:
- Training Split ( Upper/Lower / Push/Pull/Legs / Full Body / Bro Split / Custom )
- Training Days: Click Mon-Sun to toggle Training/Rest
  - Training days highlighted in cyan
  - Rest days are muted
- Show weekly frequency counter

---

STEP 3: PHASE CONFIGURATION

Configure periodization phases:

Phase 1: ACCUMULATION (default weeks 1-4)
- Sets: 3-4
- Reps: 8-12
- Intensity: 70% 1RM
- Rest: 90 sec
- Tempo: 3-0-1-0

Phase 2: INTENSIFICATION (default weeks 5-8)
- Sets: 3
- Reps: 6-8
- Intensity: 80% 1RM
- Rest: 120 sec
- Tempo: 2-1-1-0

Phase 3: REALIZATION (default weeks 9-12)
- Sets: 2-3
- Reps: 4-6
- Intensity: 85% 1RM
- Rest: 180 sec
- Tempo: 2-0-X-0

Allow: Add Phase / Remove Phase / Edit any values

Phase timeline bar showing proportions:
[====ACCUMULATION====][===INTENSIFICATION===][====REALIZATION====]

---

STEP 4: EXERCISE SELECTION

This is the most complex step. For each training day:

Day tabs at top: Mon | Tue | Wed | Thu | Fri | Sat | Sun (training days only)

Exercise selection panel:
- Search bar: search by name, muscle, equipment
- Filter chips: Muscle group | Equipment | Difficulty | Type
- Exercise list from the 200-exercise database:
  - Each row: Exercise ID | Name | Primary Muscle | Equipment | Difficulty
  - Click to add to the day's program

Current day workout display:
```
MONDAY — Upper Body
#  Exercise          Sets  Reps  Rest  Phase
1  Barbell Bench     4     12    90s   Acc
2  Incline DB Press  4     12    90s   Acc
3  Cable Fly         3     15    60s   Acc
4  Pull-Up           4     10    90s   Acc
5  Barbell Row       4     10    90s   Acc

[+] Add Exercise  [Duplicate Day] [Clear Day]
```

Each exercise row:
- Drag handle (reorder)
- Sets/Reps/Rest editable inline (click → edit → save)
- Remove button (X)
- Expandable: shows description, safety notes, video link

Use the actual exercise data:
- 200 exercises with Exercise_ID, Name, Primary_Muscle, Equipment, Difficulty, Type, Description, Safety_Notes

---

STEP 5: REVIEW & SAVE

Program summary card:
- Program name (editable): "[Client Name] — [Template Name]"
- Duration: X weeks
- Frequency: X days/week
- Split: [type]
- Total exercises: X
- Est. time per session: ~X min

Phase breakdown bar
Day-by-day summary (collapsible)

[Save Program] → Save to localStorage
[Edit] → Go back to any step

---

PROGRAM STORAGE SCHEMA:
```
{
  id: "prog_" + timestamp,
  coachId: string,
  clientId: string,
  name: string,
  templateId: string (or "custom"),
  config: {
    goal: string,
    split: string,
    trainingDays: ["Mon", "Wed", "Fri"],
    frequency: 3,
    durationWeeks: 12,
    phases: [...]
  },
  days: [
    {
      day: "Mon",
      name: "Upper Body",
      exercises: [
        {
          exerciseId: "EX003",
          sets: 4, reps: 12, restSeconds: 90,
          phase: "accumulation",
          notes: ""
        }
      ]
    }
  ],
  status: "active",
  createdAt: ISO string,
  updatedAt: ISO string
}
```

---

DELIVERABLE FOR PHASE 3:
1. Select a template, filter by client profile
2. Configure training split and days
3. Set up Accumulation/Intensification/Realization phases
4. Search and add exercises from the 200-exercise database
5. Drag-and-drop reorder, inline edit sets/reps/rest
6. Save program linked to specific client
7. View saved programs in "Programs" page
8. Edit existing programs
```

---

# PHASE 4: EXERCISE LIBRARY & DASHBOARD RINGS
## Send AFTER Phase 3 is complete and working

```
PHASE 4 — EXERCISE LIBRARY + DASHBOARD RINGS + POLISH

---

STEP 1: EXERCISE LIBRARY PAGE

Standalone page at /exercises showing all 200 exercises.

Layout:
- Search bar (searches name, muscle, equipment, description)
- Filter bar: Muscle group (dropdown) | Equipment (dropdown) | Difficulty (dropdown) | Type (dropdown)
- Results grid: Exercise cards
  - Name
  - Primary muscle (color-coded badge)
  - Equipment
  - Difficulty (green/yellow/red)
  - Type badge (Compound/Isolation/Olympic)
  - Expand for: full description, safety notes, video link placeholder, MET value

---

STEP 2: DASHBOARD CONIC-GRADIENT RINGS

Replace the simple metric cards from Phase 1 with the conic-gradient animated rings.

Card layout (4 columns desktop, 2 tablet, 2 mobile — mobile cards are VERTICAL):

Each card contains:
- Left side (desktop): Conic-gradient ring using CSS
- Right side: Label, value, delta badge

RING CSS (conic-gradient method — matches the YouTube tutorial style):
```css
.ring-container {
  position: relative;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px; height: 64px; /* desktop */
}
.ring-container::before {
  content: '';
  position: absolute; inset: 0; border-radius: 50%;
  background: conic-gradient(
    var(--ring-color, #00AEEF) var(--ring-percent, 0%),
    #1E293B 0%
  );
  box-shadow: 0 0 8px rgba(0,174,239,0.15), inset 0 0 12px rgba(0,0,0,0.3);
}
.ring-container::after {
  content: '';
  position: absolute; inset: 7px; border-radius: 50%;
  background: #151D2E;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.4), 0 1px 2px rgba(255,255,255,0.05);
}
.ring-dot {
  position: absolute; width: 9px; height: 9px; border-radius: 50%;
  background: var(--ring-color, #00AEEF);
  box-shadow: 0 0 6px var(--ring-color), 0 0 12px rgba(0,174,239,0.4);
  transform: rotate(var(--ring-angle, -90deg)) translateY(-32px);
}
```

Animation: JS updates --ring-percent and --ring-angle on mount. Use requestAnimationFrame with ease-out-cubic easing. Stagger each card by 200ms.

Responsive:
- Desktop (1024px+): 4 columns, ring LEFT of text, horizontal card
- Tablet (590-1023px): 2 columns, ring LEFT of text, horizontal card
- Mobile (< 590px): 2 columns, ring TOP of text, VERTICAL card (ring centered above text)

Ring sizes: 56px mobile, 72px tablet, 64px desktop, 72px wide desktop.

---

STEP 3: CLIENT PROFILE PAGE

Full client profile showing:
- Header: Name, age, gender, goal badge, status badge
- Quick stats row: Weight, Body Fat %, TDEE, BMI (conic-gradient rings)
- Tabs:
  - Overview: Goals, contact info, quick actions
  - Body Assessments: History of all BioPrint measurements with charts
  - Nutrition: TDEE + macro targets + diet preference
  - Programs: Assigned programs list
  - Sessions: Workout log (session history)
  - Progress: Weight/body fat chart over time
  - Photos: Progress photo timeline (placeholder)
  - Notes: Coach notes textarea

---

STEP 4: POLISH ITEMS

- Toast notifications (success/error/info)
- Loading skeletons
- Empty states for all pages
- Responsive mobile menu
- SEO meta tags
- Page transitions
- Favicon
- Print styles for programs

---

DELIVERABLE FOR PHASE 4:
1. Full exercise library with search/filter
2. Animated conic-gradient rings on dashboard
3. Complete client profile with all tabs
4. BioPrint assessment history with charts
5. Nutrition tab with TDEE + macros
6. Progress tracking (weight/BF% over time)
7. Mobile-responsive throughout
8. Polished UI with animations
```

---

# REFERENCE DATA

## Exercise Database Structure (200 exercises)
Use the file at: /mnt/agents/output/AzFIT_Database_Restructured.xlsx
Sheet "EXERCISES" has: Exercise_ID, Name, Primary_Muscle, Secondary_Muscle, Equipment, Difficulty, Type, Video_URL, Description, Safety_Notes, MET_Value, Is_Active

## Program Database Structure (84 programs)
Same file, Sheet "PROGRAMS": Program_ID, Name, Sets, Reps, Category, Level, Duration_wk, Frequency, Split, Focus, Total_Sessions, Avg_Time_min, Equipment_Needed, Status, Description, Is_Active

## TDEE Formulas (from tdeecalculator.net)
Mifflin-St Jeor BMR:
- Male: (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
- Female: (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

Activity Multipliers:
- Sedentary: 1.2
- Light: 1.375
- Moderate: 1.55
- Very Active: 1.725
- Athlete: 1.9

TDEE = BMR * activityMultiplier

## BioPrint Formulas (from Excel + Poliquin)
Poliquin 12-site BF%:
bodyFatPercent = POWER(ABS((((((sumOfSkinfolds - 40) / 20) * (POWER(weight, 0.425) * POWER(height, 0.725) * 71.74 * 0.739) / 10000) / weight) - 0.003), 0.5) * 100 * 0.7

Siri/Log BF%:
- Male: (495 / (1.1614 - (0.05 * LOG10(sum)) - (0.000506 * age))) - 450
- Female: (501 / ((1.16 - (0.045 * LOG10(sum)) - (0.000506 * age))) - 457

Jackson-Pollock 7-site BF%:
- Male bodyDensity = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7^2) - (0.00028826 * age)
- Female bodyDensity = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7^2) - (0.00012828 * age)
- bodyFat = ((4.95 / bodyDensity) - 4.5) * 100

BMI = weight_kg / (height_m)^2

## Macro Formulas
Protein = 4 cal/g
Carbs = 4 cal/g
Fat = 9 cal/g

Targets:
- Maintenance = TDEE
- Fat Loss = TDEE - 500
- Aggressive = TDEE - 750
- Muscle Gain = TDEE + 250

---

# SUMMARY OF WHAT TO SEND WHEN

| Order | Phase Name | What It Builds | Approximate Size |
|-------|-----------|----------------|-----------------|
| 1st | Phase 1 | Auth, Client CRUD, Empty Dashboard, Basic Layout | Medium |
| 2nd | Phase 2 | 5-Step Wizard, TDEE + Macros, BioPrint Assessment | Large |
| 3rd | Phase 3 | Program Template Selection, Split Config, Phase Config, Exercise Selection | Large |
| 4th | Phase 4 | Exercise Library, Animated Rings, Full Client Profile, Polish | Medium |

**IMPORTANT:** Wait for each phase to be fully working before sending the next. Test everything before proceeding.
