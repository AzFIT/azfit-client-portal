# AzFIT Dashboard Cards — Responsive Layout Specification
## Send this exact block to Kimi Code for pixel-perfect responsive behavior

---

## THE GRID SYSTEM

Use CSS Grid with a SINGLE rule that handles all breakpoints automatically:

```css
.metric-cards-grid {
  display: grid;
  /* Auto-fits cards: min 280px wide, max 1fr (fills space) */
  /* On wide screens = 2 columns, on narrow = 1 column */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;           /* 16px gap mobile */
  padding: 16px;       /* page padding mobile */
  max-width: 1200px;   /* cap width on huge screens */
  margin: 0 auto;      /* center the grid */
}

/* Tablet: slightly more breathing room */
@media (min-width: 768px) {
  .metric-cards-grid {
    gap: 20px;
    padding: 24px;
  }
}

/* Desktop: max gap for the 2x2 look */
@media (min-width: 1024px) {
  .metric-cards-grid {
    grid-template-columns: repeat(2, 1fr); /* Force exactly 2 columns */
    gap: 24px;
    padding: 32px;
  }
}
```

**Why this works:** The `auto-fit` + `minmax(280px, 1fr)` combo is the magic formula. When the screen is narrower than ~590px (280px × 2 + 16px gap), it automatically drops to 1 column. No media query needed for mobile — it's handled by math.

---

## HOW IT LOOKS ON EACH SCREEN SIZE

### Mobile (< 590px): Single Column Stack
```
+------------------+
|   [SESSIONS]     |  ← full width, 16px padding
|      70%         |
|  14/20  +4       |
+------------------+
|  [ACTIVE CLIENTS]|
|       24         |
| 18  4  2         |
+------------------+
|  [ADHERENCE]     |
|      87%         |
|  +5%             |
+------------------+
|  [REVENUE]       |
|    $3,240        |
|  +12             |
+------------------+
```

**Mobile adjustments:**
- Ring chart: shrinks from 80px to **64px**
- Value text: shrinks from 24px to **20px**
- Card padding: shrinks from 24px to **16px**
- Gap between cards: **16px**
- Sparkline: hidden on very small screens (< 400px), shown 50px wide above 400px
- Client segmented bar: pills stack vertically instead of inline
- Page padding: **16px** (no side margins, cards touch edges with padding)

---

### Tablet (590px – 1023px): 2 Columns
```
+----------+  +----------+
| SESSIONS |  |  CLIENTS |
|   70%    |  |    24    |
| 14/20 +4 |  | 18 4 2   |
+----------+  +----------+
+----------+  +----------+
|ADHERENCE |  | REVENUE  |
|   87%    |  | $3,240   |
|  +5%     |  |  +12     |
+----------+  +----------+
```

**Tablet adjustments:**
- Ring chart: **72px** (slightly smaller than desktop)
- Value text: **22px**
- Card padding: **20px**
- Gap: **20px**
- Page padding: **24px**
- Sparkline: 55px wide, shown

---

### Desktop (1024px+): 2 Columns, Full Size
```
+--------------+  +--------------+
|   SESSIONS   |  |ACTIVE CLIENTS|
|     70%      |  |      24      |
| 14/20  [+4]  |  | [18][4][2]  |
+--------------+  +--------------+
+--------------+  +--------------+
|  ADHERENCE   |  |   REVENUE    |
|     87%      |  |   $3,240     |
|    [+5%]     |  |    [+12]     |
+--------------+  +--------------+
```

**Desktop adjustments:**
- Ring chart: **80px** (full size)
- Value text: **24px bold**
- Card padding: **24px**
- Gap: **24px**
- Page padding: **32px**
- Sparkline: **60px** wide, shown
- Client segmented bar: pills inline (horizontal)

---

## THE CARD INTERNAL LAYOUT (Flexbox, Never Breaks)

Each card uses **flexbox** that adapts automatically — no fixed widths, no absolute positioning that can misalign:

```css
.metric-card {
  display: flex;
  align-items: center;      /* vertically center ring + text */
  gap: 16px;                /* space between ring and text column */
  padding: 16px;            /* mobile default */
  background: var(--azfit-bg-card, #151D2E);
  border: 1px solid var(--azfit-border-default, #2A3A50);
  border-radius: 12px;
}

@media (min-width: 768px) {
  .metric-card {
    gap: 20px;
    padding: 20px;
  }
}

@media (min-width: 1024px) {
  .metric-card {
    gap: 24px;
    padding: 24px;
  }
}

/* Left side: ring chart */
.metric-card-ring {
  flex-shrink: 0;           /* NEVER shrink the ring */
  width: 64px;              /* mobile */
  height: 64px;
}

@media (min-width: 768px) {
  .metric-card-ring {
    width: 72px;
    height: 72px;
  }
}

@media (min-width: 1024px) {
  .metric-card-ring {
    width: 80px;
    height: 80px;
  }
}

/* Right side: text content */
.metric-card-content {
  flex: 1;                  /* takes all remaining space */
  min-width: 0;             /* CRITICAL: prevents text overflow */
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Label */
.metric-card-label {
  font-size: 10px;          /* mobile */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--azfit-text-muted, #94A3B8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;  /* if label is too long, show ... */
}

@media (min-width: 768px) {
  .metric-card-label {
    font-size: 11px;
  }
}

/* Value row: number + badge side by side */
.metric-card-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;          /* badge wraps if not enough space */
}

.metric-card-value {
  font-size: 20px;          /* mobile */
  font-weight: 700;
  color: var(--azfit-text-primary, #F1F5F9);
  line-height: 1.2;
}

@media (min-width: 768px) {
  .metric-card-value {
    font-size: 22px;
  }
}

@media (min-width: 1024px) {
  .metric-card-value {
    font-size: 24px;
  }
}

/* Delta badge */
.metric-card-delta {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  flex-shrink: 0;           /* NEVER shrink the badge */
}

.metric-card-delta.positive {
  background: rgba(34, 197, 94, 0.15);
  color: #22C55E;
}

.metric-card-delta.negative {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}
```

---

## SPECIAL: ACTIVE CLIENTS SEGMENTED BAR (Responsive)

The green/yellow/red breakdown needs its own responsive behavior:

```css
.client-segments {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;          /* wrap on mobile if needed */
}

@media (max-width: 480px) {
  .client-segments {
    flex-direction: column; /* stack vertically on very small screens */
    gap: 4px;
  }
}

.client-segment {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 9999px;
  flex-shrink: 0;
}

.client-segment.engaged {
  background: rgba(34, 197, 94, 0.15);
  color: #22C55E;
}

.client-segment.moderate {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
}

.client-segment.atrisk {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}
```

---

## SPECIAL: REVENUE HIDE TOGGLE

```css
.metric-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.revenue-toggle {
  font-size: 14px;
  color: var(--azfit-text-muted, #94A3B8);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 150ms;
  flex-shrink: 0;
}

.revenue-toggle:hover {
  color: var(--azfit-text-primary, #F1F5F9);
}

.revenue-hidden {
  font-size: 24px;
  font-weight: 700;
  color: var(--azfit-text-primary, #F1F5F9);
  letter-spacing: 4px;
}
```

When toggled: replace "$3,240" with "••••" (same font size, wider letter-spacing so it doesn't jump width).

---

## SPARKLINE (Hidden on Tiny Screens)

```css
.metric-card-sparkline {
  width: 50px;              /* mobile */
  height: 18px;
  margin-top: 4px;
}

@media (min-width: 400px) {
  .metric-card-sparkline {
    width: 55px;
  }
}

@media (min-width: 768px) {
  .metric-card-sparkline {
    width: 60px;
    height: 20px;
  }
}

/* Hide sparkline on very small screens where it would crowd */
@media (max-width: 359px) {
  .metric-card-sparkline {
    display: none;
  }
}
```

---

## THE SVG RING CHART (Responsive, Never Distorts)

The ring is an inline SVG. Use `viewBox` so it scales perfectly at any size:

```html
<svg class="metric-card-ring" viewBox="0 0 80 80">
  <!-- Background track -->
  <circle cx="40" cy="40" r="34" fill="none" stroke="#2A3A50" stroke-width="8"/>
  <!-- Fill arc (use stroke-dasharray to control percentage) -->
  <circle 
    cx="40" cy="40" r="34" fill="none" 
    stroke="#00AEEF" stroke-width="8"
    stroke-linecap="round"
    stroke-dasharray="149.23 213.19"  <!-- 70% of circumference -->
    stroke-dashoffset="0"
    transform="rotate(-90 40 40)"
  />
  <!-- Center text -->
  <text x="40" y="40" text-anchor="middle" dominant-baseline="central"
    fill="#F1F5F9" font-size="18" font-weight="700" font-family="Inter, sans-serif">
    70%
  </text>
</svg>
```

**Critical:** The `viewBox="0 0 80 80"` means the SVG scales to whatever CSS width/height you set (64px, 72px, or 80px) while keeping proportions. The text inside also scales proportionally. **Never use fixed pixel widths on SVGs — always use CSS classes that change per breakpoint.**

**Circumference formula:** `2 × π × 34 ≈ 213.19`. For X% fill: `stroke-dasharray="(213.19 × X/100) 213.19"`

| Percentage | stroke-dasharray first value |
|------------|------------------------------|
| 70% | 149.23 |
| 81% | 172.68 |
| 87% | 185.48 |
| 100% | 213.19 |

---

## RING CENTER TEXT (Dynamic Content)

The ring center shows different content per card:
- Sessions: "70%"
- Clients: "24" (not a percentage, just the total count)
- Adherence: "87%"
- Revenue: "$3,240"

```html
<!-- For count-based (not percentage) -->
<text x="40" y="40" text-anchor="middle" dominant-baseline="central"
  fill="#F1F5F9" font-size="16" font-weight="700">
  24
</text>

<!-- For dollar amounts, use slightly smaller font -->
<text x="40" y="40" text-anchor="middle" dominant-baseline="central"
  fill="#F1F5F9" font-size="13" font-weight="700">
  $3,240
</text>
```

Font sizes inside SVG are in the SVG coordinate system (0-80), so they stay proportional when the SVG scales. `font-size="18"` at 80px SVG = looks like 18px. When SVG shrinks to 64px, text also shrinks proportionally.

---

## SAFETY RULES (Prevents Distortion)

1. **Never use `px` widths on the grid** — use `fr` units + `minmax()`
2. **Never use `position: absolute` inside cards** — use flexbox
3. **Never let text overflow** — `min-width: 0` on flex children + `text-overflow: ellipsis`
4. **Never hardcode mobile/desktop versions** — one HTML structure, CSS handles everything
5. **Never let the ring shrink below 48px** — `flex-shrink: 0` on the ring wrapper
6. **Test at these exact widths:** 320px, 375px, 414px, 768px, 1024px, 1440px

---

## COMPLETE HTML STRUCTURE (One Card Example)

```html
<div class="metric-cards-grid">

  <!-- CARD 1: Sessions -->
  <div class="metric-card">
    <svg class="metric-card-ring" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="34" fill="none" stroke="#2A3A50" stroke-width="8"/>
      <circle cx="40" cy="40" r="34" fill="none" stroke="#00AEEF" stroke-width="8"
        stroke-linecap="round" stroke-dasharray="149.23 213.19" stroke-dashoffset="0"
        transform="rotate(-90 40 40)"/>
      <text x="40" y="40" text-anchor="middle" dominant-baseline="central"
        fill="#F1F5F9" font-size="18" font-weight="700">70%</text>
    </svg>
    <div class="metric-card-content">
      <div class="metric-card-label">Sessions This Week</div>
      <div class="metric-card-value-row">
        <span class="metric-card-value">14/20 booked</span>
        <span class="metric-card-delta positive">+4</span>
      </div>
      <svg class="metric-card-sparkline" viewBox="0 0 60 20">
        <!-- sparkline path here -->
      </svg>
    </div>
  </div>

  <!-- CARD 2: Active Clients -->
  <div class="metric-card">
    <svg class="metric-card-ring" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="34" fill="none" stroke="#2A3A50" stroke-width="8"/>
      <circle cx="40" cy="40" r="34" fill="none" stroke="#00AEEF" stroke-width="8"
        stroke-linecap="round" stroke-dasharray="213.19 213.19" stroke-dashoffset="0"
        transform="rotate(-90 40 40)"/>
      <text x="40" y="40" text-anchor="middle" dominant-baseline="central"
        fill="#F1F5F9" font-size="16" font-weight="700">24</text>
    </svg>
    <div class="metric-card-content">
      <div class="metric-card-label">Active Clients</div>
      <div class="client-segments">
        <span class="client-segment engaged">18</span>
        <span class="client-segment moderate">4</span>
        <span class="client-segment atrisk">2</span>
      </div>
      <span class="metric-card-delta positive">+3</span>
    </div>
  </div>

  <!-- CARD 3: Adherence -->
  <div class="metric-card">
    <svg class="metric-card-ring" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="34" fill="none" stroke="#2A3A50" stroke-width="8"/>
      <circle cx="40" cy="40" r="34" fill="none" stroke="#00AEEF" stroke-width="8"
        stroke-linecap="round" stroke-dasharray="185.48 213.19" stroke-dashoffset="0"
        transform="rotate(-90 40 40)"/>
      <text x="40" y="40" text-anchor="middle" dominant-baseline="central"
        fill="#F1F5F9" font-size="18" font-weight="700">87%</text>
    </svg>
    <div class="metric-card-content">
      <div class="metric-card-label">Adherence Score</div>
      <div class="metric-card-value-row">
        <span class="metric-card-value">Avg compliance</span>
        <span class="metric-card-delta positive">+5%</span>
      </div>
    </div>
  </div>

  <!-- CARD 4: Revenue -->
  <div class="metric-card">
    <div style="position: relative; flex-shrink: 0;">
      <svg class="metric-card-ring" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="34" fill="none" stroke="#2A3A50" stroke-width="8"/>
        <circle cx="40" cy="40" r="34" fill="none" stroke="#00AEEF" stroke-width="8"
          stroke-linecap="round" stroke-dasharray="172.68 213.19" stroke-dashoffset="0"
          transform="rotate(-90 40 40)"/>
        <text x="40" y="40" text-anchor="middle" dominant-baseline="central"
          fill="#F1F5F9" font-size="13" font-weight="700">$3,240</text>
      </svg>
    </div>
    <div class="metric-card-content">
      <div class="metric-card-header">
        <div class="metric-card-label">Weekly Revenue</div>
        <button class="revenue-toggle" onclick="toggleRevenue(this)" title="Hide/Show">
          👁
        </button>
      </div>
      <div class="metric-card-value-row">
        <span class="metric-card-value" data-revenue="$3,240">$3,240</span>
        <span class="metric-card-delta positive">+12</span>
      </div>
    </div>
  </div>

</div>
```

---

## JAVASCRIPT (Revenue Toggle Only)

```javascript
function toggleRevenue(btn) {
  const card = btn.closest('.metric-card');
  const valueEl = card.querySelector('[data-revenue]');
  const isHidden = valueEl.classList.contains('revenue-hidden');
  
  if (isHidden) {
    valueEl.textContent = valueEl.dataset.revenue;
    valueEl.classList.remove('revenue-hidden');
    btn.textContent = '👁';
  } else {
    valueEl.textContent = '••••';
    valueEl.classList.add('revenue-hidden');
    btn.textContent = '👁‍🗨';
  }
}
```

---

## SUMMARY: What Changes Per Screen

| Property | Mobile (<590px) | Tablet (590-1023px) | Desktop (1024px+) |
|----------|----------------|---------------------|-------------------|
| Grid | 1 column | 2 columns (auto) | 2 columns (forced) |
| Ring size | 64px | 72px | 80px |
| Value font | 20px | 22px | 24px |
| Label font | 10px | 11px | 11px |
| Card padding | 16px | 20px | 24px |
| Gap | 16px | 20px | 24px |
| Page padding | 16px | 24px | 32px |
| Sparkline | 50px / hidden <360px | 55px | 60px |
| Client segments | vertical stack | horizontal | horizontal |

---

END OF SPEC — Paste this entire block into Kimi Code
