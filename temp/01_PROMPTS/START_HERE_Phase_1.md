# PHASE 1 — CORE INFRASTRUCTURE
## SEND THIS FIRST TO KIMI CODE
## Copy everything below this line (including the triple backticks content)

Build the foundation of AzFIT — an AI-powered personal training platform for professional fitness coaches. Tech stack: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Framer Motion + localStorage persistence. Deploy to GitHub Pages.

Colors: bg #0B1120, cards #151D2E, borders #2A3A50, text #F1F5F9 primary / #94A3B8 secondary, accent #00AEEF cyan.

---

## STEP 1: AUTHENTICATION (Coach Signup/Login)

Create pages:
- /signup — Coach registration
- /login — Coach login
- Landing page at / with links to both

Signup fields (all required unless marked optional):
- Full Name * (min 2 chars)
- Email * (valid email)
- Password * (min 8 chars, 1 uppercase, 1 number)
- Confirm Password * (must match)
- Business/Studio Name (optional)
- Specialty (optional dropdown: Strength, Hypertrophy, Fat Loss, Athletic, Rehab, General)
- Years of Experience (optional, number 0-50)

Storage: localStorage key "azfit-coaches" = array of coach objects.

Coach object schema:
```javascript
{
  id: "coach_" + Date.now(),
  fullName: string,
  email: string,
  passwordHash: string, // use btoa(password) for hashing
  businessName: string,
  specialty: string,
  yearsExperience: number,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  settings: { theme: "dark", unitSystem: "metric", defaultSessionDuration: 60 }
}
```

Auth: Store "azfit-auth-token" in localStorage = coach ID. Auto-login if valid. Logout clears token.

Login: Validate email + password against coaches array. Set token on success.

NO demo credentials. NO fake data. System starts completely empty.

---

## STEP 2: LAYOUT & NAVIGATION

Protected layout (after login):
- Top bar: AzFIT cyan "A" logo + coach name + logout button
- Sidebar (collapsible on mobile, hamburger menu < 768px):
  - Dashboard
  - Clients
  - Programs
  - Exercise Library
  - Calendar (placeholder — just text "Coming in Phase 4")
  - Settings
- Main content area (scrollable)
- FAB (Floating Action Button): Fixed bottom-right, 56px cyan circle, white + icon, pulse glow animation. On click: opens "Add New Client" form.

All pages use dark theme. No light mode needed for Phase 1.

---

## STEP 3: EMPTY DASHBOARD

When a coach has ZERO clients:
- Centered illustration (simple SVG: person with clipboard)
- Heading: "Welcome to AzFIT, [Coach Name]!"
- Subtext: "Start by adding your first client. Track their progress, build programs, and transform results."
- Two buttons:
  - "+ Add New Client" (cyan filled button)
  - "Learn How It Works" (outline button, shows a tooltip/modal with brief explanation)
- Hide all stat cards and data tables.

---

## STEP 4: DASHBOARD WITH CLIENTS

When clients exist, show:

**Metric Cards Row** (4-column grid desktop, 2-column tablet, 2-column mobile):
1. Total Clients — count of all clients
2. Active Clients — count where status === "active"
3. New This Week — count created within last 7 days
4. Sessions This Week — placeholder "0" (functionality in Phase 4)

Each card: #151D2E bg, 1px #2A3A50 border, 12px radius, 16px padding. Hover: lift effect.

Layout for cards: Mobile MUST be 2 columns (grid-cols-2). Desktop 4 columns (lg:grid-cols-4).

**Client List** below the cards:
- Card per client or table row
- Avatar: circle with initials (e.g., "JD" for John Doe), cyan bg
- Name, age, gender, goal
- Status badge: Active (#22C55E green), Paused (#F59E0B amber), Archived (#64748B gray)
- "View Profile" button
- Search bar above list: filters clients by name in real-time

Client storage: localStorage key "azfit-clients" = array.

Client schema (Phase 1 — basic):
```javascript
{
  id: "client_" + Date.now(),
  coachId: string, // ID of the coach who created this client
  personal: {
    fullName: string,
    email: string,
    phone: string,
    dateOfBirth: string, // YYYY-MM-DD
    gender: "male" | "female" | "other",
    age: number // auto-calculated from DOB
  },
  goals: {
    primary: string,
    experienceLevel: string,
    sessionsPerWeek: number,
    sessionDuration: number
  },
  status: "active" | "paused" | "archived",
  createdAt: string, // ISO
  updatedAt: string  // ISO
}
```

---

## STEP 5: "+ ADD NEW CLIENT" FORM

Triggered by: FAB button click OR sidebar "Clients" page > "Add New Client" button.

Single-page form (Phase 1 — keep it simple, no wizard yet):

Fields:
- Full Name * (text input)
- Email (email input)
- Phone (tel input)
- Date of Birth * (date picker, type="date")
- Gender * (3 radio buttons: Male / Female / Other — styled as selectable cards)
- Primary Goal * (select dropdown: Lose Weight / Build Muscle / Strength / Endurance / Athletic Performance / Rehab & Mobility / General Fitness)
- Experience Level * (3 radio cards: Beginner / Intermediate / Advanced — Beginner=green, Intermediate=yellow, Advanced=red)
- Sessions Per Week * (select: 2 / 3 / 4 / 5 / 6)
- Session Duration * (select: 30 / 45 / 60 / 90 minutes)
- Available Equipment * (multi-select checkboxes: Full Gym / Dumbbells Only / Bodyweight / Home Gym / Commercial Gym)
- Emergency Contact Name (text)
- Emergency Contact Phone (tel)

Age auto-calculation: When date of birth is entered, calculate age: `Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000)`

On submit:
- Validate required fields
- Create client object with all fields + calculated age
- Push to "azfit-clients" array in localStorage
- Show success toast: "[Name] has been added as a new client."
- Redirect to client profile page (or dashboard if profile page doesn't exist yet)

---

## DELIVERABLE — TEST CHECKLIST

After Phase 1 is built, I should be able to:

1. [ ] Open the app and see a landing page with Login and Signup buttons
2. [ ] Sign up as a new coach with all fields
3. [ ] Log in and see empty dashboard with "Welcome to AzFIT!" and "Add first client" prompt
4. [ ] Click the cyan FAB (+ button) and open the Add New Client form
5. [ ] Fill out the form and submit
6. [ ] See the client appear in the dashboard
7. [ ] See the metric cards update (Total Clients: 1, Active: 1, New This Week: 1)
8. [ ] Log out and log back in — still see my client data
9. [ ] Add 3+ more clients and see them in the list
10. [ ] Use the search bar to filter clients by name
11. [ ] View the sidebar navigation on desktop
12. [ ] Collapse/expand the sidebar (or see hamburger menu on mobile)

Do NOT build: TDEE calculator, BioPrint, Program Wizard, Exercise Library, detailed profile pages, complex animations, conic-gradient rings. Keep Phase 1 functional and clean.
