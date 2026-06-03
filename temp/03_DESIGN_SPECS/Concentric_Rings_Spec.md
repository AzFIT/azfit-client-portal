# AzFIT Animated Rings — Conic Gradient Style (YouTube Reference)
## Desktop: 4 columns | Tablet: 2 columns | Mobile: 2 columns

---

## THE TECHNIQUE

This uses **CSS `conic-gradient()`** — NOT SVG stroke-dasharray. This creates a solid color arc with a natural glow/shadow effect, matching the Online Tutorials video style exactly.

```
+----------------------------+
|     (outer track circle)   |
|    +------------------+    |
|    |   (glow shadow)  |    |
|    |  +------------+  |    |
|    |  |            |  |    |
|    |  |   70%      |  |    |
|    |  |  (center)  |  |    |
|    |  +------------+  |    |
|    |   (cyan arc)     |    |
|    +------------------+    |
|     (rounded end dot)      |
+----------------------------+
```

**3 layers:**
1. **Outer container**: dark circle (the track)
2. **Conic gradient layer**: the colored arc that animates
3. **Inner mask**: smaller dark circle that creates the donut hole + center text

---

## COMPLETE CSS

```css
/* =============================================
   RING COMPONENT (Conic Gradient Style)
   ============================================= */

.ring-container {
  position: relative;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* MOBILE size (default) */
  width: 56px;
  height: 56px;
}

/* Tablet */
@media (min-width: 590px) {
  .ring-container {
    width: 72px;
    height: 72px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .ring-container {
    width: 64px;
    height: 64px;
  }
}

/* Wide desktop */
@media (min-width: 1400px) {
  .ring-container {
    width: 72px;
    height: 72px;
  }
}

/* ---- LAYER 1: The dark track + conic gradient fill ---- */
.ring-container::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  /* Track color is the dark background */
  background: conic-gradient(
    var(--ring-color, #00AEEF) var(--ring-percent, 0%),
    #1E293B 0%  /* dark slate track color */
  );
  /* Glow shadow around the colored arc */
  box-shadow: 
    0 0 8px rgba(0, 174, 239, 0.15),
    inset 0 0 12px rgba(0, 0, 0, 0.3);
  transition: background 0.1s linear;
}

/* ---- LAYER 2: The inner circle mask (creates donut hole) ---- */
.ring-container::after {
  content: '';
  position: absolute;
  /* Thickness of the ring: smaller number = thicker ring */
  /* At 56px container: inset 6px = 44px inner = ~22% thickness */
  inset: 6px;
  border-radius: 50%;
  background: #151D2E; /* matches card background */
  box-shadow: 
    inset 0 2px 6px rgba(0, 0, 0, 0.4),
    0 1px 2px rgba(255, 255, 255, 0.05);
}

/* ---- LAYER 3: Rounded end dot on the arc ---- */
.ring-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ring-color, #00AEEF);
  box-shadow: 
    0 0 6px var(--ring-color, #00AEEF),
    0 0 12px rgba(0, 174, 239, 0.4);
  /* Position at the edge of the ring, rotated by --ring-percent */
  transform: rotate(var(--ring-angle, 0deg)) translateY(calc(var(--ring-radius, 28px) * -1));
  opacity: 0; /* hidden when 0% */
  transition: opacity 0.3s;
  z-index: 2;
}

.ring-dot.visible {
  opacity: 1;
}

/* Tablet dot sizing */
@media (min-width: 590px) {
  .ring-container::after { inset: 8px; }
  .ring-dot {
    width: 10px;
    height: 10px;
    transform: rotate(var(--ring-angle, 0deg)) translateY(calc(var(--ring-radius, 36px) * -1));
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .ring-container::after { inset: 7px; }
  .ring-dot {
    width: 9px;
    height: 9px;
    transform: rotate(var(--ring-angle, 0deg)) translateY(calc(var(--ring-radius, 32px) * -1));
  }
}

/* Wide desktop */
@media (min-width: 1400px) {
  .ring-container::after { inset: 8px; }
  .ring-dot {
    width: 10px;
    height: 10px;
    transform: rotate(var(--ring-angle, 0deg)) translateY(calc(var(--ring-radius, 36px) * -1));
  }
}

/* ---- CENTER TEXT ---- */
.ring-center {
  position: relative;
  z-index: 3; /* above ::after mask */
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.ring-value {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  color: #F1F5F9;
  /* MOBILE */
  font-size: 13px;
  line-height: 1.1;
}

.ring-unit {
  font-size: 0.65em;
  font-weight: 600;
  color: var(--ring-color, #00AEEF);
  margin-left: 1px;
}

/* Tablet */
@media (min-width: 590px) {
  .ring-value { font-size: 18px; }
}

/* Desktop */
@media (min-width: 1024px) {
  .ring-value { font-size: 16px; }
}

/* Wide */
@media (min-width: 1400px) {
  .ring-value { font-size: 18px; }
}
```

---

## JAVASCRIPT — ANIMATE RING ON MOUNT

```javascript
/**
 * Animate a ring from 0% to target percentage
 * @param {HTMLElement} ringEl - the .ring-container element
 * @param {number} targetPercent - 0 to 100
 * @param {number} duration - ms, default 1200
 */
function animateRing(ringEl, targetPercent, duration = 1200) {
  const startTime = performance.now();
  const color = getComputedStyle(ringEl).getPropertyValue('--ring-color').trim() || '#00AEEF';
  
  // Calculate radius for dot positioning
  const rect = ringEl.getBoundingClientRect();
  const radius = rect.width / 2;
  ringEl.style.setProperty('--ring-radius', radius + 'px');
  
  // Show the dot
  const dot = ringEl.querySelector('.ring-dot');
  if (dot && targetPercent > 0) {
    dot.classList.add('visible');
  }
  
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing: ease-out-cubic for smooth deceleration
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * targetPercent);
    
    // Update conic gradient
    ringEl.style.setProperty('--ring-percent', current + '%');
    
    // Update dot angle (starts from top = -90deg)
    const angle = -90 + (current / 100) * 360;
    ringEl.style.setProperty('--ring-angle', angle + 'deg');
    
    // Update center text
    const valueEl = ringEl.querySelector('.ring-value');
    if (valueEl) {
      // Check if this is a dollar amount, percentage, or count
      if (valueEl.dataset.prefix) {
        valueEl.innerHTML = valueEl.dataset.prefix + current + '<span class="ring-unit">' + (valueEl.dataset.unit || '') + '</span>';
      } else if (valueEl.dataset.count) {
        // For count-based (like "24 clients"), don't animate the number
        // Just keep it static
      } else {
        valueEl.innerHTML = current + '<span class="ring-unit">%</span>';
      }
    }
    
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  
  requestAnimationFrame(step);
}

// Initialize all rings when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Small delay for visual impact
  setTimeout(() => {
    document.querySelectorAll('[data-ring-target]').forEach((ring, i) => {
      const target = parseInt(ring.dataset.ringTarget, 10);
      const color = ring.dataset.ringColor || '#00AEEF';
      ring.style.setProperty('--ring-color', color);
      // Stagger animations: 200ms apart
      setTimeout(() => animateRing(ring, target, 1000), i * 200);
    });
  }, 300);
});
```

---

## COMPLETE HTML FOR ALL 4 CARDS

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AzFIT Dashboard Rings</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  /* ---- RESET & BASE ---- */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: #0B1120;
    color: #F1F5F9;
    -webkit-font-smoothing: antialiased;
  }

  /* ---- GRID ---- */
  .metric-cards-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
    max-width: 1400px;
    margin: 0 auto;
  }
  @media (min-width: 590px) {
    .metric-cards-grid { gap: 16px; padding: 20px; }
  }
  @media (min-width: 1024px) {
    .metric-cards-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 24px; }
  }
  @media (min-width: 1400px) {
    .metric-cards-grid { gap: 24px; padding: 32px; }
  }

  /* ---- CARD ---- */
  .metric-card {
    background: #151D2E;
    border: 1px solid #2A3A50;
    border-radius: 12px;
    /* MOBILE: vertical (ring on top, text below) */
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
  @media (min-width: 590px) {
    .metric-card {
      flex-direction: row;
      align-items: center;
      text-align: left;
      gap: 14px;
      padding: 18px;
    }
  }
  @media (min-width: 1024px) {
    .metric-card { gap: 12px; padding: 16px; }
  }
  @media (min-width: 1400px) {
    .metric-card { gap: 14px; padding: 20px; }
  }

  /* ---- RING ---- */
  .ring-container {
    position: relative;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    flex-shrink: 0;
  }
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
  .ring-container::after {
    content: '';
    position: absolute;
    inset: 6px;
    border-radius: 50%;
    background: #151D2E;
    box-shadow: 
      inset 0 2px 6px rgba(0, 0, 0, 0.4),
      0 1px 2px rgba(255, 255, 255, 0.05);
  }
  .ring-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--ring-color, #00AEEF);
    box-shadow: 
      0 0 6px var(--ring-color, #00AEEF),
      0 0 12px rgba(0, 174, 239, 0.4);
    transform: rotate(var(--ring-angle, -90deg)) translateY(-28px);
    opacity: 0;
    z-index: 2;
  }
  .ring-dot.visible { opacity: 1; }
  .ring-center {
    position: relative;
    z-index: 3;
    text-align: center;
  }
  .ring-value {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    color: #F1F5F9;
    font-size: 13px;
    line-height: 1.1;
  }
  .ring-unit {
    font-size: 0.65em;
    font-weight: 600;
    color: var(--ring-color, #00AEEF);
  }

  /* Ring responsive sizing */
  @media (min-width: 590px) {
    .ring-container { width: 72px; height: 72px; }
    .ring-container::after { inset: 8px; }
    .ring-dot { width: 10px; height: 10px; transform: rotate(var(--ring-angle, -90deg)) translateY(-36px); }
    .ring-value { font-size: 18px; }
  }
  @media (min-width: 1024px) {
    .ring-container { width: 64px; height: 64px; }
    .ring-container::after { inset: 7px; }
    .ring-dot { width: 9px; height: 9px; transform: rotate(var(--ring-angle, -90deg)) translateY(-32px); }
    .ring-value { font-size: 16px; }
  }
  @media (min-width: 1400px) {
    .ring-container { width: 72px; height: 72px; }
    .ring-container::after { inset: 8px; }
    .ring-dot { width: 10px; height: 10px; transform: rotate(var(--ring-angle, -90deg)) translateY(-36px); }
    .ring-value { font-size: 18px; }
  }

  /* ---- CARD CONTENT ---- */
  .metric-card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  @media (min-width: 590px) {
    .metric-card-content { align-items: flex-start; flex: 1; min-width: 0; }
  }
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
  @media (min-width: 590px) {
    .metric-card-label { font-size: 11px; letter-spacing: 0.05em; }
  }
  @media (min-width: 1024px) {
    .metric-card-label { font-size: 10px; }
  }
  .metric-card-value-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  @media (min-width: 590px) {
    .metric-card-value-row { justify-content: flex-start; }
  }
  .metric-card-value {
    font-size: 16px;
    font-weight: 700;
    color: #F1F5F9;
    line-height: 1.2;
  }
  @media (min-width: 590px) {
    .metric-card-value { font-size: 20px; }
  }
  @media (min-width: 1024px) {
    .metric-card-value { font-size: 18px; }
  }
  .metric-card-delta {
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 9999px;
    flex-shrink: 0;
  }
  @media (min-width: 590px) {
    .metric-card-delta { font-size: 11px; padding: 2px 8px; }
  }
  .metric-card-delta.positive {
    background: rgba(34, 197, 94, 0.15);
    color: #22C55E;
  }
  .metric-card-delta.negative {
    background: rgba(239, 68, 68, 0.15);
    color: #EF4444;
  }

  /* Client segments */
  .client-segments {
    display: flex;
    gap: 4px;
    margin-top: 4px;
    flex-wrap: wrap;
    justify-content: center;
  }
  @media (min-width: 590px) {
    .client-segments { justify-content: flex-start; }
  }
  .client-segments span {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 9999px;
  }
  .seg-engaged { background: rgba(34, 197, 94, 0.15); color: #22C55E; }
  .seg-moderate { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }
  .seg-atrisk { background: rgba(239, 68, 68, 0.15); color: #EF4444; }

  /* Revenue toggle */
  .revenue-toggle {
    background: none;
    border: none;
    color: #64748B;
    cursor: pointer;
    font-size: 12px;
    padding: 0 2px;
    line-height: 1;
    transition: color 150ms;
  }
  .revenue-toggle:hover { color: #F1F5F9; }
  .card-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
</style>
</head>
<body>

<div class="metric-cards-grid">

  <!-- CARD 1: Sessions -->
  <div class="metric-card">
    <div class="ring-container" data-ring-target="70" data-ring-color="#00AEEF">
      <div class="ring-dot"></div>
      <div class="ring-center">
        <div class="ring-value">0<span class="ring-unit">%</span></div>
      </div>
    </div>
    <div class="metric-card-content">
      <div class="metric-card-label">Sessions This Week</div>
      <div class="metric-card-value-row">
        <span class="metric-card-value">14/20</span>
        <span class="metric-card-delta positive">+4</span>
      </div>
    </div>
  </div>

  <!-- CARD 2: Adherence -->
  <div class="metric-card">
    <div class="ring-container" data-ring-target="87" data-ring-color="#00AEEF">
      <div class="ring-dot"></div>
      <div class="ring-center">
        <div class="ring-value">0<span class="ring-unit">%</span></div>
      </div>
    </div>
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
    <div class="ring-container" data-ring-target="100" data-ring-color="#00AEEF">
      <div class="ring-dot"></div>
      <div class="ring-center">
        <div class="ring-value" data-count="24">24</div>
      </div>
    </div>
    <div class="metric-card-content">
      <div class="metric-card-label">Active Clients</div>
      <div class="metric-card-value-row">
        <span class="metric-card-value">24</span>
        <span class="metric-card-delta positive">+3</span>
      </div>
      <div class="client-segments">
        <span class="seg-engaged">18</span>
        <span class="seg-moderate">4</span>
        <span class="seg-atrisk">2</span>
      </div>
    </div>
  </div>

  <!-- CARD 4: Revenue -->
  <div class="metric-card">
    <div class="ring-container" data-ring-target="81" data-ring-color="#00AEEF">
      <div class="ring-dot"></div>
      <div class="ring-center">
        <div class="ring-value" data-prefix="$">$<span id="rev-val">0</span></div>
      </div>
    </div>
    <div class="metric-card-content">
      <div class="card-header-row">
        <div class="metric-card-label">Revenue</div>
        <button class="revenue-toggle" onclick="toggleRevenue(this)" title="Hide/Show">&#128065;</button>
      </div>
      <div class="metric-card-value-row">
        <span class="metric-card-value" data-revenue="$3,240">$3,240</span>
        <span class="metric-card-delta positive">+12</span>
      </div>
    </div>
  </div>

</div>

<script>
  // Animate rings
  function animateRing(ringEl, targetPercent, duration = 1000) {
    const startTime = performance.now();
    const rect = ringEl.getBoundingClientRect();
    const radius = rect.width / 2;
    const dot = ringEl.querySelector('.ring-dot');
    const valueEl = ringEl.querySelector('.ring-value');
    const isCount = valueEl && valueEl.dataset.count;
    const isRevenue = valueEl && valueEl.dataset.prefix;
    
    if (dot && targetPercent > 0) dot.classList.add('visible');
    
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * targetPercent);
      
      ringEl.style.setProperty('--ring-percent', current + '%');
      const angle = -90 + (current / 100) * 360;
      ringEl.style.setProperty('--ring-angle', angle + 'deg');
      
      if (valueEl && !isCount) {
        if (isRevenue) {
          const val = Math.round(eased * 3240);
          valueEl.innerHTML = '$' + val.toLocaleString();
        } else {
          valueEl.innerHTML = current + '<span class="ring-unit">%</span>';
        }
      }
      
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Revenue toggle
  function toggleRevenue(btn) {
    const card = btn.closest('.metric-card');
    const valueEl = card.querySelector('[data-revenue]');
    const isHidden = valueEl.dataset.hidden === 'true';
    if (isHidden) {
      valueEl.textContent = valueEl.dataset.revenue;
      valueEl.dataset.hidden = 'false';
      btn.innerHTML = '&#128065;';
    } else {
      valueEl.textContent = '••••';
      valueEl.dataset.hidden = 'true';
      btn.innerHTML = '&#128065;&#8205;&#128488;';
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      document.querySelectorAll('[data-ring-target]').forEach((ring, i) => {
        const target = parseInt(ring.dataset.ringTarget, 10);
        const color = ring.dataset.ringColor || '#00AEEF';
        ring.style.setProperty('--ring-color', color);
        setTimeout(() => animateRing(ring, target, 1000), i * 200);
      });
    }, 300);
  });
</script>

</body>
</html>
```

---

## HOW IT WORKS

| Layer | CSS Technique | Purpose |
|-------|--------------|---------|
| **Outer circle** | `::before` with `conic-gradient()` | The colored arc + dark track |
| **Inner hole** | `::after` with smaller circle | Creates donut by covering center |
| **Glow effect** | `box-shadow` on `::before` | Subtle cyan glow around the arc |
| **End dot** | `.ring-dot` positioned at edge | Rounded cap on the arc tip |
| **Center text** | `.ring-center` with `z-index: 3` | Percentage/value in the middle |
| **Animation** | JS updates `--ring-percent` custom property | Conic gradient smoothly fills |

## Key Differences from SVG Approach

| Feature | SVG stroke-dasharray | Conic gradient (this) |
|---------|---------------------|----------------------|
| **Visual** | Thin stroke outline | Solid filled arc |
| **Glow** | Hard to do | Easy with `box-shadow` |
| **End cap** | `stroke-linecap: round` | Separate dot element |
| **Animation** | `stroke-dashoffset` | CSS custom property `--ring-percent` |
| **Inner shadow** | Not possible | `inset` box-shadow on mask |
| **Matches video** | No | **Yes** — exactly like Online Tutorials |

---

## WHAT TO TELL KIMI CODE

> **DASHBOARD RINGS — Conic Gradient Style**
>
> Use CSS `conic-gradient()` for the rings, NOT SVG stroke-dasharray. This matches the YouTube tutorial style exactly.
>
> Each ring has 3 layers:
> 1. `::before` — conic-gradient arc (cyan fill + dark slate track) with subtle glow box-shadow
> 2. `::after` — smaller inner circle that masks the center (creates donut hole) with inset shadow
> 3. `.ring-dot` — small circle at the arc tip with glow, positioned via `rotate() translateY()`
>
> Center text sits above all layers (`z-index: 3`).
>
> Animation: JS updates a `--ring-percent` CSS custom property from 0 to target. Use `requestAnimationFrame` with ease-out-cubic easing (`1 - (1-t)^3`). Duration: 1000ms. Stagger each card by 200ms.
>
> Responsive sizes:
> - Mobile: 56px ring, 6px thickness, 13px center text
> - Tablet: 72px ring, 8px thickness, 18px center text
> - Desktop: 64px ring, 7px thickness, 16px center text
> - Wide: 72px ring, 8px thickness, 18px center text
>
> Cards: 4 columns desktop, 2 columns tablet, 2 columns mobile. Mobile cards are VERTICAL (ring top, text below, centered). Tablet+ are HORIZONTAL (ring left, text right).

<KIMI_REF type="file" path=