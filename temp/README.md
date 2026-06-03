# AZFIT — Complete Build Package
## Everything you need to send to Kimi Code

---

## FOLDER STRUCTURE

```
AzFIT_Complete_Package/
|
+-- 01_PROMPTS/
|   +-- PHASE_1_Core_Infrastructure.md       (SEND FIRST)
|   +-- PHASE_2_Intake_TDEE_BioPrint.md      (SEND SECOND)
|   +-- PHASE_3_Program_Wizard.md            (SEND THIRD)
|   +-- PHASE_4_Library_Rings_Polish.md      (SEND FOURTH)
|   +-- COMPLETE_Phased_Build_Prompt.md      (Full reference, all phases)
|   +-- START_HERE_Phase_1.md               (Quick start - just copy this)
|
+-- 02_DATABASE/
|   +-- AzFIT_Database_Restructured.xlsx     (NEW - 6 linked sheets with dropdowns)
|   +-- Complete linking categories_FIXED.xlsx (ORIGINAL - your source file)
|   +-- bio print measurements.xlsx           (ORIGINAL - Poliquin BioSignature)
|
+-- 03_DESIGN_SPECS/
|   +-- Dashboard_4-2-2_Responsive_Spec.md
|   +-- Concentric_Rings_Spec.md
|   +-- Design_System_Spec.md
|
+-- 04_GUIDES/
|   +-- Website_Monitor_Guide.md
|   +-- Instagram_Story_Strategy.md
|
+-- 05_REFERENCE/
|   +-- azfit_dashboard_cards_mockup.png
|   +-- azfit_full_page.png
|   +-- index.html
|   +-- index(1).html
|
+-- README.md   (this file)
```

---

## HOW TO USE

### Step 1: Send Phase 1 to Kimi Code
Open `01_PROMPTS/START_HERE_Phase_1.md` — copy the entire content and paste it into Kimi Code as one message. This starts the build.

### Step 2: Test Phase 1
After Kimi Code delivers Phase 1, test it:
- [ ] Can you sign up as a new coach?
- [ ] Can you log in?
- [ ] Do you see the empty dashboard with "Add first client"?
- [ ] Can you add a client with the form?
- [ ] Does the client appear in the dashboard?

### Step 3: Send Phase 2
Only after Phase 1 works. Open `01_PROMPTS/PHASE_2_Intake_TDEE_BioPrint.md`, copy, paste into Kimi Code.

### Step 4-6: Repeat for Phases 3 and 4
Same process. Only proceed when the previous phase is fully working.

---

## WHAT'S IN EACH PROMPT

| Phase | Builds | Key Features |
|-------|--------|-------------|
| **Phase 1** | Auth, Client CRUD, Dashboard layout, Empty states | Coach signup/login, FAB button, client list, search |
| **Phase 2** | 5-step wizard, TDEE calc, Macro breakdown, BioPrint | Mifflin-St Jeor TDEE, 4 diet presets, 12-site skinfold, Poliquin ratios |
| **Phase 3** | Program templates, Split config, Phase config, Exercise picker | 84 program templates, 200-exercise DB, Accumulation/Intensification/Realization |
| **Phase 4** | Exercise library, Animated rings, Full profile, Polish | Conic-gradient rings, client profile tabs, progress charts |

---

## DATABASE FILES

### AzFIT_Database_Restructured.xlsx (NEW — use this one)
- **EXERCISES** sheet: 200 exercises with dropdowns for muscle/equipment/difficulty
- **PROGRAMS** sheet: 84 programs with dropdowns for category/level/split/status
- **CATEGORIES** sheet: 6 categories (lookup table)
- **MUSCLE_GROUPS** sheet: 33 muscles (lookup table)
- **EQUIPMENT** sheet: 46 equipment items with availability checkboxes
- **PROGRAM_EXERCISES** sheet: Mapping table (program-to-exercise links)

All sheets have: data validation dropdowns, conditional formatting, autofilters, named ranges.

### Original files (for reference)
- `Complete linking categories_FIXED.xlsx` — your original source
- `bio print measurements.xlsx` — your Poliquin BioSignature template with all formulas

---

## KEY FORMULAS REFERENCE

### TDEE (from tdeecalculator.net)
- BMR (Male) = (10 x weight_kg) + (6.25 x height_cm) - (5 x age) + 5
- BMR (Female) = (10 x weight_kg) + (6.25 x height_cm) - (5 x age) - 161
- TDEE = BMR x activityMultiplier (1.2 / 1.375 / 1.55 / 1.725 / 1.9)

### Calorie Targets
- Maintenance = TDEE
- Fat Loss = TDEE - 500
- Aggressive = TDEE - 750
- Muscle Gain = TDEE + 250

### Macro Ratios
| Diet | Protein | Carbs | Fat |
|------|---------|-------|-----|
| Balanced | 30% | 35% | 35% |
| Low Carb | 35% | 15% | 50% |
| High Carb | 25% | 55% | 20% |
| High Protein | 40% | 30% | 30% |

### BioPrint Body Fat (Poliquin)
- bodyFat% = POWER(ABS(((((sumOfSkinfolds - 40) / 20) x (POWER(weight, 0.425) x POWER(height, 0.725) x 71.74 x 0.739) / 10000) / weight) - 0.003), 0.5) x 100 x 0.7

---

## QUESTIONS?

If something doesn't work after sending a phase, tell Kimi Code:
"This is Phase [X]. The issue is: [describe what's broken]. Fix only this issue without changing anything else."

Don't skip phases. Don't rush. Test each one thoroughly.
