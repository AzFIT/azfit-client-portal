# MASTER PROMPT — Send This Entire Block to AI Kimi Code

---

## YOUR ROLE
You are a senior frontend architect. Build me an interactive **AzFIT Design System & Component Library Viewer** — a single-page HTML app that serves as both a living style guide and a visual component playground. This is NOT the actual AzFIT app. It is a DESIGN TOOL that shows how every UI element looks, behaves, and animates, so I can review and approve the visual direction before any app code is written.

The viewer must let me:
1. **Browse** every component in a sidebar-organized catalog
2. **Interact** with components (click, hover, toggle, select)
3. **Switch** between light/dark themes instantly
4. **Copy** CSS values and design tokens with one click
5. **See** live rendered previews + the code/CSS that powers them

---

## OUTPUT FORMAT
Produce a **single self-contained HTML file** (`azfit-design-system.html`) with:
- All CSS embedded in `<style>`
- All JavaScript embedded in `<script>`
- External dependency: Google Fonts `Inter:wght@300;400;500;600;700;800`
- No frameworks, no build step — double-click to open

---

## PAGE STRUCTURE

### Top Bar (Fixed, 56px height)
- Left: AzFIT "A" logo icon (36px cyan circle with white "A") + "AzFIT Design System" label
- Right: Theme toggle button (sun/moon icon) + "Copy Tokens" button

### Sidebar (Fixed, 260px wide, scrollable)
Organized navigation sections with the following links that scroll to each section:

**OVERVIEW**
- Cover / Hero
- Design Tokens
- Color Palette
- Typography
- Shadows & Effects

**COMPONENTS**
- Buttons
- Selection Cards
- Form Elements
- Dropdowns
- Toggles & Switches
- Checkboxes & Radios
- Progress Bars
- Stat Cards
- Phase Cards
- Split Cards
- FAB (Floating Action Button)
- Toast Notifications

**LAYOUT**
- ASCII Wireframe
- Wizard Flow
- Grid System
- Responsive Breakpoints

**INTERACTIONS**
- Animation Library
- Hover States
- Transitions
- Micro-interactions

**PROTOTYPE**
- Live Wizard Demo
- Component Playground

### Main Content Area (scrollable, left margin 260px)
Each section renders below. Use smooth-scroll when sidebar links are clicked.

---

## DESIGN TOKENS — EXACT VALUES

These are the canonical values. Every component MUST use these CSS custom properties. The theme toggle switches between light and dark by changing these root variables.

```css
/* LIGHT MODE (default on html) */
html {
  --azfit-cyan: #00AEEF;
  --azfit-cyan-light: #22D3EE;
  --azfit-cyan-dark: #0095CC;
  --azfit-navy: #0B1120;
  --navy-light: #151D2E;
  --navy-lighter: #1E2940;
  
  --bg-primary: #F8FAFC;
  --bg-card: #FFFFFF;
  --bg-elevated: #F1F5F9;
  --border-default: #E2E8F0;
  --border-focus: #00AEEF;
  
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --text-muted: #94A3B8;
  
  --success: #22C55E;
  --warning: #F59E0B;
  --error: #EF4444;
  
  --phase-accumulation: #8B5CF6;
  --phase-intensification: #F59E0B;
  --phase-realization: #22C55E;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  --shadow-glow: 0 0 20px rgba(0,174,239,0.3);
  
  --radius-card: 12px;
  --radius-input: 8px;
  --radius-pill: 9999px;
  
  --transition-fast: 150ms ease;
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms ease;
  
  --font: 'Inter', system-ui, -apple-system, sans-serif;
  --header-height: 56px;
  --sidebar-width: 260px;
}

/* DARK MODE (toggled via data-theme="dark" on html) */
html[data-theme="dark"] {
  --bg-primary: #0B1120;
  --bg-card: #151D2E;
  --bg-elevated: #1E2940;
  --border-default: #2A3A50;
  --border-focus: #00AEEF;
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.25);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.35);
}
```

Theme toggle: clicking the sun/moon button toggles `data-theme="dark"` on `<html>` and updates the icon. Smooth transition (300ms) on background-color, color, border-color.

---

## SECTION 1: COVER / HERO

Full-width gradient header at the top of the main content:
```css
background: linear-gradient(135deg, #0B1120 0%, #0F172A 40%, #0B2A4A 70%, #00AEEF 180%);
color: white;
padding: 80px 40px 60px;
```

Content:
- Title: "AzFIT Design System" (32px, bold, white)
- Subtitle: "Visual language, component library, and interaction patterns for the AzFIT Coach OS" (16px, white at 60% opacity)
- Stats row (3 items, horizontal):
  - "42+" / "Components"
  - "8-Step" / "Wizard Flow"
  - "2" / "Themes"
- Two buttons: "Explore Components" (cyan filled) + "View Wizard" (white outline)

---

## SECTION 2: DESIGN TOKENS

A table of ALL tokens organized by category. Each row shows: Token Name | Value | Visual Preview (swatch for colors, rendered shadow for shadows, etc.). Use the exact CSS variable names.

Categories: Colors, Spacing, Radii, Shadows, Typography Scale, Transitions, Z-Index.

Include a "Copy" button next to each token that copies `var(--token-name)` to clipboard and shows a micro-toast.

---

## SECTION 3: COLOR PALETTE

Grid of color swatches showing every color in the system:
- Brand: Cyan (#00AEEF), Cyan Light (#22D3EE), Cyan Dark (#0095CC), Navy (#0B1120)
- Phases: Accumulation purple (#8B5CF6), Intensification amber (#F59E0B), Realization green (#22C55E)
- Semantics: Success (#22C55E), Warning (#F59E0B), Error (#EF4444)
- Neutrals: Full grayscale from white to black (at least 8 steps)

Each swatch: 80px square, rounded 8px, shows hex value on hover in a tooltip. Click copies the hex to clipboard.

---

## SECTION 4: TYPOGRAPHY

Show the Inter font family at every weight used:
- Display: 48px/800 (hero titles)
- H1: 32px/700
- H2: 28px/700
- H3: 20px/700
- H4: 16px/700
- Body: 14px/400
- Body Small: 13px/400
- Caption: 12px/500
- Label: 11px/600 uppercase tracking-wide

Show each with sample text "The quick brown fox jumps over the lazy dog" and the CSS specs below each.

---

## SECTION 5: SHADOWS & EFFECTS

Visual cards demonstrating each shadow tier (sm, md, lg, glow) on sample white/dark cards. Also show:
- Backdrop blur effect
- Gradient overlays
- Pulse animation glow
- Border glow on focus

---

## SECTION 6: BUTTONS

Interactive demo grid showing ALL button variants:

**Primary**: Cyan bg (#00AEEF), white text, pill shape. Hover: darker cyan + translateY(-1px) + larger shadow.
**Secondary**: Transparent bg, border 1.5px solid border-default, dark text. Hover: border cyan, text cyan.
**Ghost**: Transparent, no border, muted text. Hover: text cyan.
**Danger**: Red bg (#EF4444), white text. Hover: darker red.
**FAB**: 56px circle, cyan bg, white +, fixed position option. Pulse glow animation.

Each button must be clickable and show its hover/active state. Include size variants: Small (32px height), Default (40px), Large (48px).

---

## SECTION 7: SELECTION CARDS

Interactive selectable cards grid — the core interaction pattern of the AzFIT wizard.

Card anatomy:
- Optional accent border (top or left, 4px colored)
- Icon (emoji or SVG) centered at top
- Title (bold)
- Description (small, muted)
- Check badge (top-right, appears on selection, scale animation)

Show variants:
- Goal cards (Lose Weight, Build Muscle, Strength, Endurance, General Fitness) with different accent colors
- Method cards (Straight Sets, Supersets, Trisets, Dropsets, Circuit)
- Program template cards (GBC, HIIT, GVT, PPL, Full Body, Custom) with top accent colors
- Phase cards (Accumulation, Intensification, Realization) with left accent

Interaction: Click toggles `.selected` class. Show visual feedback instantly.

---

## SECTION 8: FORM ELEMENTS

Interactive showcase of every form input:

**Text Input**: Bordered, 8px radius, focus ring (cyan, 3px spread). Show placeholder state, filled state, focus state, error state (red border).
**Textarea**: Same styling, resizable vertically, min-height 80px.
**Select/Dropdown**: Custom styled with chevron icon, dropdown menu with hover states.
**Checkbox**: Custom 18px square, checked state fills cyan with white checkmark + bounce animation.
**Radio Button**: Custom 16px circle, checked fills cyan with inner dot.
**Toggle Switch**: 44x24px track, 18px thumb, slides right on check.
**Slider/Range**: 6px track, 20px cyan thumb with white border.

Show each in a labeled demo box. All must be functional (clickable, typeable).

---

## SECTION 9: PROGRESS BARS

Show:
- **Wizard progress bar**: Thin (4px) with gradient fill (cyan to cyan-light), animated width transition
- **Step indicators**: 8 dots in a row, 3 states (upcoming=empty border, current=cyan filled + glow, completed=green filled + checkmark)
- **Phase timeline**: Horizontal stacked color bar showing Accumulation (purple), Intensification (amber), Realization (green) segments with proportional widths
- **Circular progress**: Optional, for metric cards

Include "Animate" buttons to trigger fill animations so I can see the motion.

---

## SECTION 10: STAT CARDS

Grid of stat cards showing how metrics display:
- Icon (colored) on top
- Label (small, muted)
- Value (large, bold)
- Optional delta badge (+3 this week, +12% vs last)

Show 6 examples: Active Clients, Workouts This Week, Avg Compliance, Duration, Frequency, Volume.

---

## SECTION 11: PHASE CARDS

Three large cards showing the periodization phases:
- **Accumulation**: Purple icon bg, purple border when selected, "Weeks 1-4", "High volume, moderate intensity", "4 sets x 12 reps"
- **Intensification**: Amber icon bg, amber border, "Weeks 5-8", "Moderate volume, high intensity", "3 sets x 8 reps"
- **Realization**: Green icon bg, green border, "Weeks 9-12", "Low volume, peak intensity", "2 sets x 5 reps"

Each has colored week badge, icon circle, and check badge on selection. Below the cards, show a **phase timeline bar** with colored segments proportional to weeks.

---

## SECTION 12: SPLIT CARDS

Show the weekly training split grid:
- 7 day cards (Mon-Sun) in a row
- Training days: solid cyan border, cyan-tinted bg
- Rest days: dashed border, muted
- Each shows day name + workout type + muscle tags (small pills) + exercise count

Below: a split summary stat bar (3 columns: Total Exercises, Training Days, Est. Time).

---

## SECTION 13: DAY TOGGLES

Interactive 7-day selector:
- Mon-Sun cards in a row
- Click toggles between Training (cyan bg, white text, shadow) and Rest (default bg, muted text)
- Updates a counter text below ("X training days selected")
- Include a FAB (+ button) that "adds" a training day by activating the next rest day

---

## SECTION 14: TOAST NOTIFICATIONS

Demo button that triggers a toast:
- Slides up from bottom center
- Dark navy bg, white text, left cyan accent border
- Auto-dismisses after 3 seconds
- Queue up to 3 toasts max
- Include variations: Success (green border), Error (red border), Info (cyan border)

---

## SECTION 15: ASCII WIREFRAME

A dark navy container with monospace text showing the complete AzFIT Program Creator layout in ASCII:

```
+--------------------------------------------------------------------------------+
| NAV BAR: [Logo] [Dashboard] [Programs] [Clients] [Settings] [Help]             |
+--------------------------------------------------------------------------------+
| PROGRAM CREATOR WIZARD                                                         |
|--------------------------------------------------------------------------------|
| STEP 1: Primary Goal Selection                                                 |
| [CARD] Lose Weight | Build Muscle | Strength | Endurance | Fitness             |
|--------------------------------------------------------------------------------|
| STEP 2: Training Method                                                        |
| [CARD] Straight Sets | Supersets | Trisets                                     |
| ... (continue through all 8 steps)                                             |
|--------------------------------------------------------------------------------|
| FOOTER: Progress Bar [##########----------] 70% Complete                       |
+--------------------------------------------------------------------------------+
```

Use color coding: cyan for labels, gray for borders, muted for descriptions. Include a legend below explaining `[CARD]`, `[FORM]`, `[FAB]`, `[BUTTON]` symbols.

---

## SECTION 16: WIZARD FLOW

Show the complete 8-step wizard as a **non-interactive visual map**:
1. Goal → 2. Method → 3. Program → 4. Profile → 5. Phase → 6. Days → 7. Preview → 8. Done

Horizontal flow diagram with arrows. Each step shows a mini icon and label. Current step highlighted in cyan, completed in green, upcoming in muted.

---

## SECTION 17: ANIMATION LIBRARY

For EACH animation, show:
- **Live demo** (click to trigger or auto-looping)
- **Specification table**: Property | From Value | To Value | Duration | Easing
- **CSS snippet** (collapsible, syntax-highlighted)

Animations to include:
1. **Card Hover**: scale(1)→scale(1.05), shadow grows, 300ms, cubic-bezier(0.4,0,0.2,1)
2. **Button Hover**: bg darkens, translateY(-1px), 200ms
3. **Step Transition**: slide in from right (translateX 30px → 0), fade in, 400ms
4. **Check Badge Pop**: scale(0)→scale(1), 200ms, cubic-bezier(0.34,1.56,0.64,1) — bouncy overshoot
5. **Checkbox Bounce**: scale(1)→scale(1.2)→scale(1), 300ms
6. **Progress Fill**: width animates with gradient, 400ms ease-in-out
7. **Toast Slide Up**: translateY(100%)→translateY(0), 400ms
8. **FAB Pulse**: box-shadow oscillates intensity, 1.5s infinite
9. **Confetti Burst**: pieces fall from top, rotate, fade out, 3s
10. **Success Check Pop**: scale(0)→scale(1.2)→scale(1), 500ms
11. **Dropdown Open**: opacity 0→1, translateY(-8px)→0, 250ms
12. **Card Selection Glow**: border color + box-shadow spread, 150ms

---

## SECTION 18: LIVE WIZARD DEMO

A **fully functional miniature** of the 8-step wizard contained in a bordered box. This is the crown jewel — it proves the entire design system works together.

**How it works:**
- Fixed header inside the box with progress bar (4px, gradient fill) and 8 step dots
- Body area shows the current step's content
- Footer has "Back" (secondary, disabled on step 1) and "Next" (primary) buttons
- "Next" changes to "Generate" on step 7, then "Done" on step 8

**Step contents (simplified but visually accurate):**
1. Goal: 5 selectable cards (Lose Weight, Build Muscle, Strength, Endurance, Fitness)
2. Method: 5 selectable cards (Straight Sets, Supersets, Trisets, Dropsets, Circuit)
3. Program: 6 template cards (GBC, HIIT, GVT, PPL, Full Body, Custom)
4. Profile: Form with Name input, Experience dropdown, Equipment dropdown, Session time dropdown
5. Phase: 3 phase cards (Accumulation, Intensification, Realization) + timeline bar
6. Days: 7 day toggles (Mon-Sun) + counter
7. Preview: 5 stat cards + intensity/volume sliders + preview text
8. Done: Green checkmark icon + "Program Generated!" + action buttons (Edit, Print, Assign, Save) + weekly structure mini + confetti burst

Navigation: Next/Back buttons update step, progress bar animates width, step dots update state, body content cross-fades.

---

## SECTION 19: COMPONENT PLAYGROUND

A free-form area where I can interact with isolated component demos:

**Row 1 — Selection Cards**: 3 mini goal cards, click to toggle selection
**Row 2 — Buttons**: All 4 variants side by side, clickable
**Row 3 — Progress**: Progress bar + "Animate" / "Reset" buttons
**Row 4 — Toast**: Button to trigger toast notification
**Row 5 — FAB**: Mini floating + button with pulse animation

---

## SECTION 20: RESPONSIVE BREAKPOINTS

Visual reference showing:
- Desktop (>1024px): Full sidebar layout
- Tablet (768-1023px): Sidebar collapses, 2-column grids
- Mobile (<768px): Single column, hamburger menu, stacked layout

Show a mini mockup diagram for each breakpoint (simplified wireframe).

---

## INTERACTION REQUIREMENTS

1. **Sidebar navigation**: Clicking a link smooth-scrolls to the section. Active section highlighted.
2. **Theme toggle**: Instant light/dark switch, all components update.
3. **Component interactions**: Every button, card, toggle, checkbox, slider MUST be functional — not static.
4. **Copy to clipboard**: Clicking any token, color swatch, or code block copies the value.
5. **Collapsible code**: Each section has a "Show CSS" toggle that reveals the CSS code block with syntax highlighting (styled spans — keyword, property, value, selector colors).
6. **Mobile menu**: Hamburger button on <768px collapses/expands sidebar overlay.
7. **Scroll spy**: Sidebar updates active link as user scrolls through sections.

---

## VISUAL QUALITY STANDARDS

- Every pixel must feel intentional — no default browser styling
- All spacing uses 4px grid (4, 8, 12, 16, 20, 24, 32, 40, 48, 64)
- Borders: 1px solid for cards, 1.5px for form inputs, 2px for selected states
- Border-radius: 6px for inputs, 8px for small cards, 10px for cards, 12px for sections, 9999px for pills/buttons
- Font: Inter at all sizes, antialiased rendering
- Transitions: All state changes animated, nothing snaps instantly
- Dark mode must look as polished as light mode — not an afterthought

---

## WHAT TO DELIVER

A single file named `azfit-design-system.html` that I can open in any browser. It must be completely self-contained (CSS and JS inline). When I open it, I see a professional design system documentation site that I can navigate, interact with, and use to evaluate every visual decision for the AzFIT app.

Do NOT build the actual AzFIT application. This is purely a DESIGN SYSTEM VIEWER.

---

END OF PROMPT — Send everything above to Kimi Code as one message.
