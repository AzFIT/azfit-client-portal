# AZFIT CLIENT PORTAL — COMPLETE MONITORING GUIDE
## AI Prompt + Change Directive Manual + Instagram Story Strategy

**Prepared for:** AzFIT Project Owner  
**Website:** https://azfit.github.io/azfit-client-portal  
**GitHub Repo:** https://github.com/AzFIT/azfit-client-portal  
**Tech Stack:** React 19 + TypeScript + Vite 7 + Tailwind CSS 3 + shadcn/ui + Framer Motion  
**Built by:** AzTechFit Hong Kong  
**Date:** June 2026

---

# PART 1: FULL DETAIL AI PROMPT FOR KIMI CODE

## Copy-Paste This Prompt Directly to AI Kimi Code

```
BUILD AZFIT CLIENT PORTAL — THE OPERATING SYSTEM FOR MODERN PERSONAL TRAINING

PROJECT OVERVIEW
Build a complete client portal and landing page for AzFIT, an AI-driven personal training platform for professional fitness coaches. The site has TWO parts: (1) a public marketing landing page and (2) a protected coach/client portal with dashboard, program builder, exercise library, client management, AI chat assistant, calendar, nutrition tracking, and progress photo system.

TECH STACK (Non-negotiable)
- React 19 + TypeScript 5.9
- Vite 7.2 (build tool)
- Tailwind CSS 3.4
- shadcn/ui components
- Framer Motion 12 (animations)
- Recharts 2.15 (charts/graphs)
- Zustand 5 (state management)
- HashRouter for client-side routing (required for GitHub Pages static hosting)
- Lucide React (icons)
- Deploy to GitHub Pages

COLOR SYSTEM
- Primary Accent: Cyan/Blue gradient (#00D4FF to #0099FF)
- Background Dark: #0A0E1A (main), #0D1117 (cards), #161B22 (elevated)
- Text: #FFFFFF (primary), #94A3B8 (secondary), #64748B (muted)
- Success: #10B981, Warning: #F59E0B, Danger: #EF4444
- Gradients: Blue glow effects, subtle cyan borders

LANDING PAGE SECTIONS (in order)
1. NAVBAR: Fixed top, transparent→blur on scroll. Logo (AzFIT "A" icon) left, nav links center (Features, How It Works, Pricing, About), Log In + Get Started buttons right. Mobile hamburger menu.

2. HERO: Full viewport height, dark gym background image with cyan overlay gradient. Left side: "THE FIRST OF ITS KIND" eyebrow, "AZFIT" massive title (cyan), "The Operating System for Modern Personal Training" subtitle, description paragraph. Two CTAs: "Start 14-Day Trial" (filled cyan) + "Watch Demo" (outline with play icon). Right side: Glowing AzFIT logo orb with floating particles animation. Below: 3 animated stats (500+ Coaches, 50,000+ Workouts, 99.9% Uptime).

3. TRUSTED BRANDS: Horizontal scrolling marquee of 8 partner logos (FitPro Alliance, AthleteX, GymTrack, CoreMetrics, RepSync, FitTech Asia, BioLab, TrainIQ). Gray/muted treatment, opacity hover reveal.

4. AI FEATURES SECTION: Two-column layout. Left: "ARTIFICIAL INTELLIGENCE" eyebrow, "AI That Coaches With You" heading, description about context-aware AI, 3 bullet points with checkmarks (context-aware, drag-and-drop floating assistant, learns your style), "Explore AI Features" button. Right: Animated AI brain visualization — glowing orb with 6 orbiting feature icons (heart rate, chat, trends, calendar, analytics, sync).

5. DASHBOARD PREVIEW: "THE INTERFACE" eyebrow, "A View Into Performance" large centered title. Scrolling ticker text behind (LOAD • VOLUME • INTENSITY • HR_ZONE • RECOVERY • STREAK • SYNC). Mockup of AzFIT Dashboard showing: Active Clients (24, +3), Workouts This Week (156, +12%), Avg Compliance (87%, +5%), Weekly Volume Trend bar chart (Mon-Sun).

6. FEATURES GRID: "Scroll. Sync. Transform." large title, subtitle "Every feature engineered to remove friction from the coaching workflow." 6 feature cards in 2 rows of 3:
   - AI-Powered Programming: Generate personalized programs in seconds
   - BioPrint Assessment: 7-site body composition tracking
   - Smart Nutrition: TDEE, macros, meal tracking
   - Client Management: Profiles, progress tracking, engagement analytics
   - Calendar: Schedule sessions, set reminders
   - Analytics: Revenue, retention, ML-powered churn prediction
   Each card: icon, title, description, hover glow effect.

7. TESTIMONIALS: "Built for the Best" title, 3 testimonial cards with quotes from coaches (Marcus Chen - Hong Kong, Sarah Lim - Singapore, David Park - Seoul). Star ratings, role badges.

8. CTA SECTION: "Ready to Transform Your Coaching?" heading, subtext about 14-day trial, two buttons (Start Free Trial + View Pricing), reassurance text below.

9. FOOTER: 4-column layout — Logo + tagline + social icons (Instagram, TikTok, LinkedIn), Product links (Features, Pricing, Program Library, Nutrition Hub, AI Assistant), Resources links (Help Center, Exercise Database, Training Methods, Blog, Community), Company links (About Us, Careers, Contact, Privacy Policy, Terms of Service). Copyright: "2025 AzTechFit Hong Kong. All rights reserved. Made with precision in Hong Kong."

PORTAL PAGES (After Login)
- DASHBOARD: Metric cards (Active Clients, Workouts, Compliance, Revenue), weekly volume chart, recent activity feed, AI assistant floating widget
- PROGRAMS HUB: Grid of 84+ built-in programs + custom programs, filter by goal/template (GVT, GBC, HIIT, PPL, Full Body, Strength, Custom), search/sort, progress badges
- PROGRAM BUILDER (/programs/session/:programId): Day tabs selector, client profile sidebar, phase progress (Accumulation → Intensification → Realization), exercise cards with collapsible set tables, done toggle, quick adjust +/-2.5kg, per-set rest timer, volume bar, notes/lift records. Auto-save to localStorage.
- ALL-IN-ONE PROGRAM CREATOR (/programs/create): 6-step wizard — Step 1: Goal + Method + Client Context, Step 2: Weekly Hours + Split, Step 3: Exercise Selection (255 exercises), Step 4: Phase Configuration, Step 5: Review + Save, Step 6: Assign to Client
- EXERCISE LIBRARY (/exercises): 255 exercises with muscle group mapping, search, filter by body part/equipment, video demos, progression suggestions
- CLIENT DASHBOARD (/client): Progress photos timeline, body metrics charts (weight, body fat, measurements), diet compliance, goals tracking
- AI CHAT (/chat): Floating draggable chat widget, context-aware (knows current page and client), generates coaching cues, programming suggestions, exercise alternatives
- CALENDAR (/calendar): Monthly/weekly views, session scheduling, client appointments, reminders
- NUTRITION (/nutrition): TDEE calculator, macro targets, meal logging, compliance tracking
- PHOTOS (/photos): Client progress photo timeline, side-by-side comparison, date filtering
- SETTINGS (/settings): Profile, preferences, notifications, billing

DATA ARCHITECTURE
- localStorage persistence for programs, sessions, and user data
- programs_db.json: 84 built-in programs (loaded from CSV via generate script)
- exercises_db.json: 255 exercises with muscle group, equipment, difficulty data
- SavedProgram schema: id, createdAt, updatedAt, data (programName, goal, method, clientContext, phases, split, exercises, tags, template, trainingMethod, clientProfile)
- Session persistence: localStorage[`azfit-session-${programId}`] stores exercises, liftRecords, elapsed, activeDay

AUTHENTICATION
- Login page with email/password
- Register page for new coaches
- Demo mode: Email: trainer@azfit.com / Password: password
- Auth state managed via Zustand store

ANIMATIONS & INTERACTIONS
- Hero text reveal with staggered fade-in
- Stats counter animation (count up on scroll)
- AI orb floating particle animation (continuous subtle movement)
- Scroll-triggered section reveals using Framer Motion
- Dashboard card hover glow effects
- Feature card hover: scale + border glow
- Testimonial card hover: subtle lift + shadow
- Smooth scroll navigation for anchor links
- Marquee infinite scroll for trusted brands
- Ticker text infinite scroll behind dashboard section

RESPONSIVE REQUIREMENTS
- Desktop: Full layout as described
- Tablet: 2-column grids collapse, sidebar collapses
- Mobile: Single column, hamburger nav, stacked cards, touch-friendly buttons

DEPLOYMENT
- GitHub Pages static hosting
- Build output to dist/ folder
- HashRouter for SPA routing compatibility
- npm run build → npm run deploy workflow

CRITICAL NOTES
- All data persists in localStorage (no backend API)
- Use relative paths for assets (GitHub Pages compatible)
- Programs use Poliquin method exercise codes (A1/A2/A3 per day)
- Training methods: Straight Sets, Superset, Triset
- 3 phases: Accumulation → Intensification → Realization
```

---

# PART 2: CHANGE DIRECTIVE MANUAL
## How to Tell AI Kimi Code Exactly What to Change

Use this section as your reference manual. When you want to change something specific, copy the relevant directive format and send it to AI Kimi Code with your specific details.

---

### SECTION A: LANDING PAGE CHANGES

#### A1 — Change Hero Section
**Use when:** You want to modify the top banner area

```
DIRECTIVE: MODIFY HERO SECTION
Location: LandingPage.tsx → Hero component

Change: [describe what you want changed]
Examples:
- "Change headline from 'The Operating System for Modern Personal Training' to [NEW TEXT]"
- "Replace gym background image with [DESCRIBE NEW IMAGE]"
- "Add a new stat counter: [NUMBER] [LABEL]"
- "Change CTA button text from 'Start 14-Day Trial' to [NEW TEXT]"
- "Modify hero description paragraph to: [NEW TEXT]"
- "Add a trust badge below buttons: [DESCRIBE]"
- "Change the color of the AZFIT title from cyan to [COLOR]"

Constraints: Keep the two-column layout, maintain the glowing orb on the right, keep the eyebrow text styling.
```

#### A2 — Change Trusted Brands Section
**Use when:** You want to add/remove/update the logo marquee

```
DIRECTIVE: MODIFY TRUSTED BRANDS
Location: LandingPage.tsx → TrustedBrands marquee component

Change: [specify]
Examples:
- "Add new brand logo: [BRAND NAME] — provide SVG or PNG"
- "Remove [BRAND NAME] from the marquee"
- "Change marquee speed from slow to [faster/slower]"
- "Replace all 8 placeholder logos with real partner logos: [LIST]"
- "Add hover effect: pause marquee on hover"

File to check: public/ folder for logo assets
```

#### A3 — Change AI Features Section
**Use when:** Modifying the AI explanation area

```
DIRECTIVE: MODIFY AI FEATURES SECTION
Location: LandingPage.tsx → AIFeatures component

Change: [specify]
Examples:
- "Update AI description to: [NEW TEXT]"
- "Add 2 more bullet points: [LIST]"
- "Replace the AI brain orb visual with [DESCRIBE NEW VISUAL]"
- "Change the 3 bullet points to: [NEW LIST]"
- "Add a demo video embed instead of the orb"
- "Change button text from 'Explore AI Features' to [NEW TEXT]"
```

#### A4 — Change Dashboard Preview Section
**Use when:** Modifying the interface showcase

```
DIRECTIVE: MODIFY DASHBOARD PREVIEW
Location: LandingPage.tsx → DashboardPreview component

Change: [specify]
Examples:
- "Update mock dashboard numbers: Active Clients [X], Workouts [Y], Compliance [Z]%"
- "Replace the dashboard screenshot with an animated version"
- "Change the ticker text words to: [NEW WORDS]"
- "Add a second dashboard view that toggles between coach and client view"
- "Make the dashboard mockup interactive (clickable tabs)"
```

#### A5 — Change Features Grid
**Use when:** Adding, removing, or modifying feature cards

```
DIRECTIVE: MODIFY FEATURES GRID
Location: LandingPage.tsx → FeaturesGrid component

Change: [specify]
Examples:
- "Add a 7th feature card: [TITLE] — [DESCRIPTION] — [ICON TYPE]"
- "Remove the Calendar feature card"
- "Update Smart Nutrition description to: [NEW TEXT]"
- "Change feature card layout from 3x2 grid to [4x2 / 2x3 / other]"
- "Add icons to feature cards (currently they may be text-only)"
- "Add hover tooltip with more details on each card"
- "Make cards clickable — link to respective portal pages"
```

#### A6 — Change Testimonials Section
**Use when:** Updating coach reviews

```
DIRECTIVE: MODIFY TESTIMONIALS
Location: LandingPage.tsx → Testimonials component

Change: [specify]
Examples:
- "Replace testimonial 1 (Marcus Chen) with: Name: [X], Role: [Y], Quote: [Z], Location: [W]"
- "Add a 4th testimonial: [DETAILS]"
- "Change testimonial layout from 3 cards to a carousel"
- "Add star ratings to testimonials (currently showing [X] stars)"
- "Add client photos/avatars to testimonial cards"
- "Change background styling of testimonial section"
```

#### A7 — Change CTA Section
**Use when:** Modifying the call-to-action area

```
DIRECTIVE: MODIFY CTA SECTION
Location: LandingPage.tsx → CTASection component

Change: [specify]
Examples:
- "Change headline to: [NEW TEXT]"
- "Change subtext to: [NEW TEXT]"
- "Change button text: 'Start Free Trial' → [NEW], 'View Pricing' → [NEW]"
- "Add a countdown timer for limited offer"
- "Add a background video instead of solid color"
```

#### A8 — Change Footer
**Use when:** Updating footer content and links

```
DIRECTIVE: MODIFY FOOTER
Location: LandingPage.tsx → Footer component

Change: [specify]
Examples:
- "Add social media links: Instagram: [URL], TikTok: [URL], LinkedIn: [URL]"
- "Add new Product link: [LABEL] → [URL PATH]"
- "Change copyright text to: [NEW TEXT]"
- "Add newsletter signup form in footer"
- "Add app download badges (App Store / Google Play)"
- "Change footer layout from 4-column to [DESCRIBE]"
```

#### A9 — Change Navigation Bar
**Use when:** Modifying the top navigation

```
DIRECTIVE: MODIFY NAVBAR
Location: components/Navbar.tsx

Change: [specify]
Examples:
- "Add new nav link: [LABEL] linking to [SECTION OR PATH]"
- "Remove nav link: [LABEL]"
- "Change 'Get Started' button color to [COLOR]"
- "Add a notification bell icon for logged-in users"
- "Change navbar background from transparent to solid on scroll"
- "Add a dropdown menu under Features for: [LIST]"
- "Make navbar sticky with blur backdrop effect"
```

---

### SECTION B: PORTAL PAGE CHANGES

#### B1 — Change Dashboard Page
**Use when:** Modifying the main dashboard after login

```
DIRECTIVE: MODIFY DASHBOARD PAGE
Location: pages/DashboardPage.tsx

Change: [specify]
Examples:
- "Add new metric card: [TITLE] showing [METRIC] with [ICON]"
- "Change chart from bar chart to [line/pie/doughnut]"
- "Add a recent activity feed section showing: [LIST OF ACTIVITIES]"
- "Add quick action buttons: [LIST]"
- "Change dashboard layout from [CURRENT] to [DESCRIBE]"
- "Add AI assistant summary widget at top"
- "Add client onboarding checklist widget"
- "Add revenue chart with date range selector"

Data: Check store.ts for state management changes needed
```

#### B2 — Change Programs Hub
**Use when:** Modifying the programs listing page

```
DIRECTIVE: MODIFY PROGRAMS HUB
Location: pages/ProgramsPage.tsx

Change: [specify]
Examples:
- "Add new program template filter: [TEMPLATE NAME]"
- "Change program cards to show [more/less] information"
- "Add program search functionality"
- "Add sort options: [Newest, Most Popular, Alphabetical, etc.]"
- "Change grid layout from [X] columns to [Y] columns"
- "Add program categories/tags beyond templates"
- "Add a 'Create Program' FAB button"
- "Add program progress visualization on cards"
- "Add ability to duplicate programs"

Data: programs_db.json for built-in programs, localStorage for custom
```

#### B3 — Change Program Builder
**Use when:** Modifying the workout session interface

```
DIRECTIVE: MODIFY PROGRAM BUILDER
Location: pages/ProgramBuilderPage.tsx

Change: [specify]
Examples:
- "Add new training method: [METHOD NAME] (currently Straight Sets, Superset, Triset)"
- "Change weight adjustment increment from 2.5kg to [X]kg"
- "Add superset pairing visualization"
- "Add exercise video embed in expanded card"
- "Add rest timer sound notification"
- "Add ability to reorder exercises via drag-and-drop"
- "Add RPE (Rate of Perceived Exertion) tracking field"
- "Add set-by-set auto-progression suggestions"
- "Add workout notes section per day"
- "Change the phase indicator styling (Accumulation → Intensification → Realization)"

Data: localStorage[`azfit-session-${programId}`]
```

#### B4 — Change Exercise Library
**Use when:** Modifying the exercise database page

```
DIRECTIVE: MODIFY EXERCISE LIBRARY
Location: pages/ExerciseLibraryPage.tsx

Change: [specify]
Examples:
- "Add [X] new exercises to exercises_db.json: [LIST]"
- "Add filter by equipment type: [LIST]"
- "Add filter by difficulty: [Beginner/Intermediate/Advanced]"
- "Add exercise video player modal"
- "Add 'Add to Program' button on each exercise"
- "Add exercise substitution suggestions"
- "Add muscle group visualization diagram"
- "Add favorite/bookmark functionality"

Data: exercises_db.json (255 exercises), public/ folder for videos/images
```

#### B5 — Change Client Dashboard
**Use when:** Modifying client profile/progress page

```
DIRECTIVE: MODIFY CLIENT DASHBOARD
Location: pages/ClientProfilePage.tsx

Change: [specify]
Examples:
- "Add new metrics chart: [METRIC NAME]"
- "Add body measurement input form"
- "Add progress photo comparison slider (before/after)"
- "Add goal setting and tracking widget"
- "Add compliance score calculation"
- "Add client notes section for coaches"
- "Add PDF report export button"
- "Add WhatsApp/SMS integration for reminders"
```

#### B6 — Change AI Chat Assistant
**Use when:** Modifying the AI chat widget

```
DIRECTIVE: MODIFY AI CHAT
Location: components/AiChat.tsx

Change: [specify]
Examples:
- "Add new AI capability: [DESCRIBE FUNCTION]"
- "Change AI chat position from bottom-left to [POSITION]"
- "Add suggested prompt buttons: [LIST]"
- "Add AI-generated workout summary feature"
- "Add voice input capability"
- "Change AI avatar/icon to [DESCRIBE]"
- "Add typing indicator animation"
- "Add chat history persistence"
- "Add export conversation button"
```

#### B7 — Change Calendar Page
**Use when:** Modifying the scheduling system

```
DIRECTIVE: MODIFY CALENDAR
Location: pages/CalendarPage.tsx

Change: [specify]
Examples:
- "Add color-coding for different session types: [LIST]"
- "Add recurring session support"
- "Add client scheduling (let clients book slots)"
- "Add Google Calendar integration"
- "Add reminder notifications"
- "Add session templates (quick-add common sessions)"
- "Add group class scheduling"
```

#### B8 — Change Nutrition Page
**Use when:** Modifying nutrition tracking

```
DIRECTIVE: MODIFY NUTRITION
Location: pages/NutritionPage.tsx

Change: [specify]
Examples:
- "Add meal photo logging"
- "Add barcode scanner for food entry"
- "Add recipe database with macro calculations"
- "Add water intake tracker"
- "Add supplement tracking"
- "Add meal plan templates"
- "Add grocery list generator"
```

#### B9 — Change Authentication
**Use when:** Modifying login/register system

```
DIRECTIVE: MODIFY AUTH
Location: pages/LoginPage.tsx, pages/RegisterPage.tsx, store.ts

Change: [specify]
Examples:
- "Add Google OAuth login"
- "Add Apple Sign-In"
- "Add 'Forgot Password' flow"
- "Add email verification"
- "Change demo credentials to: [EMAIL] / [PASSWORD]"
- "Add multi-factor authentication"
- "Add role-based access (Admin, Coach, Client)"
```

---

### SECTION C: GLOBAL/STYLING CHANGES

#### C1 — Change Color Scheme
```
DIRECTIVE: MODIFY COLOR SCHEME
Location: tailwind.config.js, global CSS

Change:
- Primary accent: [#CURRENT] → [#NEW]
- Background dark: [#CURRENT] → [#NEW]
- Card background: [#CURRENT] → [#NEW]
- Text primary: [#CURRENT] → [#NEW]
- Success color: [#CURRENT] → [#NEW]
- Add new semantic color: [NAME] → [#VALUE]

NOTE: This affects ALL components. Allow extra time.
```

#### C2 — Change Typography
```
DIRECTIVE: MODIFY TYPOGRAPHY
Location: tailwind.config.js, index.html (Google Fonts)

Change:
- Heading font: [CURRENT] → [NEW FONT]
- Body font: [CURRENT] → [NEW FONT]
- Hero title size: [CURRENT] → [NEW SIZE]
- Body text size: [CURRENT] → [NEW SIZE]
- Add font weight variations: [LIST]
```

#### C3 — Change Animations
```
DIRECTIVE: MODIFY ANIMATIONS
Location: Framer Motion variants throughout components

Change:
- "Change scroll reveal animation from fade-up to [fade-in/slide-left/zoom-in]"
- "Change animation duration from [X]s to [Y]s"
- "Add stagger delay of [X]ms between items"
- "Remove all animations for performance"
- "Add parallax scrolling effect to [SECTION]"
- "Add page transition animation: [DESCRIBE]"
```

#### C4 — Add New Page
```
DIRECTIVE: ADD NEW PAGE
Location: pages/[NewPageName].tsx + App.tsx (routing)

Details:
- Page name: [NAME]
- Route path: [PATH]
- Purpose: [DESCRIPTION]
- Sections: [LIST]
- Data needs: [DESCRIBE]
- Navigation link: [WHERE TO ADD]
```

---

### SECTION D: DATA/CONTENT CHANGES

#### D1 — Update Programs Database
```
DIRECTIVE: UPDATE PROGRAMS
Location: temp/CSVs → generate_programs.cjs → public/programs_db.json

Change:
- "Add [X] new programs: [LIST with details]"
- "Modify existing program [NAME]: [CHANGES]"
- "Add new program category: [NAME]"
- "Regenerate programs_db.json with updated data"

NOTE: Requires running the generation script after CSV changes.
```

#### D2 — Update Exercises Database
```
DIRECTIVE: UPDATE EXERCISES
Location: public/exercises_db.json

Change:
- "Add [X] new exercises: [LIST with muscle group, equipment, difficulty]"
- "Modify exercise [NAME]: [CHANGES]"
- "Add new muscle group category: [NAME]"
- "Add new equipment type: [NAME]"
```

#### D3 — Update Testimonials
```
DIRECTIVE: UPDATE TESTIMONIALS
Location: LandingPage.tsx testimonials array

Change:
- "Replace all testimonials with: [LIST of {name, role, location, quote, rating}]"
- "Add [X] more testimonials"
- "Remove testimonial from [NAME]"
```

---

### SECTION E: PERFORMANCE/SEO CHANGES

#### E1 — Performance Optimization
```
DIRECTIVE: OPTIMIZE PERFORMANCE

Actions needed:
- "Add lazy loading for below-fold sections"
- "Optimize image sizes: compress [LIST] to under [X]KB"
- "Add code splitting for portal pages"
- "Add preload for critical assets"
- "Implement virtual scrolling for long lists"
- "Add service worker for offline support"
```

#### E2 — SEO Improvements
```
DIRECTIVE: IMPROVE SEO
Location: index.html, add meta tags, structured data

Changes:
- "Update title tag to: [NEW TITLE]"
- "Update meta description to: [NEW DESCRIPTION]"
- "Add Open Graph tags for social sharing"
- "Add Twitter Card meta tags"
- "Add structured data (JSON-LD) for: [SoftwareApplication/Organization/etc]"
- "Add canonical URL"
- "Generate sitemap.xml"
```

---

# PART 3: WEBSITE AUDIT & IMPROVEMENT RECOMMENDATIONS

## Current Website Analysis

### What's Working Well
1. **Strong Visual Identity** — The dark theme with cyan accents creates a premium, tech-forward feel appropriate for a modern fitness platform
2. **Clear Value Proposition** — "Operating System for Modern Personal Training" immediately communicates positioning
3. **Social Proof Elements** — Stats (500+ coaches, 50K workouts, 99.9% uptime) build credibility
4. **AI Differentiation** — The AI assistant feature sets AzFIT apart from generic fitness apps
5. **Comprehensive Feature Set** — 6 core features cover the full coaching workflow
6. **Regional Targeting** — Testimonials from Hong Kong, Singapore, Seoul signal Asia-Pacific focus
7. **Complete Portal Architecture** — Well-structured pages for programs, exercises, clients, calendar, nutrition

### Critical Improvements Needed

#### HIGH PRIORITY

| # | Issue | Impact | Fix Directive |
|---|-------|--------|---------------|
| 1 | **Brand logos are placeholder names** — "FitPro Alliance, AthleteX" etc. appear to be fictional | Destroys credibility immediately | D1: Replace with real partner logos OR remove section until real partnerships exist |
| 2 | **No Instagram link in footer works** — Social icons present but likely not linked | Missed traffic, looks unprofessional | A8: Add actual Instagram URL: https://instagram.com/azfit |
| 3 | **No pricing page exists** — "Pricing" in nav leads nowhere | Users can't evaluate cost, major conversion blocker | B?: Create PricingPage.tsx with 3-tier structure |
| 4 | **"Watch Demo" button likely non-functional** — No video modal or demo page | Lost engagement opportunity | A1: Add YouTube embed modal OR link to /demo with screen recording |
| 5 | **Testimonials appear fabricated** — Generic names with no photos or verifiable identities | Reduces trust if users research | A6: Add real coach photos, LinkedIn profiles, or video testimonials |
| 6 | **Footer links (Blog, Community, Careers) go nowhere** — Navigation to empty pages | Frustrating user experience | Decision: Either create pages OR remove links until content exists |
| 7 | **No favicon visible** — Browser tab shows default or missing icon | Unpolished appearance | Add favicon.ico to public/ folder |

#### MEDIUM PRIORITY

| # | Issue | Impact | Fix Directive |
|---|-------|--------|---------------|
| 8 | **Scroll animations may be too subtle** — Features grid appears dark/static | Users might miss content as they scroll | C3: Increase reveal animation visibility, add subtle glow |
| 9 | **No FAQ section** — Common objections unanswered | Lost conversions from unanswered questions | A?: Add FAQSection with 8-10 common coach questions |
| 10 | **No comparison table** — How is AzFIT vs. Excel, TrueCoach, Trainerize? | Hard to justify switching | A?: Add comparison section: AzFIT vs. alternatives |
| 11 | **Missing cookie consent banner** — GDPR/compliance requirement for HK/EU users | Legal risk | Add CookieConsent component |
| 12 | **No email capture before trial** — Can't nurture leads who aren't ready to sign up | Lost leads | A7: Add email newsletter capture to CTA section |
| 13 | **GitHub repo has 0 stars, 0 forks** — Signals low adoption | Social proof concern | Build community, add README badges, share on dev platforms |
| 14 | **No mobile app download CTAs** — "App Store / Google Play" buttons missing | Missed mobile-native coaches | A8: Add "Get the App" section or footer badges (if apps exist) |

#### LOW PRIORITY

| # | Issue | Impact | Fix Directive |
|---|-------|--------|---------------|
| 15 | **Add schema.org structured data** — Rich snippets in search results | SEO improvement | E2: Add SoftwareApplication JSON-LD |
| 16 | **Missing alt text on decorative images** — Accessibility concern | WCAG compliance | Add descriptive alt attributes |
| 17 | **No 404 page** — Broken links show default browser error | User experience | Create NotFoundPage.tsx with redirect CTA |
| 18 | **Add loading skeleton screens** — Perceived performance improvement | Better UX during data load | Add Skeleton components from shadcn/ui |

---

# PART 4: INSTAGRAM STORY STRATEGY FOR AZFIT

## Current State Assessment

**Finding:** AzFIT does not appear to have an active Instagram presence. No Instagram account found in search (@azfit is likely taken by other brands). This is a **critical gap** for a fitness tech company targeting coaches.

## Instagram Account Setup (Priority 1)

### Account Configuration
```
Username options (check availability):
- @azfitapp
- @azfit_coach
- @azfithq
- @azfit.io
- @azfit_technology

Profile Setup:
- Category: Software Company / Product/Service
- Name: AzFIT — Coach OS
- Bio formula: "AI-powered platform for elite coaches. Program. Track. Transform. Start your 14-day trial. Made in Hong Kong."
- Link: https://azfit.github.io/azfit-client-portal (or Linktree if multiple links needed)
- Contact: Add email button
- Highlights: Create 4 initial highlight categories
```

### Instagram Highlights Strategy

**Must-Create Highlights (4 permanent story collections):**

1. **"Product"** — Screen recordings of AzFIT features (15-30 sec each)
   - AI program builder demo
   - Dashboard walkthrough
   - Client tracking features
   - Exercise library showcase

2. **"Coaches"** — Testimonials, coach spotlights, transformation stories
   - Quote graphics from testimonials
   - Coach "day in the life" takeovers
   - Before/after client results

3. **"Tips"** — Educational content (builds authority, not promotional)
   - Quick coaching tips (30-60 sec Reels format)
   - Exercise form breakdowns
   - Program design principles
   - Nutrition myths debunked

4. **"About"** — Brand story, team, mission
   - Why AzFIT was built
   - Behind-the-scenes development
   - Team introductions
   - Hong Kong fitness culture

---

## Instagram Story Content Calendar (Weekly Template)

### Weekly Rhythm (7-Day Rotation)

| Day | Story Content | Format | Goal |
|-----|--------------|--------|------|
| **Monday** | "Feature Focus" — Demo one AzFIT feature | Screen recording + text overlays | Product awareness |
| **Tuesday** | "Coach Tip Tuesday" — Educational fitness tip | Carousel or 15-sec video clip | Authority building |
| **Wednesday** | "Behind the Code" — Development update or team moment | Photo/video from office | Humanize the brand |
| **Thursday** | "Testimonial Thursday" — Coach success story | Quote graphic or video testimonial | Social proof |
| **Friday** | "Fitness Friday" — Workout content or exercise demo | Reel-style 30-sec video | Broader reach |
| **Saturday** | "Community" — Reshare coach content, answer DMs | Repost UGC, Q&A sticker | Engagement |
| **Sunday** | "Week Ahead" — Preview of platform updates | Teaser graphic or poll | Anticipation building |

---

## 20 Instagram Story Ideas Specifically for AzFIT

### Product-Focused Stories (Drive Trial Signups)
1. **"3-Second Program Builder"** — Time-lapse screen recording showing AI generating a complete program in seconds
2. **"Dashboard Walkthrough"** — Tap-through series showing each dashboard widget with "Link" sticker to trial
3. **"Before vs. After AzFIT"** — Split screen: coach's old Excel spreadsheet → AzFIT interface
4. **"Hidden Features"** — Reveal lesser-known features (keyboard shortcuts, drag-and-drop AI)
5. **"New Feature Drop"** — Countdown sticker leading to feature announcement

### Educational Stories (Build Authority)
6. **"Exercise Form Check"** — 15-sec clip: common mistake → correct form using AzFIT exercise library
7. **"Program Design Tip"** — Carousel: 5 slides explaining periodization principles
8. **"Myth Buster Monday"** — "Sweating doesn't mean fat loss" with science-backed explanation
9. **"Macro Math in 30 Sec"** — Quick TDEE calculation demo using AzFIT nutrition tool
10. **"Recovery Science"** — Explain HRV, readiness scores using AzFIT wearable sync visuals

### Social Proof Stories (Build Trust)
11. **"Coach Spotlight"** — Interview format with coach using AzFIT, show their actual dashboard
12. **"Transformation Tuesday"** — Client progress photos (with permission) showing measurable results
13. **"Why I Switched"** — Poll: "What did you use before AzFIT?" Excel / Pen & Paper / Other App
14. **"Results Roundup"** — Monthly stats: "AzFIT coaches delivered X workouts this month"
15. **"Location Check"** — "Coaches in 12 countries use AzFIT" with map graphic

### Engagement Stories (Build Community)
16. **"This or That" Poll** — "Superset or straight sets?" "Morning or evening clients?"
17. **"Ask Me Anything"** — Q&A sticker about coaching, program design, or AzFIT
18. **"Quiz Sticker"** — "How many exercises are in AzFIT's library?" A) 50 B) 255 C) 500
19. **"Slider Emoji"** — "How challenging was this week's programming?" 😴 to 🔥
20. **"Countdown to Free Trial"** — Countdown sticker + "Swipe up to start your 14-day trial"

---

## Instagram Reels Strategy (Priority 2)

Reels drive discovery — they reach non-followers. AzFIT needs a Reels strategy.

### Reels Content Types (3-5 per week)

**Type 1: Quick Tutorial Reels (60-90 sec)**
- "How I build a 12-week program in 60 seconds using AI"
- "Setting up your first client in AzFIT"
- "3 features that changed how I coach"
- Format: Screen recording + trending audio + text overlays

**Type 2: Trending Audio Reels (15-30 sec)**
- Adapt fitness/coaching content to trending sounds
- Example: "POV: You finally ditched Excel for AzFIT" [trending transition audio]
- Jump on trends quickly (within 3-5 days of trending)

**Type 3: Educational Reels (30-60 sec)**
- "Stop programming like this → Start programming like this"
- "The #1 mistake new coaches make with periodization"
- "Why your clients aren't progressing (and how to fix it)"

**Type 4: Transformation Reels (30-45 sec)**
- Coach's setup before AzFIT → after AzFIT
- Client results timeline using AzFIT progress tracking
- "Day in the life of a coach using AzFIT"

### Reels Best Practices
- Hook in first 1-2 seconds (text overlay: "This changed everything...")
- Use captions/subtitles (80% watch without sound)
- End with CTA: "Follow for more coach tips" or "Link in bio for 14-day trial"
- Post at optimal times: 7-9 AM or 6-8 PM in target timezone (HKT/SGT)
- Use 5-8 relevant hashtags (mix of broad: #personaltrainer #fitnessapp and niche: #coachingsoftware #fitnesstech)

---

## Instagram Bio Optimization

### Current Recommended Bio Structure
```
AzFIT — Coach OS 🤖
AI-powered platform for elite fitness coaches
Program smarter. Track better. Transform clients.
Start your free 14-day trial ⬇️
[Link sticker] | Made in Hong Kong 🇭🇰
```

### Bio Elements Checklist
- [ ] Clear value proposition (what AzFIT does, who it's for)
- [ ] Social proof element (500+ coaches, 50K workouts)
- [ ] Clear CTA ("Start free trial")
- [ ] Location badge (Hong Kong — signals credibility)
- [ ] Link in bio (to landing page OR Linktree with multiple options)
- [ ] Contact button enabled
- [ ] Category set to "Software Company"

---

## Instagram Content Production Workflow

### Weekly Content Creation (3-4 hours total)

**Batch Create on Sundays:**
1. **Screen recordings (30 min)** — Record 5-7 AzFIT feature demos using screen capture
2. **Design quote graphics (30 min)** — Use Canva with AzFIT brand kit (dark bg, cyan accents, clean fonts)
3. **Film Reels (60 min)** — Batch film 3-5 talking-head or screen recording Reels
4. **Write captions (30 min)** — Write 7 sets of story captions with CTAs
5. **Schedule (30 min)** — Use Meta Business Suite (free) to schedule feed posts; Stories must be posted manually

### Tools Needed
- **Canva Pro** — Branded templates for Stories, quote graphics, highlight covers ($12.99/mo)
- **CapCut** — Free video editing for Reels (text overlays, transitions, captions)
- **OBS or Loom** — Free screen recording for product demos
- **Meta Business Suite** — Free scheduling and analytics

---

## Instagram Growth Strategy: First 90 Days

### Month 1: Foundation (0 → 500 followers)
- Post 1 feed post every 2 days (15 total)
- Post 3-5 Stories daily
- Engage with 50 fitness coach accounts daily (comment, like, follow)
- Use 10-15 targeted hashtags per post
- Run 1 giveaway: "Win 3 months free AzFIT — tag a coach who needs this"

### Month 2: Content Acceleration (500 → 1,500 followers)
- Increase to 1 feed post daily
- Post 1 Reel daily (prioritize Reels for discovery)
- Start "Coach Spotlight" weekly series
- Collaborate with 2-3 micro-influencer coaches for Story takeovers
- Launch Instagram-exclusive offer: "14 days + bonus program template"

### Month 3: Conversion Focus (1,500 → 3,000+ followers)
- Add shoppable/clickable links in Stories (need 10K followers OR verified)
- Start weekly Instagram Live: "Coach Q&A with AzFIT team"
- Launch user-generated content campaign: #MyAzFIT tagging coaches
- Retarget website visitors with Instagram ads ($5-10/day test budget)
- Track: profile visits → link clicks → trial signups

### Key Metrics to Track Weekly
| Metric | Target | Tool |
|--------|--------|------|
| Follower growth | +10-15% weekly | Instagram Insights |
| Story completion rate | >70% | Instagram Insights |
| Reel reach | 3-5x follower count | Instagram Insights |
| Profile visits | Growing weekly | Instagram Insights |
| Link clicks | >5% of profile visits | Bitly/UTM tracking |
| Trial signups from IG | Trackable via UTM | Google Analytics |

---

## Instagram Ads Strategy (When Ready)

### Target Audience Definition
```
Audience 1: Fitness Coaches
- Location: Hong Kong, Singapore, Malaysia, Thailand, Australia
- Age: 25-45
- Interests: Personal training, strength coaching, fitness technology
- Behaviors: Small business owners, engaged shoppers

Audience 2: Gym Owners
- Location: Asia-Pacific
- Age: 30-50
- Interests: Gym management, fitness business, member retention
```

### Ad Creative Types
1. **Video ad (15-30 sec)** — Screen recording of AzFIT program builder + CTA
2. **Carousel ad** — 5 cards: Problem → Solution → Features → Social Proof → CTA
3. **Image ad** — Clean dark-themed graphic with strong headline

### Budget Recommendation
- Test phase: $10/day for 14 days
- Scale phase: $30-50/day based on CPA (target: under $50 per trial signup)

---

## Content Pillars Summary

| Pillar | % of Content | Purpose | Example |
|--------|-------------|---------|---------|
| **Product Education** | 30% | Show how AzFIT works | Screen recordings, feature demos |
| **Coach Education** | 25% | Build authority | Training tips, program design advice |
| **Social Proof** | 20% | Build trust | Testimonials, results, coach spotlights |
| **Community** | 15% | Humanize brand | Behind-the-scenes, polls, Q&A |
| **Promotion** | 10% | Drive signups | Trial offers, feature announcements |

---

# PART 5: TECHNICAL ARCHITECTURE SUMMARY (For Your Reference)

## File Structure
```
azfit-client-portal/
├── public/
│   ├── programs_db.json          (84 built-in programs)
│   ├── exercises_db.json         (255 exercises)
│   └── logos/                    (brand logos)
├── src/
│   ├── App.tsx                   (Main router)
│   ├── main.tsx                  (Entry point)
│   ├── store.ts                  (Zustand auth state)
│   ├── pages/                    (All page components)
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProgramsPage.tsx
│   │   ├── AllInOneProgramPage.tsx
│   │   ├── ProgramBuilderPage.tsx
│   │   ├── ExerciseLibraryPage.tsx
│   │   ├── ClientProfilePage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── NutritionPage.tsx
│   │   ├── PhotosPage.tsx
│   │   └── SettingsPage.tsx
│   ├── components/
│   │   ├── Layout.tsx            (Sidebar + topbar + AI chat)
│   │   ├── Navbar.tsx
│   │   ├── AiChat.tsx            (Floating AI assistant)
│   │   └── ui/                   (40+ shadcn/ui components)
│   ├── types/                    (TypeScript types)
│   └── hooks/                    (Custom React hooks)
├── temp/                         (CSV source files)
├── dist/                         (Build output)
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Routing Map
| Route | Page | Auth Required |
|-------|------|---------------|
| / | LandingPage | No |
| /login | LoginPage | No |
| /register | RegisterPage | No |
| /programs | ProgramsPage | Yes |
| /programs/create | AllInOneProgramPage | Yes |
| /programs/session/:id | ProgramBuilderPage | Yes |
| /exercises | ExerciseLibraryPage | Yes |
| /client | ClientProfilePage | Yes |
| /chat | AIChat | Yes |
| (implied) /dashboard | DashboardPage | Yes |
| (implied) /calendar | CalendarPage | Yes |
| (implied) /nutrition | NutritionPage | Yes |
| (implied) /photos | PhotosPage | Yes |
| (implied) /settings | SettingsPage | Yes |

## Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0.0 | UI framework |
| typescript | ~5.9.0 | Type safety |
| vite | ^7.2.0 | Build tool |
| tailwindcss | ^3.4.0 | Styling |
| framer-motion | ^12.0.0 | Animations |
| recharts | ^2.15.0 | Charts |
| zustand | ^5.0.0 | State management |
| lucide-react | latest | Icons |
| shadcn/ui | latest | UI components |

---

# APPENDIX: Quick Command Reference

## Common Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev          # Opens http://localhost:5173

# Build for production
npm run build        # Output to dist/

# Deploy to GitHub Pages
npm run deploy       # Deploys dist/ folder

# Generate programs database
node temp/generate_programs.cjs
```

## Demo Login Credentials
```
Email: trainer@azfit.com
Password: password
```

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Next Review:** When major website changes are deployed

---

## How to Use This Document

1. **For AI Prompt:** Copy Part 1 in its entirety and paste into AI Kimi Code. This gives complete context.

2. **For Changes:** Find the relevant section in Part 2, copy the directive template, fill in your specific changes, and send to AI Kimi Code.

3. **For Instagram:** Follow Part 4 sequentially — start with account setup, then implement the content calendar.

4. **For Monitoring:** Use Part 3's audit table to track what needs fixing. Update status as items are completed.
