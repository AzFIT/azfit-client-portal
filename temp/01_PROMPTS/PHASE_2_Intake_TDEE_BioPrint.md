# PHASE 2 — CLIENT INTAKE WIZARD + TDEE CALCULATOR + BIOPRINT
## SEND THIS SECOND (only after Phase 1 works)

Replace the Phase 1 single-page "Add New Client" form with a proper 5-step wizard. Add TDEE + macro calculator and BioPrint 7-site assessment to every client's profile.

---

## STEP 1: MULTI-STEP CLIENT INTAKE WIZARD

Access: FAB button OR "Clients" page > "+ Add New Client" now opens the wizard.

Layout: Fixed header with progress bar (5 steps, 4px cyan gradient fill, animated). Step labels below. Current step highlighted.

```
+--------------------------------------------------+
|  [Progress Bar: ====>-----]  Step 2 of 5         |
|  Personal    Goals    Body    Medical    Review    |
|   (done)    (now)   (next)   (next)     (next)   |
+--------------------------------------------------+
```

Navigation: [Cancel] [Back] [Next] / [Confirm & Save] on final step.

---

### WIZARD STEP 1: PERSONAL INFORMATION

Fields (all standard inputs, dark theme):
- Full Name * (text)
- Email (email)
- Phone (tel)
- Date of Birth * (date picker — auto-calculate age display next to it)
- Gender * (3 selectable cards: Male / Female / Other — horizontal row)
- Emergency Contact Name (text)
- Emergency Contact Phone (tel)

Age calculation: `Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000)`
Show age in real-time next to DOB field.

[Cancel] [Next: Goals]

---

### WIZARD STEP 2: GOALS & PREFERENCES

Fields:
- PRIMARY GOAL * (7 selectable cards in a grid, one selection):
  - Lose Weight (icon: flame)
  - Build Muscle (icon: dumbbell)
  - Strength (icon: barbell)
  - Endurance (icon: heart-pulse)
  - Athletic Performance (icon: trophy)
  - Rehab & Mobility (icon: shield)
  - General Fitness (icon: activity)
  Each card: icon, label, subtle border. Selected: cyan border + cyan tint bg.

- SECONDARY GOAL (dropdown: None / same 7 options)

- EXPERIENCE LEVEL * (3 selectable cards, horizontal):
  - Beginner (green accent)
  - Intermediate (yellow accent)
  - Advanced (red accent)

- AVAILABLE EQUIPMENT * (checkbox cards, multi-select):
  Full Gym | Dumbbells Only | Bodyweight | Home Gym | Commercial Gym

- SESSIONS PER WEEK * (select: 2 / 3 / 4 / 5 / 6)
- SESSION DURATION * (select: 30 / 45 / 60 / 90 minutes)

[Back] [Next: Body Assessment]

---

### WIZARD STEP 3: BODY ASSESSMENT (TDEE + BIOPRINT)

This is the most important step. Three panels stacked vertically:

---

#### PANEL A: BODY MEASUREMENTS

Two inputs side by side:
- Weight * (number input) with unit toggle [kg | lb]
  - If lb selected: display kg = Math.round(lb / 2.2046 * 10) / 10
  - Store everything as kg internally
- Height * (number input) with unit toggle [cm | ft/in]
  - If ft/in selected: show two small inputs (ft and in)
  - cm = (ft * 30.48) + (in * 2.54)
  - Store everything as cm internally

Auto-calculate BMI: `bmi = weight_kg / ((height_cm / 100) ** 2)`
Display BMI with color-coded category:
- < 18.5 = Underweight (#F59E0B yellow)
- 18.5–24.9 = Normal (#22C55E green)
- 25–29.9 = Overweight (#F97316 orange)
- 30+ = Obese (#EF4444 red)

---

#### PANEL B: TDEE INPUTS

- Activity Level * (5 selectable cards):
  - Sedentary (office job) — multiplier 1.2
  - Lightly Active (1-2 days/week) — 1.375
  - Moderately Active (3-5 days/week) — 1.55
  - Very Active (6-7 days/week) — 1.725
  - Athlete (2x per day) — 1.9

- Body Fat % (optional number input — if calculated from BioPrint below, auto-fill this)

When weight, height, age, gender, and activity are all filled:
AUTO-CALCULATE TDEE and display live:

```
+----------------------------------------+
|  TDEE CALCULATION                      |
|  BMR: 1,847 kcal/day                   |
|  TDEE: 2,863 kcal/day                  |
|  BMI: 25.3 (Overweight)                |
+----------------------------------------+
```

TDEE FORMULA (Mifflin-St Jeor):
```javascript
// BMR:
if (gender === "male") {
  bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
} else {
  bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
}

// TDEE:
const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, athlete: 1.9 }
tdee = Math.round(bmr * multipliers[activityLevel])
```

---

#### PANEL C: BIOPRINT 7-SITE SKINFOLD

Label: "7-Site Skinfold Assessment (Poliquin Method) — All in millimeters"

Layout: 3-column grid of inputs (desktop), 2-column (tablet), 1-column (mobile).

Required sites (7):
- TRICEP (mm)
- SUB-SCAPULAR (SUB-SCAP) (mm)
- SUPRAILIAC (SUPRA) (mm)
- ABDOMINAL / UMBILICAL (mm)
- THIGH (mm)
- PECTORAL (PEC) (mm)
- MID-AXILLARY (MID-AX) (mm)

Optional additional sites (5, if coach wants full 12-site):
- CHIN (mm)
- CHEEK (mm)
- KNEE (mm)
- CALF (mm)
- HAMSTRING (HAM) (mm)

Each input: small number field (0.5mm increments), label above.

LIVE CALCULATION as user types:
```javascript
// When at least 3 sites entered, show:
// Sum of all entered skinfolds
sum7 = tricep + subscap + supra + umbil + thigh + pec + midax

// Jackson-Pollock 7-site body fat %
if (gender === "male") {
  bodyDensity = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * age)
} else {
  bodyDensity = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * age)
}
bodyFatPercent = ((4.95 / bodyDensity) - 4.5) * 100
leanMass = weight_kg * (1 - (bodyFatPercent / 100))
fatMass = weight_kg * (bodyFatPercent / 100)
```

Display results live in a card:
```
+----------------------------------+
|  BODY COMPOSITION (7-Site)       |
|  Sum of Skinfolds: 62.5 mm       |
|  Body Fat: 14.2%                 |
|  Lean Mass: 70.8 kg              |
|  Fat Mass: 11.7 kg               |
+----------------------------------+
```

If body fat % calculated, auto-fill it into the TDEE Body Fat % field above.

---

#### PANEL D: CIRCUMFERENCE MEASUREMENTS

Below skinfolds. Label: "Circumference Measurements (cm)"

Two-column grid:
- Left Arm (cm)
- Right Arm (cm)
- Left Thigh (cm)
- Right Thigh (cm)
- Hips (cm)
- Waist (cm)
- Shoulder (cm)
- Neck (cm)
- Chest (cm)

Store with assessment for progress tracking.

[Back] [Next: Medical]

---

### WIZARD STEP 4: MEDICAL & SAFETY

Fields:
- Injuries or Conditions (textarea, 3 rows)
- Medications (textarea, 3 rows)
- Allergies (textarea, 3 rows)
- Cleared to Exercise * (3 radio cards: Yes / No / With Restrictions)
  - If "With Restrictions": show additional textarea

Safety Checkboxes (all optional):
```
[x] No cardiovascular conditions
[ ] No uncontrolled blood pressure
[ ] No dizziness or fainting history
[ ] No joint pain during movement
[x] Cleared for resistance training
[ ] Cleared for high-intensity exercise
```

[Back] [Next: Review]

---

### WIZARD STEP 5: REVIEW & CONFIRM

Show ALL collected data grouped by section with [Edit] links that jump back to that step:

```
+-- PERSONAL INFO --+    [Edit]
Name: John Doe
DOB: Jan 15, 1990 (36 years old)
Gender: Male
...

+-- GOALS --+    [Edit]
Primary: Build Muscle
Experience: Intermediate
...

+-- BODY ASSESSMENT --+    [Edit]
Weight: 82.5 kg | Height: 180 cm
BMI: 25.3 (Overweight)
TDEE: 2,863 kcal/day | BMR: 1,847 kcal/day
Body Fat: 14.2% | Lean Mass: 70.8 kg
Skinfolds: 62.5 mm (7 sites)
...

+-- MEDICAL --+    [Edit]
Cleared: Yes
...
```

[Back] [Confirm & Save Client]

On save:
- Build complete client object (schema below)
- Push to "azfit-clients" array in localStorage
- Show success: "John Doe added successfully!"
- Dialog: "Would you like to create a program for John Doe?" [Yes, Create Program] [Later]
- If Yes → redirect to program wizard (Phase 3, build a placeholder for now)
- If Later → redirect to client profile

Complete client storage schema:
```javascript
{
  id: "client_" + Date.now(),
  coachId: string,
  personal: { fullName, email, phone, dateOfBirth, gender, age, emergencyContact: { name, phone } },
  goals: { primary, secondary, experienceLevel, equipment: [], sessionsPerWeek, sessionDuration },
  bodyAssessment: {
    weight: number, // kg
    height: number, // cm
    bmi: number,
    skinfolds: { tricep, subscap, supra, umbil, thigh, pec, midax, chin, cheek, knee, calf, ham },
    sumOfSkinfolds: number,
    bodyFatPercent: number,
    leanMass: number,
    fatMass: number,
    circumferences: { leftArm, rightArm, leftThigh, rightThigh, hips, waist, shoulder, neck, chest }
  },
  tdee: {
    bmr: number,
    tdee: number,
    activityLevel: string,
    bodyFatPercent: number
  },
  medical: { injuries, medications, allergies, clearedToExercise, restrictions, safetyCheckboxes: {} },
  nutrition: {
    maintenanceCalories: number,
    fatLossCalories: number,
    aggressiveFatLoss: number,
    muscleGainCalories: number,
    dietPreference: "balanced",
    macros: { /* filled in Step 2 */ }
  },
  status: "active",
  createdAt: ISO,
  updatedAt: ISO
}
```

---

## STEP 2: TDEE MACRO CALCULATOR (Client Nutrition Tab)

Add a "Nutrition" tab on each client's profile page.

This tab displays:

### Section A: Calorie Targets

4 cards in a row (2x2 on mobile):
```
+----------------+----------------+----------------+----------------+
| MAINTENANCE    | FAT LOSS       | AGGRESSIVE     | MUSCLE GAIN    |
| 2,863 kcal     | 2,363 kcal     | 2,113 kcal     | 3,113 kcal     |
| (TDEE)         | (-500/day)     | (-750/day)     | (+250/day)     |
| [Select]       | [Select]       | [Select]       | [Select]       |
+----------------+----------------+----------------+----------------+
```

Calculations:
```javascript
maintenance = tdee
fatLoss = tdee - 500
aggressive = tdee - 750
muscleGain = tdee + 250
```

Clicking "Select" on any card updates the macro display below.

### Section B: Diet Preference Selector

4 selectable cards:
- Balanced (default): 30% Protein / 35% Carbs / 35% Fat
- Low Carb: 35% Protein / 15% Carbs / 50% Fat
- High Carb: 25% Protein / 55% Carbs / 20% Fat
- High Protein: 40% Protein / 30% Carbs / 30% Fat

### Section C: Macro Breakdown

For the selected calorie target + diet preference:

```javascript
// Use the HIGHER of: percentage-based OR minimum protein (1.6g/kg)
proteinFromPercent = (selectedCalories * proteinPercent / 100) / 4
minProtein = weight_kg * 1.6
proteinGrams = Math.round(Math.max(proteinFromPercent, minProtein))

// Recalculate carbs and fat with remaining calories
proteinCalories = proteinGrams * 4
carbCalories = selectedCalories * carbPercent / 100
fatCalories = selectedCalories * fatPercent / 100

carbGrams = Math.round(carbCalories / 4)
fatGrams = Math.round(fatCalories / 9)
```

Display as horizontal segmented bar:
```
Protein: ████████░░░░░░░ 140g (560 cal / 28%)
Carbs:   ██████████░░░░░ 180g (720 cal / 36%)
Fat:     ███████░░░░░░░░  80g (720 cal / 36%)
         ─────────────────────────
         Total: 2,000 kcal
```

Color: Protein = cyan, Carbs = purple, Fat = amber.

Also show per-meal breakdown:
```
Per Meal (3 meals):
Protein: 47g | Carbs: 60g | Fat: 27g

Per Meal (4 meals):
Protein: 35g | Carbs: 45g | Fat: 20g

Per Meal (5 meals):
Protein: 28g | Carbs: 36g | Fat: 16g
```

### Section D: Re-Assessment Button

"Re-Assess Client" button at bottom. Opens a modal to re-enter weight, skinfolds, and activity level. Recalculates TDEE, body fat %, and macros. Saves new assessment to history array.

---

## STEP 3: BIOPRINT ADVANCED ANALYSIS (Expandable Section)

Below the nutrition display, add an "Advanced BioPrint Analysis" accordion/toggle.

When expanded, show:

### Site-by-Site Analysis

Table of all 12 skinfold sites with:
- Site name
- Value (mm)
- "Ideal Range" for gender (reference ranges below)
- Status: Normal (green) / Elevated (yellow) / High (red)

Reference ranges for MALES:
```
Chin:        3-6 mm   |  Cheek:      3-5 mm
Pec:         4-8 mm   |  Tricep:     4-8 mm
Subscap:     8-12 mm  |  Midax:      4-8 mm
Supra:       6-10 mm  |  Umbil:      8-15 mm
Knee:        4-8 mm   |  Calf:       4-8 mm
Quad:        6-10 mm  |  Ham:        6-10 mm
```

Reference ranges for FEMALES (slightly higher):
```
Add ~20-30% to each male range
```

### Poliquin Key Ratios

Calculate and display 4 ratio cards:

1. **Upper-to-Lower Ratio** = upperBodySum / lowerBodySum
   - Upper body sites: chin + cheek + pec + tricep + subscap + midax + supra + umbil
   - Lower body sites: knee + calf + quad + ham
   - Ideal: ~1.0 (balanced)
   - > 1.2: Upper dominant — may indicate cortisol/stress
   - < 0.8: Lower dominant — may indicate estrogen influence

2. **Subscapular-to-Tricep** = subscap / tricep
   - Ideal: ~1.5
   - > 2.0: May indicate insulin resistance

3. **Suprailiac-to-Subscapular** = supra / subscap
   - Ideal: ~0.8
   - > 1.0: May indicate carb tolerance issues

4. **Quad-to-Hamstring** = quad / ham
   - Ideal: ~1.0
   - Significant imbalance may indicate training/recovery issues

Each ratio card: name, calculated value, ideal range, simple 1-line interpretation.

---

## DELIVERABLE — TEST CHECKLIST

1. [ ] Click "+ Add New Client" — see 5-step wizard with progress bar
2. [ ] Fill Step 1 (Personal Info) — age auto-calculates from DOB
3. [ ] Fill Step 2 (Goals) — selectable cards work for goal, experience, equipment
4. [ ] Fill Step 3 (Body Assessment):
   - [ ] Enter weight in kg, toggle to lb works
   - [ ] Enter height in cm, toggle to ft/in works
   - [ ] BMI auto-calculates with color-coded category
   - [ ] TDEE auto-calculates when activity level selected
   - [ ] Enter 7 skinfold sites, body fat % calculates live
   - [ ] Lean mass and fat mass display
   - [ ] Circumference inputs work
5. [ ] Fill Step 4 (Medical) — conditional textarea for "With Restrictions"
6. [ ] Step 5 (Review) — all data shows correctly, edit links work
7. [ ] Save client — success message, option to create program
8. [ ] Visit client profile → "Nutrition" tab
9. [ ] See 4 calorie target cards with correct values
10. [ ] Select different diet preferences, macros update live
11. [ ] See macro breakdown bar with correct grams/percentages
12. [ ] See per-meal breakdowns
13. [ ] Expand "Advanced BioPrint Analysis" — see site-by-site table and 4 ratio cards
14. [ ] Click "Re-Assess" — update weight/skinfolds, all calculations refresh
15. [ ] Add a second client and verify all data is separate
