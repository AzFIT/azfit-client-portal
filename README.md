# AzFIT Client Portal

Elite training platform for fitness coaches. Deployed on GitHub Pages.

**Live Demo:** `https://YOUR_USERNAME.github.io/azfit-client-portal`

---

## Deploy to GitHub Pages — Step by Step

### Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `azfit-client-portal`
3. Set to **Public** (required for free GitHub Pages)
4. Click **"Create repository"**

### Step 2: Upload the Code

#### Option A — Git Command Line (Recommended)

```bash
# Extract the zip first, then cd into the folder
cd azfit-client-portal

# Initialize git
git init
git branch -M main

# Add all files
git add .
git commit -m "Initial commit - AzFIT Client Portal"

# Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/azfit-client-portal.git
git push -u origin main
```

#### Option B — GitHub Web Upload

1. On your new repo page, click **"uploading an existing file"**
2. Drag and drop ALL files from the extracted zip
3. Click **"Commit changes"**

### Step 3: Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** (tab at the top)
3. In the left sidebar, click **Pages**
4. Under **Source**, select **"Deploy from a branch"**
5. Select branch: **`main`**
6. Select folder: **`/ (root)`**
7. Click **Save**
8. Wait 1-2 minutes for the site to build

### Step 4: Deploy Updates (After Any Code Change)

```bash
# After making code changes:
npm run build    # Build the production bundle
npm run deploy   # Deploy dist/ folder to GitHub Pages
```

The site will be live at:
```
https://YOUR_USERNAME.github.io/azfit-client-portal
```

---

## Local Development

### Prerequisites
- Node.js 20+ and npm

### Install & Run
```bash
npm install
npm run dev
```
Open `http://localhost:5173`

### Demo Login
- Email: `trainer@azfit.com`
- Password: `password`
- Or click **Demo Mode**

---

## Project Structure

```
src/
  App.tsx              — Main routes
  store.ts             — Auth state
  main.tsx             — Entry point (uses HashRouter for GitHub Pages)
  pages/               — All page components
    LandingPage.tsx
    LoginPage.tsx
    DashboardPage.tsx
    CalendarPage.tsx
    ProgramsPage.tsx
    AllInOneProgramPage.tsx  — NEW: Full program creator
    ClientProfilePage.tsx
    NutritionPage.tsx
    PhotosPage.tsx
    SettingsPage.tsx
  components/
    Layout.tsx         — Sidebar + top bar + AI chat
    Navbar.tsx         — Landing page nav
    AiChat.tsx         — Floating AI assistant
    ui/                — 40+ shadcn/ui components
  types/
  hooks/
public/                — Static assets (logos, images)
```

## Tech Stack

| Tech | Version |
|------|---------|
| React | 19 |
| TypeScript | 5.9 |
| Vite | 7.2 |
| Tailwind CSS | 3.4 |
| shadcn/ui | latest |
| Framer Motion | 12 |
| Recharts | 2.15 |
| Zustand | 5 |

## Why HashRouter?

GitHub Pages is **static hosting** — it can't handle client-side routing (React Router's BrowserHistory). `HashRouter` uses URL fragments (`/#/dashboard`) which work perfectly on any static host without server configuration.

## License

MIT
