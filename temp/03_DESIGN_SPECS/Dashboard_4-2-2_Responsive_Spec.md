# AzFIT Dashboard Cards — 4-2-2 Responsive Layout Spec
## Desktop: 4 columns | Tablet: 2 columns | Mobile: 2 columns

---

## LAYOUT OVERVIEW (3 Breakpoints)

```
DESKTOP (1024px+)          TABLET (590-1023px)        MOBILE (< 590px)
+----+----+----+----+      +----+----+                +----+----+
|S1  |S2  |AC  |R   |      |S1  |S2  |                |S1  |S2  |
|70% |87% |24  |$3k |      |70% |87% |                |70% |87% |
+----+----+----+----+      +----+----+                +----+----+
                           |AC  |R   |                |AC  |R   |
                           |24  |$3k |                |24  |$3k |
                           +----+----+                +----+----+
  Ring + text beside         Ring + text beside         Ring ABOVE text
  4 across                   2×2 grid                   2×2 grid, compact
```

**S1** = Sessions, **S2** = Adherence, **AC** = Active Clients, **R** = Revenue

---

## THE GRID CSS

```css
.metric-cards-grid {
  display: grid;
  /* MOBILE: 2 columns (default, no media query needed) */
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

/* TABLET: 2 columns (same as mobile but more breathing room) */
@media (min-width: 590px) {
  .metric-cards-grid {
    gap: 16px;
    padding: 20px;
  }
}

/* DESKTOP: 4 columns */
@media (min-width: 1024px) {
  .metric-cards-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 24px;
  }
}

/* WIDE DESKTOP: more padding */
@media (min-width: 1400px) {
  .metric-cards-grid {
    gap: 24px;
    padding: 32px;
  }
}
```

---

## CRITICAL: CARD INTERNAL LAYOUT CHANGES PER BREAKPOINT

The card layout is **NOT the same** across all breakpoints. On desktop the ring sits **beside** the text. On mobile the ring sits **above** the text because 170px is too narrow for side-by-side.

### DESKTOP (1024px+): Horizontal — Ring Left, Text Right

```
+----------------------------+
|  +----+                    |
|  |    |  SESSIONS THIS WEEK|
|  |70% |  14/20 booked  [+4]|
|  +----+                    |
+----------------------------+
Card width: ~282px (at 1200px container)
Ring: 64px
Text: ~180px available
```

```css
/* DESKTOP: horizontal layout */
@media (min-width: 1024px) {
  .metric-card {
    display: flex;
    flex-direction: row;      /* side by side */
    align-items: center;
    gap: 12px;
    padding: 16px;
  }
  
  .metric-card-ring {
    width: 64px;
    height: 64px;
    flex-shrink: 0;
  }
  
  .metric-card-content {
    flex: 1;
    min-width: 0;
  }
  
  .metric-card-label {
    font-size: 10px;
  }
  
  .metric-card-value {
    font-size: 18px;
  }
}
```

---

### TABLET (590-1023px): Horizontal — Ring Left, Text Right

```
+----------------------+
|  +----+              |
|  |    |  SESSIONS    |
|  |70% |  14/20  [+4] |
|  +----+              |
+----------------------+
Card width: ~370px (at 768px - gaps)
Ring: 72px
Text: ~270px available — comfortable
```

```css
/* TABLET: horizontal layout, more space than desktop */
@media (min-width: 590px) and (max-width: 1023px) {
  .metric-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    padding: 18px;
  }
  
  .metric-card-ring {
    width: 72px;
    height: 72px;
    flex-shrink: 0;
  }
  
  .metric-card-content {
    flex: 1;
    min-width: 0;
  }
  
  .metric-card-label {
    font-size: 11px;
  }
  
  .metric-card-value {
    font-size: 20px;
  }
}
```

---

### MOBILE (< 590px): Vertical — Ring Top, Text Bottom

This is the critical change. At ~170px per card, side-by-side doesn't work.

```
+-----------+
|    70%    |
|   (ring)  |
| SESSIONS  |
| 14/20 [+4]|
+-----------+
Card width: ~170px (at 375px phone)
Ring: 56px (centered)
Text: full width, centered
```

```css
/* MOBILE: vertical layout — ring above text */
.metric-card {
  display: flex;
  flex-direction: column;     /* stacked vertically */
  align-items: center;        /* center everything */
  gap: 8px;
  padding: 12px;
  text-align: center;
}

.metric-card-ring {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.metric-card-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.metric-card-label {
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.metric-card-value {
  font-size: 16px;
}

/* Delta badge: smaller on mobile */
.metric-card-delta {
  font-size: 10px;
  padding: 1px 6px;
}
```

---

## COMPLETE CARD CSS (All Breakpoints)

```css
/* =============================================
   BASE CARD STYLES (Mobile First: < 590px)
   ============================================= */

.metric-card {
  background: #151D2E;
  border: 1px solid #2A3A50;
  border-radius: 12px;
  /* MOBILE: vertical stack */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  text-align: center;
  transition: box-shadow 200ms, transform 200ms;
}

.metric-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  transform: translateY(-2px);
}

/* Ring chart */
.metric-card-ring {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

/* Content area */
.metric-card-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

/* Label */
.metric-card-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94A3B8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Value + badge row */
.metric-card-value-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* Value number */
.metric-card-value {
  font-size: 16px;
  font-weight: 700;
  color: #F1F5F9;
  line-height: 1.2;
}

/* Delta badge */
.metric-card-delta {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 9999px;
  flex-shrink: 0;
}

.metric-card-delta.positive {
  background: rgba(34, 197, 94, 0.15);
  color: #22C55E;
}

.metric-card-delta.negative {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}

/* =============================================
   TABLET (590px - 1023px): Horizontal
   ============================================= */

@media (min-width: 590px) {
  .metric-card {
    flex-direction: row;          /* side by side */
    align-items: center;
    text-align: left;
    gap: 14px;
    padding: 18px;
  }
  
  .metric-card-ring {
    width: 72px;
    height: 72px;
  }
  
  .metric-card-content {
    align-items: flex-start;      /* left-align text */
    flex: 1;
    min-width: 0;
  }
  
  .metric-card-label {
    font-size: 11px;
    letter-spacing: 0.05em;
  }
  
  .metric-card-value-row {
    justify-content: flex-start;
  }
  
  .metric-card-value {
    font-size: 20px;
  }
  
  .metric-card-delta {
    font-size: 11px;
    padding: 2px 8px;
  }
}

/* =============================================
   DESKTOP (1024px+): Horizontal, Compact
   ============================================= */

@media (min-width: 1024px) {
  .metric-card {
    gap: 12px;
    padding: 16px;
  }
  
  .metric-card-ring {
    width: 64px;
    height: 64px;
  }
  
  .metric-card-label {
    font-size: 10px;
  }
  
  .metric-card-value {
    font-size: 18px;
  }
}

/* =============================================
   WIDE DESKTOP (1400px+): Room to breathe
   ============================================= */

@media (min-width: 1400px) {
  .metric-card {
    gap: 14px;
    padding: 20px;
  }
  
  .metric-card-ring {
    width: 72px;
    height: 72px;
  }
  
  .metric-card-value {
    font-size: 20px;
  }
}
```

---

## THE SVG RING (Same Across All Sizes, CSS Controls Size)

```html
<svg class="metric-card-ring" viewBox="0 0 80 80">
  <!-- Background track -->
  <circle cx="40" cy="40" r="34" fill="none" stroke="#2A3A50" stroke-width="8"/>
  <!-- Fill arc (70% example) -->
  <circle cx="40" cy="40" r="34" fill="none" stroke="#00AEEF" stroke-width="8"
    stroke-linecap="round" stroke-dasharray="149.23 213.19" stroke-dashoffset="0"
    transform="rotate(-90 40 40)"/>
  <!-- Center text -->
  <text x="40" y="40" text-anchor="middle" dominant-baseline="central"
    fill="#F1F5F9" font-size="18" font-weight="700" font-family="Inter, sans-serif">
    70%
  </text>
</svg>
```

**The SVG `viewBox` makes it scale perfectly.** CSS sets the rendered size (56px, 64px, or 72px) and the SVG + text inside scale proportionally. Never distorts.

**Circumference:** `2 × π × 34 = 213.19`

| Card | Fill % | stroke-dasharray |
|------|--------|------------------|
| Sessions | 70% | `149.23 213.19` |
| Adherence | 87% | `185.48 213.19` |
| Revenue | 81% | `172.68 213.19` |
| Clients | 100% | `213.19 213.19` |

---

## COMPLETE HTML FOR ALL 4 CARDS

```html
<div class="metric-cards-grid">

  <!-- CARD 1: Sessions This Week -->
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
        <span class="metric-card-value">14/20</span>
        <span class="metric-card-delta positive">+4</span>
      </div>
    </div>
  </div>

  <!-- CARD 2: Adherence Score -->
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
        <span class="metric-card-value">87%</span>
        <span class="metric-card-delta positive">+5%</span>
      </div>
    </div>
  </div>

  <!-- CARD 3: Active Clients -->
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
      <div class="metric-card-value-row">
        <span class="metric-card-value">24</span>
        <span class="metric-card-delta positive">+3</span>
      </div>
      <!-- Segmented breakdown -->
      <div class="client-segments" style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;justify-content:center;">
        <span style="font-size:10px;font-weight:600;padding:2px 6px;border-radius:999px;background:rgba(34,197,94,0.15);color:#22C55E;">18</span>
        <span style="font-size:10px;font-weight:600;padding:2px 6px;border-radius:999px;background:rgba(245,158,11,0.15);color:#F59E0B;">4</span>
        <span style="font-size:10px;font-weight:600;padding:2px 6px;border-radius:999px;background:rgba(239,68,68,0.15);color:#EF4444;">2</span>
      </div>
    </div>
  </div>

  <!-- CARD 4: Weekly Revenue -->
  <div class="metric-card">
    <svg class="metric-card-ring" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="34" fill="none" stroke="#2A3A50" stroke-width="8"/>
      <circle cx="40" cy="40" r="34" fill="none" stroke="#00AEEF" stroke-width="8"
        stroke-linecap="round" stroke-dasharray="172.68 213.19" stroke-dashoffset="0"
        transform="rotate(-90 40 40)"/>
      <text x="40" y="40" text-anchor="middle" dominant-baseline="central"
        fill="#F1F5F9" font-size="14" font-weight="700">$3,240</text>
    </svg>
    <div class="metric-card-content">
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
        <div class="metric-card-label">Revenue</div>
        <button onclick="toggleRevenue(this)" style="background:none;border:none;color:#94A3B8;cursor:pointer;font-size:12px;padding:0;line-height:1;">👁</button>
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

## REVENUE TOGGLE JAVASCRIPT

```javascript
function toggleRevenue(btn) {
  const card = btn.closest('.metric-card');
  const valueEl = card.querySelector('[data-revenue]');
  const isHidden = valueEl.dataset.hidden === 'true';
  
  if (isHidden) {
    valueEl.textContent = valueEl.dataset.revenue;
    valueEl.dataset.hidden = 'false';
    btn.textContent = '👁';
    btn.style.color = '#94A3B8';
  } else {
    valueEl.textContent = '••••';
    valueEl.dataset.hidden = 'true';
    btn.textContent = '👁‍🗨';
    btn.style.color = '#00AEEF';
  }
}
```

---

## SIZE REFERENCE TABLE

| Property | Mobile (< 590px) | Tablet (590-1023px) | Desktop (1024-1399px) | Wide (1400px+) |
|----------|------------------|---------------------|----------------------|----------------|
| Grid | 2 columns | 2 columns | 4 columns | 4 columns |
| Card width | ~170px (at 375px) | ~370px (at 768px) | ~282px (at 1200px) | ~332px (at 1400px) |
| Card layout | **vertical** (ring top, text below, centered) | **horizontal** (ring left, text right) | **horizontal** (ring left, text right) | **horizontal** (ring left, text right) |
| Ring size | 56px | 72px | 64px | 72px |
| Label | 9px | 11px | 10px | 10px |
| Value | 16px | 20px | 18px | 20px |
| Delta badge | 10px | 11px | 11px | 11px |
| Card padding | 12px | 18px | 16px | 20px |
| Grid gap | 12px | 16px | 20px | 24px |
| Page padding | 16px | 20px | 24px | 32px |

---

## SAFETY RULES

1. **Mobile cards are VERTICAL** — ring on top, text below, everything centered. At 170px wide, side-by-side is impossible.
2. **Tablet+ cards are HORIZONTAL** — ring left, text right, everything left-aligned.
3. **Ring never shrinks below 48px** — `flex-shrink: 0` always.
4. **Labels truncate with ellipsis** — `text-overflow: ellipsis` on all labels.
5. **Client segments wrap** — `flex-wrap: wrap` so 18/4/2 pills don't overflow.
6. **Revenue label shortens** — "Weekly Revenue" becomes "Revenue" on mobile (9px font + ellipsis handles this).
7. **Test at:** 320px, 360px, 375px, 390px, 414px, 768px, 1024px, 1200px, 1440px.

---

## WHAT TO TELL KIMI CODE

> **DASHBOARD METRIC CARDS — 4-2-2 Grid**
>
> Build a responsive grid of 4 metric cards:
> - **Desktop (1024px+): 4 columns**, cards are horizontal (ring left, text right)
> - **Tablet (590-1023px): 2 columns**, cards are horizontal (ring left, text right)
> - **Mobile (< 590px): 2 columns**, cards are **VERTICAL** (ring centered on top, text centered below)
>
> Use `grid-template-columns: repeat(2, 1fr)` by default, switch to `repeat(4, 1fr)` at 1024px.
>
> Card CSS switches `flex-direction` per breakpoint:
> - Mobile: `column` + `align-items: center` + `text-align: center`
> - Tablet+: `row` + `align-items: center` + `text-align: left`
>
> Ring sizes: 56px mobile, 72px tablet, 64px desktop, 72px wide desktop.
> Value sizes: 16px mobile, 20px tablet, 18px desktop, 20px wide desktop.
> Label: "Sessions This Week" etc — truncate with ellipsis on small screens.
>
> 4 cards: Sessions (70% ring, 14/20 +4), Adherence (87% ring, +5%), Active Clients (24 total, 18🟢 4🟡 2🔴 breakdown), Revenue ($3,240 +12, with eye toggle to hide).

---

END OF SPEC
