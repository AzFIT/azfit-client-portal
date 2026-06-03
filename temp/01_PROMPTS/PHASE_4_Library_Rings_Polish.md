# PHASE 4 — EXERCISE LIBRARY + ANIMATED RINGS + FULL PROFILE + POLISH
## SEND THIS FOURTH (only after Phase 3 works)

Final phase. Adds the exercise library, animated conic-gradient dashboard rings, complete client profile, and polish.

---

## STEP 1: EXERCISE LIBRARY PAGE

Standalone page at /exercises (sidebar link).

Layout:
- Page title: "Exercise Library" with exercise count badge ("200 exercises")
- Search bar: full width, "Search by name, muscle, equipment..."
- Filter row:
  - Primary Muscle (dropdown): All / Quads / Hamstrings / Glutes / Chest / Back / Shoulders / Biceps / Triceps / Core / Abs / Calves / etc.
  - Equipment (dropdown): All / Barbell / Dumbbells / Cable / Bodyweight / Machine / Kettlebell / etc.
  - Difficulty (dropdown): All / Beginner / Intermediate / Advanced
  - Type (dropdown): All / Compound / Isolation / Olympic / Plyo / Isometric
- Clear Filters button

Results: Responsive card grid (3 cols desktop, 2 tablet, 1 mobile)

Exercise card:
```
+--------------------------------------+
| [COMPOUND]          [Intermediate]   |
| Barbell Back Squat                   |
|                                      |
| Primary: Quads                       |
| Secondary: Glutes                    |
| Equipment: Barbell                   |
| MET: 8.0                             |
|                                      |
| [Expand for details v]               |
+--------------------------------------+
```

Expanded state shows:
- Full description
- Safety notes (amber text)
- Video URL (if not placeholder)

Card styling:
- Background: #151D2E
- Border: 1px solid #2A3A50
- Border-radius: 12px
- Hover: border turns cyan, subtle lift

Compound badge: #00AEEF cyan bg
Isolation badge: #8B5CF6 purple bg
Olympic badge: #F59E0B amber bg
Isometric badge: #22C55E green bg

Difficulty dots:
- Beginner: #22C55E
- Intermediate: #F59E0B
- Advanced: #EF4444

Use the full 200 exercises from the database. Store as a JSON import or read from the Excel file.

---

## STEP 2: DASHBOARD CONIC-GRADIENT RINGS

Replace the simple metric cards from Phase 1 with animated conic-gradient rings.

### The Ring CSS (conic-gradient method)

```css
.ring-container {
  position: relative;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Desktop default */
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

/* The colored arc + dark track */
.ring-container::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    var(--ring-color, #00AEEF) var(--ring-percent, 0%),
    #1E293B 0%
  );
  box-shadow: 
    0 0 8px rgba(0, 174, 239, 0.15),
    inset 0 0 12px rgba(0, 0, 0, 0.3);
}

/* Inner mask — creates donut hole */
.ring-container::after {
  content: '';
  position: absolute;
  inset: 7px; /* ring thickness */
  border-radius: 50%;
  background: #151D2E;
  box-shadow: 
    inset 0 2px 6px rgba(0, 0, 0, 0.4),
    0 1px 2px rgba(255, 255, 255, 0.05);
}

/* Glowing dot at arc tip */
.ring-dot {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--ring-color, #00AEEF);
  box-shadow: 
    0 0 6px var(--ring-color, #00AEEF),
    0 0 12px rgba(0, 174, 239, 0.4);
  transform: rotate(var(--ring-angle, -90deg)) translateY(-32px);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 2;
}
.ring-dot.visible {
  opacity: 1;
}

/* Center text */
.ring-center {
  position: relative;
  z-index: 3;
  text-align: center;
}
.ring-value {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  color: #F1F5F9;
  font-size: 16px;
  line-height: 1.1;
}
```

### Animation JavaScript

```javascript
function animateRing(ringEl, targetPercent, duration = 1000) {
  const startTime = performance.now();
  const dot = ringEl.querySelector('.ring-dot');
  const valueEl = ringEl.querySelector('.ring-value');
  
  if (dot && targetPercent > 0) dot.classList.add('visible');
  
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out-cubic: starts fast, slows to stop
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * targetPercent);
    
    ringEl.style.setProperty('--ring-percent', current + '%');
    const angle = -90 + (current / 100) * 360;
    ringEl.style.setProperty('--ring-angle', angle + 'deg');
    
    if (valueEl && !valueEl.dataset.static) {
      valueEl.textContent = current + '%';
    }
    
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// On mount, stagger animations:
document.querySelectorAll('[data-ring-target]').forEach((ring, i) => {
  const target = parseInt(ring.dataset.ringTarget);
  setTimeout(() => animateRing(ring, target, 1000), i * 200);
});
```

### Card Layout (4-2-2 responsive)

```css
.metric-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* mobile: 2 columns */
  gap: 12px;
  padding: 16px;
}
@media (min-width: 1024px) {
  .metric-cards-grid {
    grid-template-columns: repeat(4, 1fr); /* desktop: 4 columns */
    gap: 20px;
    padding: 24px;
  }
}
```

### Card Internal Layout

**Mobile (< 590px): VERTICAL** — ring on top, text below, centered
```
+----------+
|    70%   |  <- ring centered
|  (ring)  |
| SESSIONS |
| 14/20 +4 |
+----------+
```

**Tablet+ (590px+): HORIZONTAL** — ring left, text right
```
+--------------+
| +----+       |
| |70% |  14/20 |
| +----+  +4   |
|         Sess |
+--------------+
```

Use flex-direction switching:
```css
.metric-card {
  display: flex;
  flex-direction: column; /* mobile vertical */
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 12px;
}
@media (min-width: 590px) {
  .metric-card {
    flex-direction: row; /* tablet+ horizontal */
    align-items: center;
    text-align: left;
    gap: 14px;
    padding: 18px;
  }
}
```

### Ring Sizes Per Breakpoint

| Screen | Ring | Label | Value | Delta |
|--------|------|-------|-------|-------|
| Mobile (< 590) | 56px | 9px | 16px | 10px |
| Tablet (590-1023) | 72px | 11px | 20px | 11px |
| Desktop (1024-1399) | 64px | 10px | 18px | 11px |
| Wide (1400+) | 72px | 10px | 20px | 11px |

### 4 Metric Cards

1. **Sessions This Week**
   - Ring: 70% fill (example)
   - Label: "SESSIONS THIS WEEK" (11px uppercase muted)
   - Value: "14/20" (bold)
   - Delta: "+4" green badge

2. **Adherence Score**
   - Ring: 87% fill
   - Label: "ADHERENCE SCORE"
   - Value: "87%"
   - Delta: "+5%" green badge

3. **Active Clients**
   - Ring: 100% fill, center shows "24"
   - Label: "ACTIVE CLIENTS"
   - Value: "24"
   - Delta: "+3" green badge
   - Below value: 3-segment bar: 18🟢 4🟡 2🔴

4. **Weekly Revenue**
   - Ring: 81% fill
   - Label: "WEEKLY REVENUE"
   - Value: "$3,240"
   - Delta: "+12" green badge
   - Eye icon 👁 top-right to toggle hide "$3,240" → "••••"

---

## STEP 3: FULL CLIENT PROFILE PAGE

Replace the Phase 1 basic client view with a full tabbed profile.

### Profile Header

```
+--------------------------------------------------+
| [JD]  John Doe                        [Active v] |
|       36 years old · Male · Build Muscle         |
|       +1 (852) 9123 4567                         |
+--------------------------------------------------+
```

Avatar: Large circle (64px) with initials, cyan bg.
Status dropdown: Active / Paused / Archived (changes color).

### Quick Stats Row (4 conic-gradient rings)

Weight | Body Fat % | TDEE | BMI — all animated rings.

### Tab Navigation

Horizontal scrollable tabs:
Overview | Body | Nutrition | Programs | Sessions | Progress | Notes

### Tab: Overview
- Goals (primary + secondary)
- Contact info
- Emergency contact
- Equipment
- Session preferences
- Quick actions: [Edit Profile] [Create Program] [Log Session] [Re-Assess]
- Coach notes textarea (auto-save)

### Tab: Body (Assessments)
- History of ALL body assessments (date-stamped)
- Each assessment expandable showing:
  - Weight, BMI, body fat %
  - All 12 skinfold values
  - All circumference measurements
  - TDEE at that time
- Line chart: Weight over time
- Line chart: Body fat % over time
- Line chart: Sum of skinfolds over time

### Tab: Nutrition
- TDEE display
- 4 calorie target cards
- Diet preference selector
- Macro breakdown bar
- Per-meal breakdown
- "Re-Calculate" button

### Tab: Programs
- List of assigned programs
- Each: name, status, created date, [View] [Edit] buttons
- [Create New Program] button

### Tab: Sessions
- Workout log (placeholder for Phase 5)
- Calendar view of sessions
- [Log Session] button

### Tab: Progress
- Combined chart: Weight + Body Fat % over time (dual axis)
- Circumference comparison (latest vs first assessment)
- "X weeks of progress" summary

### Tab: Notes
- Simple textarea for coach notes
- Auto-saves on blur
- Timestamped note history

---

## STEP 4: POLISH ITEMS

### Toast Notifications
```
+----------------------------------+
|  [icon]  Message text            |
+----------------------------------+
```
- Success: green left border, checkmark icon
- Error: red left border, X icon
- Info: cyan left border, info icon
- Slide up from bottom center, auto-dismiss 3s
- Max 3 stacked

### Loading Skeletons
While data loads (especially for charts and lists), show:
```
+------------------+
| ████████░░░░░░░░ |  <- animated pulse gray bar
| ██████░░░░░░░░░░ |
| ██████████░░░░░░ |
+------------------+
```
Use Tailwind's `animate-pulse` class on divs with bg colors matching card backgrounds.

### Empty States
Every page/section that could be empty:
- Illustration (simple SVG)
- Heading: "No [items] yet"
- Subtext: "[Explanation of what this is]"
- CTA button to add/create

Examples:
- "No programs yet. Create your first program for this client."
- "No sessions logged. Start logging workouts."
- "No body assessments. Complete the intake wizard."

### Mobile Menu
- < 768px: sidebar becomes hamburger menu
- Slide-in overlay from left
- Dark bg with blur backdrop
- Close button or tap outside to close

### Page Transitions
Use Framer Motion for route transitions:
```javascript
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.2 }}
>
```

### Other Polish
- Favicon: simple cyan "A" on dark bg
- Meta tags: <title>AzFIT — Coach OS</title>, description
- Print styles for programs (hide nav, show clean exercise tables)
- Scroll to top button (appears after scrolling down)
- Keyboard shortcuts: "/" to focus search, "Escape" to close modals

---

## DELIVERABLE — TEST CHECKLIST

1. [ ] Exercise Library page loads with all 200 exercises
2. [ ] Search filters exercises by name
3. [ ] Muscle/equipment/difficulty/type filters work
4. [ ] Clear filters button resets all
5. [ ] Exercise cards expand to show description and safety notes
6. [ ] Dashboard shows 4 conic-gradient rings on desktop (4 columns)
7. [ ] Dashboard shows 2 columns on tablet and mobile
8. [ ] Mobile cards: ring on TOP, text below, centered
9. [ ] Tablet+ cards: ring on LEFT, text on RIGHT
10. [ ] Rings animate from 0% on page load (staggered)
11. [ ] Active Clients card shows 18🟢 4🟡 2🔴 segmented bar
12. [ ] Revenue card eye toggle hides/shows value
13. [ ] Client profile has tab navigation (Overview, Body, Nutrition, etc.)
14. [ ] Body tab shows assessment history with charts
15. [ ] Nutrition tab shows TDEE + calorie targets + macros
16. [ ] Programs tab lists assigned programs
17. [ ] Progress tab shows weight + body fat % charts over time
18. [ ] Notes tab saves and persists coach notes
19. [ ] Toast notifications work (success, error, info)
20. [ ] Loading skeletons show while data loads
21. [ ] Empty states display for all empty sections
22. [ ] Mobile hamburger menu works
23. [ ] Page transitions are smooth
24. [ ] Print styles work for programs
