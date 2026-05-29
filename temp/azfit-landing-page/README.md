# AzFIT Landing Page

A standalone landing page with the animated AI Dashboard Orb, dark theme, and all sections.

## Key Files

### The Orb (Hero Section)
**File:** `src/pages/Home.tsx` — Lines 202-365 (`HeroSection` component, Right Panel)

The orb is a pure CSS/React creation — no Three.js needed. It consists of:

1. **Outer glow** — `animate-orb-breathe` pulsing radial gradient with blur
2. **Pulse wave rings** — 3 concentric rings with `animate-pulse-ring` (3s staggered delays)
3. **Main orb container** — `animate-orb-breathe`, glass-like radial gradient with border glow
4. **Wireframe rings** — 3 rotating rings at 15%/25%/35% inset with `animate-rotate-wireframe` (10s/15s/20s)
5. **Cross hairs** — Vertical + horizontal lines through center
6. **AzFIT Logo** — `AzFIT_LOGO_Transparent.png` at 85% size, centered with drop-shadow glow
7. **Inner glowing core** — 30% size radial gradient blur
8. **Glowing hotspots** — 3 animated dots at different positions with staggered delays
9. **Orbiting dots** — 2 dots on slow-spinning rings (30s / 20s reverse)

### Animations (defined in `tailwind.config.js`)

| Animation | Keyframes | Duration |
|-----------|-----------|----------|
| `orb-breathe` | scale 1 -> 1.06, glow intensifies | 4s ease-in-out infinite |
| `spin-slow` | rotate 0 -> 360deg | 30s linear infinite |
| `pulse-ring` | scale 1 -> 2.5, opacity 0.3 -> 0 | 3s ease-out infinite |
| `rotate-wireframe` | rotateY(0) -> rotateY(360) + rotateX(10deg) | 20s linear infinite |

### Logo Images Used

| File | Usage |
|------|-------|
| `public/AzFIT_LOGO_Transparent.png` | Inside the orb (Hero right panel) |
| `public/AzFIT_Logo_WhiteBackground_Text.png` | Navbar logo |
| `public/noise.png` | Noise texture overlay |
| `public/hero-bg.jpg` | Hero background |
| `public/avatar-1/2/3.jpg` | Testimonial avatars |

### Sections (in order)

1. **HeroSection** — AZFIT headline + animated orb
2. **TrustedBySection** — Brand logo row
3. **AIShowcaseSection** — AI feature showcase with breathing orb + rotating skill icons
4. **DashboardExperienceSection** — Scrolling data stream + dashboard mockup
5. **FeatureGridSection** — 6 feature cards (AI Programming, BioPrint, Nutrition, Clients, Calendar, Analytics)
6. **TestimonialsSection** — 3 coach testimonials
7. **CTASection** — Final call-to-action

## Quick Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The build output goes to `dist/` — copy those files to any static host (GitHub Pages, Netlify, Vercel, etc.).
