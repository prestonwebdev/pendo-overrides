# Pendo Guide Override Components

A modular breakdown of all available overrides. Each section is independent — mix and match as needed for new guides.

---

## Table of Contents

1. [Brand Colors (CSS + JS)](#1-brand-colors)
2. [Primary Button Hover (JS)](#2-primary-button-hover)
3. [Slide-Up Animation (CSS + JS)](#3-slide-up-animation)
4. [Close Button Pill (CSS + JS)](#4-close-button-pill)
5. [Header Bar (CSS)](#5-header-bar)
6. [Footer Bar (CSS)](#6-footer-bar)
7. [Scrollable Content Area (CSS + JS)](#7-scrollable-content-area)
8. [Heading Color (CSS)](#8-heading-color)
9. [Designer-Safe Row Padding (CSS)](#9-designer-safe-row-padding)
10. [MutationObserver (JS)](#10-mutationobserver)

---

## How Pendo Overrides Work

- **CSS** is applied in both the Pendo designer and the live preview.
- **JS** only runs in the live preview (and sometimes the designer preview), NOT in the designer's visual editor. Any styling that depends on JS-created DOM elements will not appear in the designer.
- Pendo frequently overwrites inline styles, so many rules need `!important` and the JS re-applies styles on every `init()` call via a MutationObserver.

### DOM Structure Notes

- `._pendo-step-container-styles` — the main guide container
- `._pendo-step-container-size` — the sizing/positioning parent (used for centering)
- `._pendo-row` — content rows (header, body, footer)
- `.bb-button` — Pendo building block buttons (Next, Submit, etc.)
- `._pendo-button-primaryButton` — primary action buttons
- `._pendo-text-paragraph` — standalone text blocks (e.g. poll questions); these are NOT `._pendo-row` elements
- In the designer, rows are wrapped in `.pendo-block-controls-wrapper` divs with interleaved `.pendo-add-bb-container` elements

### Brand Theme

The app stores a brand theme as a JSON attribute on `<body ba-theme='...'>` with keys `100`, `300`, `500`, `900` mapping to color shades. The JS reads this and sets CSS custom properties. Fallback colors are hardcoded for when the attribute isn't present.

**CSS custom properties set by JS:**

| Property                  | Theme Key | Fallback   | Usage               |
|---------------------------|-----------|------------|---------------------|
| `--pendo-brand-lightest`  | `100`     | `#F1FCED`  | Light backgrounds   |
| `--pendo-brand-light`     | `300`     | `#97ED7E`  | Accents             |
| `--pendo-brand-base`      | `500`     | `#287411`  | Buttons, headings   |
| `--pendo-brand-dark`      | `900`     | `#18470A`  | Hover states        |

### Common Pitfalls

- **Double padding:** The scroll wrapper provides horizontal padding via JS inline styles. If CSS also adds padding to elements inside the wrapper, you get double padding. Use `:not(.pendo-scroll-content *)` to scope CSS padding rules to only apply outside the scroll wrapper.
- **Footer styles on content buttons:** The footer bar targets `._pendo-row:has(.bb-button)`, which matches any row with a button. Use `:not(.pendo-scroll-content *)` to prevent buttons inside the scroll area from getting footer styling.
- **Separator rows:** Pendo auto-inserts `._pendo-row` elements containing `<hr>` between content blocks. These are normal and should not be hidden unless you intentionally want to collapse them.

---

## 1. Brand Colors

**Type:** CSS + JS
**Dependencies:** None
**Designer-safe:** Partially — CSS fallback values render, but the dynamic theme colors require JS

Sets CSS custom properties from the customer's brand theme so all other color overrides can reference them.

### CSS

```css
/* Use var(--pendo-brand-base, #287411) anywhere you need the brand color.
   The fallback (#287411) ensures it works in the designer without JS. */
```

### JS

```js
var FALLBACK_THEME = {
  100: "#F1FCED",
  300: "#97ED7E",
  500: "#287411",
  900: "#18470A"
};

function getBrandTheme() {
  var themeAttr = document.body.getAttribute("ba-theme");
  if (themeAttr) {
    try { return JSON.parse(themeAttr); } catch (e) {}
  }
  return FALLBACK_THEME;
}

function applyBrandColors() {
  var theme = getBrandTheme();
  var root = document.documentElement;
  root.style.setProperty("--pendo-brand-lightest", theme[100]);
  root.style.setProperty("--pendo-brand-light", theme[300]);
  root.style.setProperty("--pendo-brand-base", theme[500]);
  root.style.setProperty("--pendo-brand-dark", theme[900]);
}
```

### Customization

- Change the `FALLBACK_THEME` values to match a different brand
- Change the `ba-theme` attribute name if your app uses a different convention
- Add more shade keys (e.g. `200`, `400`) if needed

---

## 2. Primary Button Hover

**Type:** CSS + JS
**Dependencies:** Brand Colors (for theme values)
**Designer-safe:** Partial — CSS handles default/hover states; JS needed to override Pendo's inline hover styles

Overrides Pendo's inline hover styles on primary buttons so they use brand colors.

### CSS

```css
._pendo-button-primaryButton,
._pendo-step-container-styles button[type="submit"] {
  background-color: var(--pendo-brand-base, #287411) !important;
  border-color: var(--pendo-brand-base, #287411) !important;
  color: #ffffff !important;
  transition: none !important;
}

._pendo-button-primaryButton:hover,
._pendo-button-primaryButton:active,
._pendo-step-container-styles button[type="submit"]:hover,
._pendo-step-container-styles button[type="submit"]:active {
  background-color: var(--pendo-brand-dark, #18470A) !important;
  border-color: var(--pendo-brand-dark, #18470A) !important;
}
```

### JS

```js
function processPrimaryButtons() {
  var theme = getBrandTheme();
  var base = theme[500];
  var dark = theme[900];

  var buttons = document.querySelectorAll("._pendo-button-primaryButton");
  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    if (btn.dataset.pendoBrandBound === "1") continue;
    btn.dataset.pendoBrandBound = "1";

    btn.style.setProperty("background-color", base, "important");
    btn.style.setProperty("border-color", base, "important");

    (function (b, baseColor, darkColor) {
      b.addEventListener("mouseenter", function () {
        b.style.setProperty("background-color", darkColor, "important");
        b.style.setProperty("border-color", darkColor, "important");
      });
      b.addEventListener("mouseleave", function () {
        b.style.setProperty("background-color", baseColor, "important");
        b.style.setProperty("border-color", baseColor, "important");
      });
    })(btn, base, dark);
  }
}
```

### Why JS is needed

Pendo sets `background-color` and `border-color` as inline styles on hover via its own JS. CSS `:hover` rules can't override inline styles even with `!important`. The JS attaches `mouseenter`/`mouseleave` listeners to set inline styles that win the specificity war.

---

## 2b. Secondary Button Hover

**Type:** CSS + JS
**Dependencies:** Brand Colors (for theme values)
**Designer-safe:** Partial — CSS handles default/hover states; JS needed to override Pendo's inline hover styles

Styles secondary buttons with a transparent background and brand-colored border/text. On hover, fills with the lightest brand shade and darkens the border/text.

### CSS

```css
._pendo-button-secondaryButton {
  background-color: transparent !important;
  border-color: var(--pendo-brand-base, #287411) !important;
  color: var(--pendo-brand-base, #287411) !important;
  transition: none !important;
}

._pendo-button-secondaryButton:hover,
._pendo-button-secondaryButton:active {
  background-color: var(--pendo-brand-lightest, #F1FCED) !important;
  border-color: var(--pendo-brand-dark, #18470A) !important;
  color: var(--pendo-brand-dark, #18470A) !important;
}
```

### JS

```js
function processSecondaryButtons() {
  var theme = getBrandTheme();
  var lightest = theme[100];
  var base = theme[500];
  var dark = theme[900];

  var buttons = document.querySelectorAll("._pendo-button-secondaryButton");
  for (var j = 0; j < buttons.length; j++) {
    var sbtn = buttons[j];
    if (sbtn.dataset.pendoBrandBound === "1") continue;
    sbtn.dataset.pendoBrandBound = "1";

    sbtn.style.setProperty("background-color", "transparent", "important");
    sbtn.style.setProperty("border-color", base, "important");
    sbtn.style.setProperty("color", base, "important");

    (function (b, lightestColor, baseColor, darkColor) {
      b.addEventListener("mouseenter", function () {
        b.style.setProperty("background-color", lightestColor, "important");
        b.style.setProperty("border-color", darkColor, "important");
        b.style.setProperty("color", darkColor, "important");
      });
      b.addEventListener("mouseleave", function () {
        b.style.setProperty("background-color", "transparent", "important");
        b.style.setProperty("border-color", baseColor, "important");
        b.style.setProperty("color", baseColor, "important");
      });
    })(sbtn, lightest, base, dark);
  }
}
```

### Customization

- `transparent` background — change to a light brand shade if you want a filled default state
- `lightest` on hover — change to `light` (theme key `300`) for a more pronounced hover fill
- Can be combined with Primary Button Hover into a single `processButtons()` function

---

## 3. Slide-Up Animation

**Type:** CSS + JS
**Dependencies:** None
**Designer-safe:** No — the guide starts invisible (`opacity: 0`) in CSS. In the designer this means the guide is hidden until JS runs.

The guide starts hidden and slides up into view after a configurable delay.

### CSS

```css
._pendo-step-container-styles {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 320ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 320ms cubic-bezier(0.4, 0, 0.2, 1);
}

._pendo-step-container-styles.pendo-animate-in {
  opacity: 1;
  transform: translateY(0);
}
```

### JS

```js
var DELAY_MS = 100;

function animateIn() {
  var containers = document.querySelectorAll("._pendo-step-container-styles");
  for (var i = 0; i < containers.length; i++) {
    var container = containers[i];
    if (container.dataset.pendoAnimated === "1") continue;
    container.dataset.pendoAnimated = "1";

    container.style.opacity = "0";
    container.style.transform = "translateY(16px)";

    (function (el) {
      setTimeout(function () {
        if (document.body.contains(el)) {
          el.style.removeProperty("opacity");
          el.style.removeProperty("transform");
          el.classList.add("pendo-animate-in");
        }
      }, DELAY_MS);
    })(container);
  }
}
```

### Customization

- `DELAY_MS` — increase for a longer pause before the animation starts
- `translateY(16px)` — change the distance for a more/less dramatic slide
- Swap `translateY` for `translateX`, `scale`, etc. for different effects
- Change the `cubic-bezier` curve or duration for different easing

---

## 4. Close Button Pill

**Type:** CSS + JS
**Dependencies:** Brand Colors (for active state)
**Designer-safe:** No — the pill wrapper is created by JS. Only applies to Centered guides.

Replaces Pendo's default close button with a pill-shaped button containing a custom SVG X icon.

### CSS

```css
.pendo-close-circle-wrap {
  position: absolute !important;
  top: 16px !important;
  right: 16px !important;
  padding: 6px 10px;
  border-radius: 999px;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #c6c2bf;
  box-shadow: 1px 1px 0 2px rgba(56, 49, 47, 0.04);
  z-index: 999999 !important;
  cursor: pointer;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.pendo-close-circle-wrap:hover {
  border-color: #676260;
}

.pendo-close-circle-wrap > button {
  appearance: none;
  background: transparent;
  border: 0;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.pendo-close-circle-wrap svg {
  display: block;
  width: 16px;
  height: 16px;
  transform-origin: 50% 50%;
  transform: scale(1.15);
  pointer-events: none;
}

.pendo-close-circle-wrap svg path {
  stroke: #3b3737;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  vector-effect: non-scaling-stroke;
  transition: stroke 160ms ease;
}

.pendo-close-circle-wrap:active {
  border-color: var(--pendo-brand-base, #287411);
  box-shadow: inset 2px 2px 0 1px rgba(56, 49, 47, 0.10);
}

.pendo-close-circle-wrap:active svg path {
  stroke: var(--pendo-brand-base, #287411);
}
```

### JS

```js
var WRAP_CLASS = "pendo-close-circle-wrap";
var TARGET_ALIGNMENT = "Centered";

function createSvgX() {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M6 6 L18 18 M6 18 L18 6");
  svg.appendChild(path);
  return svg;
}

function processCloseButton() {
  var stepContainers = document.querySelectorAll("._pendo-step-container-size");
  for (var i = 0; i < stepContainers.length; i++) {
    var container = stepContainers[i];
    var alignment = container.getAttribute("data-vertical-alignment");

    if (alignment !== TARGET_ALIGNMENT) continue;
    if (container.dataset.pendoCloseScoped === "1") continue;

    var btn = container.querySelector("button._pendo-close-guide")
           || container.querySelector("button[id^=pendo-close]")
           || container.querySelector("button[aria-label=Close]");
    if (!btn) continue;

    container.dataset.pendoCloseScoped = "1";

    var wrap = (btn.parentElement && btn.parentElement.classList.contains(WRAP_CLASS))
      ? btn.parentElement : null;

    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;
      btn.parentNode.insertBefore(wrap, btn);
      wrap.appendChild(btn);
    }

    if (wrap.dataset.pendoCloseBound !== "1") {
      wrap.dataset.pendoCloseBound = "1";
      wrap.style.cursor = "pointer";
      wrap.setAttribute("role", "button");
      wrap.setAttribute("tabindex", "0");
      wrap.setAttribute("aria-label", "Close");

      (function (b) {
        wrap.addEventListener("click", function (e) {
          if (!b.contains(e.target)) b.click();
        });
        wrap.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            b.click();
          }
        });
      })(btn);
    }

    btn.style.setProperty("position", "static", "important");
    btn.style.setProperty("inset", "auto", "important");
    btn.style.setProperty("padding", "0", "important");
    btn.style.setProperty("margin", "0", "important");
    btn.style.setProperty("background", "transparent", "important");
    btn.style.setProperty("border", "0", "important");
    btn.style.setProperty("min-width", "0", "important");
    btn.style.setProperty("line-height", "1", "important");
    btn.style.setProperty("font-size", "0", "important");
    btn.style.setProperty("display", "flex", "important");
    btn.style.setProperty("align-items", "center", "important");
    btn.style.setProperty("justify-content", "center", "important");
    btn.style.removeProperty("width");
    btn.style.removeProperty("height");

    if (!btn.querySelector("svg")) {
      btn.innerHTML = "";
      btn.appendChild(createSvgX());
    }
  }
}
```

### Customization

- **Alignment filtering:** By default the close button pill only applies to Centered guides (`TARGET_ALIGNMENT = "Centered"`). For tooltip guides or other non-centered types, remove the alignment check entirely:
  ```js
  // Remove these two lines from processCloseButton():
  var alignment = container.getAttribute("data-vertical-alignment");
  if (alignment !== TARGET_ALIGNMENT) continue;
  ```
- SVG path `"M6 6 L18 18 M6 18 L18 6"` — replace with a different icon
- Pill sizing: adjust `padding`, `border-radius`, and SVG `width`/`height`
- Remove the `:active` brand color tint if you don't want it

---

## 5. Header Bar

**Type:** CSS only
**Dependencies:** Brand Colors (for text color)
**Designer-safe:** Yes

Styles the first row as a fixed header with a background color and brand-colored text.

### CSS

```css
._pendo-step-container-styles ._pendo-row[data-_pendo-row-1] {
  background: #F6F6F4 !important;
  padding: 20px 20px !important;
  border-radius: 12px 12px 0 0 !important;
  max-height: 64px;
  display: flex !important;
  align-items: center;
  justify-content: left;
  color: var(--pendo-brand-base, #287411) !important;
  flex-shrink: 0;
}
```

### Customization

- `background: #F6F6F4` — change the header background color
- `max-height: 64px` — increase for a taller header
- `border-radius: 12px 12px 0 0` — adjust corner rounding
- `color: var(--pendo-brand-base)` — change or remove the brand text color
- Targets `[data-_pendo-row-1]` which is always the first row in the Pendo builder

---

## 6. Footer Bar

**Type:** CSS only
**Dependencies:** None
**Designer-safe:** Yes

Styles the row containing buttons as a fixed footer bar, right-aligned. Scoped to only apply **outside** the scroll wrapper so buttons inside the content area render normally.

### CSS

```css
/* Only target button rows OUTSIDE the scroll wrapper */
._pendo-step-container-styles ._pendo-row:has(.bb-button):not(.pendo-scroll-content *) {
  background: #F6F6F4 !important;
  padding: 12px 16px !important;
  border-radius: 0 0 12px 12px !important;
  max-height: 64px;
  display: flex !important;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  margin-top: 4px;
}

._pendo-step-container-styles ._pendo-row:has(.bb-button):not(.pendo-scroll-content *) .pendo-mock-flexbox-row {
  display: flex !important;
  justify-content: flex-end;
  align-items: center;
  min-height: auto !important;
  position: static !important;
}

._pendo-step-container-styles ._pendo-row:has(.bb-button):not(.pendo-scroll-content *) .pendo-mock-flexbox-element {
  position: static !important;
  display: inline-flex !important;
}

._pendo-step-container-styles ._pendo-row:has(.bb-button):not(.pendo-scroll-content *) .bb-button {
  margin: 0 !important;
}
```

### Customization

- `justify-content: flex-end` — change to `center` or `space-between` for different button alignment
- `background: #F6F6F4` — match or contrast with the header
- The `.pendo-mock-flexbox-*` overrides fix Pendo's internal absolute-positioning layout
- Remove `:not(.pendo-scroll-content *)` if you want ALL button rows styled as footers (including those inside the scroll area)

### Why `:not(.pendo-scroll-content *)`?

Without this scoping, any button added inside the scrollable content area inherits the footer styling (gray background, right-aligned, bottom border-radius). The `:not()` selector ensures only the actual footer row outside the scroll wrapper gets these styles, leaving content-area buttons unstyled.

---

## 7. Scrollable Content Area

**Type:** CSS + JS
**Dependencies:** Header Bar, Footer Bar (needs both to identify boundaries)
**Designer-safe:** Partially — the CSS flex layout renders, but the scroll wrapper is JS-only

Creates a scrollable middle section between the fixed header and footer. The JS identifies the header row (`[data-_pendo-row-1]`) and footer row (last row with `.bb-button`), walks up to their top-level wrappers, and wraps everything between them in a scrollable div.

### CSS

```css
/* Container must be flex column with constrained height */
._pendo-step-container-styles {
  max-height: 624px !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  padding-bottom: 24px;
}

/* The JS-created scroll wrapper */
.pendo-scroll-content {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 350px;
  scrollbar-gutter: stable;
  padding-top: 24px;
  padding-bottom: 24px;
  margin-top: 2px;
  margin-bottom: 2px;
}
```

### JS

```js
var MAX_HEIGHT = 624;

function getTopLevelAncestor(el, container) {
  var current = el;
  while (current && current.parentNode !== container) {
    current = current.parentNode;
  }
  return current;
}

function processScrollableContent() {
  var containers = document.querySelectorAll("._pendo-step-container-styles");

  for (var c = 0; c < containers.length; c++) {
    var container = containers[c];

    container.style.setProperty("max-height", MAX_HEIGHT + "px", "important");
    container.style.setProperty("display", "flex", "important");
    container.style.setProperty("flex-direction", "column", "important");
    container.style.setProperty("overflow", "hidden", "important");

    // Height sync for centering
    var sizeParent = container.closest("._pendo-step-container-size");
    if (sizeParent) {
      var actualHeight = container.getBoundingClientRect().height;
      if (actualHeight > 0) {
        sizeParent.style.setProperty("height", actualHeight + "px", "important");
        sizeParent.style.setProperty("top", "50%", "important");
        sizeParent.style.setProperty("margin-top", "0", "important");
        sizeParent.style.setProperty("transform", "translateY(-50%)", "important");
      }
    }

    if (container.dataset.pendoScrollProcessed === "1") continue;

    var headerRow = container.querySelector("._pendo-row[data-_pendo-row-1]");
    if (!headerRow) continue;

    var footerCandidates = container.querySelectorAll("._pendo-row");
    var footerRow = null;
    for (var f = footerCandidates.length - 1; f >= 0; f--) {
      if (footerCandidates[f].querySelector(".bb-button")) {
        footerRow = footerCandidates[f];
        break;
      }
    }
    if (!footerRow) continue;

    var headerWrapper = getTopLevelAncestor(headerRow, container);
    var footerWrapper = getTopLevelAncestor(footerRow, container);
    if (!headerWrapper || !footerWrapper || headerWrapper === footerWrapper) continue;

    container.dataset.pendoScrollProcessed = "1";

    var children = Array.prototype.slice.call(container.children);
    var headerIdx = children.indexOf(headerWrapper);
    var footerIdx = children.indexOf(footerWrapper);

    var middle = [];
    for (var i = headerIdx + 1; i < footerIdx; i++) {
      var child = children[i];
      if (child.tagName === "STYLE") continue;
      if (child.tagName === "SCRIPT") continue;
      middle.push(child);
    }

    if (middle.length === 0) continue;

    var scrollWrap = document.createElement("div");
    scrollWrap.className = "pendo-scroll-content";
    scrollWrap.style.setProperty("padding-left", "20px", "important");
    scrollWrap.style.setProperty("padding-right", "20px", "important");
    scrollWrap.style.setProperty("overflow-y", "auto", "important");
    scrollWrap.style.setProperty("min-height", "350px", "important");
    scrollWrap.style.setProperty("flex", "1 1 0%", "important");

    headerWrapper.parentNode.insertBefore(scrollWrap, headerWrapper.nextSibling);

    for (var m = 0; m < middle.length; m++) {
      scrollWrap.appendChild(middle[m]);
    }
  }
}
```

### Customization

- `MAX_HEIGHT` — increase/decrease the max guide height (624px is a good default)
- `min-height: 350px` — ensures the scroll area has a minimum size even with little content; adjust or remove as needed
- Scroll wrapper padding — adjust `padding-top`, `padding-bottom`, `padding-left`, `padding-right`
- Remove `scrollbar-gutter: stable` if you don't want reserved scrollbar space
- The height sync block can be removed if guides aren't centered

### Important: DOM structure gotcha

Pendo rows (`._pendo-row`) aren't always direct children of the container. In the designer they're nested inside `.pendo-block-controls-wrapper` elements. Standalone content blocks like poll questions (`._pendo-text-paragraph`) are also NOT `._pendo-row` elements. The `getTopLevelAncestor` helper and the "wrap everything between header and footer" strategy handles both cases.

---

## 8. Heading Color

**Type:** CSS only
**Dependencies:** Brand Colors (for the color value)
**Designer-safe:** Yes (with fallback)

Colors `<h1>` elements inside the guide with the brand color.

### CSS

```css
._pendo-step-container-styles h1 {
  color: var(--pendo-brand-base, #287411) !important;
}
```

### Customization

- Add `h2`, `h3`, etc. if needed
- Change the fallback color for different brands

---

## 9. Designer-Safe Row Padding

**Type:** CSS only
**Dependencies:** None
**Designer-safe:** Yes (this IS the designer fix)

Adds horizontal padding to content rows and standalone text blocks so the designer view approximates the live preview. Scoped to only apply **outside** the scroll wrapper to prevent double padding in the preview.

### CSS

```css
/* Only apply when NOT inside the JS scroll wrapper.
   In the preview, the scroll wrapper provides horizontal padding.
   In the designer, the scroll wrapper doesn't exist so these kick in. */
._pendo-step-container-styles ._pendo-row:not(.pendo-scroll-content *),
._pendo-step-container-styles ._pendo-text-paragraph:not(.pendo-scroll-content *),
._pendo-step-container-styles ._pendo-text-custom:not(.pendo-scroll-content *) {
  padding-left: 20px !important;
  padding-right: 20px !important;
}

/* Header and footer define their own padding — override the generic rule */
._pendo-step-container-styles ._pendo-row[data-_pendo-row-1] {
  padding: 20px 20px !important;
}

._pendo-step-container-styles ._pendo-row:has(.bb-button):not(.pendo-scroll-content *) {
  padding: 12px 16px !important;
}
```

### Why `:not(.pendo-scroll-content *)`?

The scroll wrapper (created by JS) sets `padding-left: 20px` and `padding-right: 20px` via inline styles. Without the `:not()` scoping, elements inside the wrapper would get 20px from the wrapper AND 20px from this CSS rule = 40px total horizontal padding. The `:not()` ensures this CSS only applies in the designer where the scroll wrapper doesn't exist.

### Why this exists

The Pendo designer does not execute JavaScript. The scrollable content wrapper (`div.pendo-scroll-content`) is created by JS and provides `padding-left: 20px` / `padding-right: 20px`. Without these CSS rules, content has no horizontal padding in the designer view.

---

## 10. MutationObserver

**Type:** JS only
**Dependencies:** All JS overrides (calls `init()` which runs them all)
**Designer-safe:** N/A

Watches for DOM changes and re-runs all overrides when Pendo adds/removes guide elements. Disconnects when no guide is visible to avoid unnecessary work.

### JS

```js
var observer;
var debounceTimer;

function startObserver() {
  if (observer) return;
  observer = new MutationObserver(function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      if (document.querySelector("._pendo-step-container-styles")) {
        init();
      } else {
        observer.disconnect();
        observer = null;
      }
    }, 50);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
```

### Customization

- `50` (debounce ms) — increase if performance is a concern, decrease for faster response
- Add additional selectors to the `querySelector` check if you need to track other Pendo elements
- The observer watches `{ childList: true, subtree: true }` — you could add `attributes: true` if Pendo changes attributes you need to react to

---

## Quick Reference: Which overrides need which pieces?

| Override                    | CSS | JS  | Designer-Safe | Dependencies       |
|-----------------------------|-----|-----|---------------|--------------------|
| Brand Colors                | -   | Yes | Partial       | None               |
| Primary Button Hover        | Yes | Yes | Partial       | Brand Colors       |
| Secondary Button Hover      | Yes | Yes | Partial       | Brand Colors       |
| Slide-Up Animation          | Yes | Yes | No            | None               |
| Close Button Pill           | Yes | Yes | No            | Brand Colors       |
| Close Button Pill (banner)  | Yes | Yes | Yes           | None               |
| Header Bar                  | Yes | -   | Yes           | Brand Colors       |
| Footer Bar                  | Yes | -   | Yes           | None               |
| Scrollable Content          | Yes | Yes | Partial       | Header, Footer     |
| Heading Color               | Yes | -   | Yes           | Brand Colors       |
| Designer-Safe Row Padding   | Yes | -   | Yes           | None               |
| Banner Layout               | Yes | -   | Yes           | None               |
| Content Padding (image-aware)| Yes | Yes | Yes          | None               |
| Close Button Pill (dark)    | Yes | Yes | Partial       | None               |
| Progress Bar                | Yes | Yes | No            | Pendo API          |
| Text Width Override         | Yes | -   | Yes           | None               |
| Text Wrapping (balance/pretty)| Yes | - | Yes           | None               |
| MutationObserver            | -   | Yes | N/A           | All JS overrides   |

---

## Guide Recipes

### Tooltip guide (minimal)

Brand-colored buttons (primary + secondary) and custom close pill. No scroll, header/footer bars, or animation. Remove the alignment check from the close button so it works on non-centered tooltips.

**Files:** `tooltip-guide-overrides.css` + `tooltip-guide-overrides.js`

**Components used:**
- Brand Colors (JS)
- Primary Button Hover (CSS + JS)
- Secondary Button Hover (CSS + JS)
- Close Button Pill — all alignments (CSS + JS)
- MutationObserver (JS)

### Centered guide with fixed header/footer

Full layout with scrollable content, animation, and brand theming. Close button pill only on Centered alignment.

**Files:** `pendo-guide-overrides.css` + `pendo-guide-overrides.js`

**Components used:**
- All components (1–10)

### Banner guide with icon

Full-width banner with inline icon, text (truncates with ellipsis), action button, and translucent close pill. The icon is an HTML code block absolutely positioned on the left; the close button is absolutely positioned on the right. All elements vertically centered.

**Files:** `banner-guide-overrides.css` + `banner-guide-overrides.js`

**Components used:**
- Close Button Pill — banner variant, translucent for colored backgrounds (CSS + JS)
- Banner Layout (CSS)
- MutationObserver (JS)

**Banner-specific layout notes:**
- The icon lives in a Pendo code block (HTML building block) which is a separate top-level element outside the row. Its parent `.pendo-block-controls-wrapper` collapses to 0px height by default — the CSS absolutely positions the entire wrapper.
- The close button's wrapper is also absolutely positioned on the right.
- The row gets `padding-left: 34px` and `padding-right: 62px` to reserve space for the icon and X button.
- Text uses `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` to prevent wrapping.
- Pendo's `.pendo-mock-flexbox-row` is converted to real flexbox so the text element fills available space (`flex: 1`) and the button stays at natural width (`flex: 0 0 auto`).

**Banner close button vs standard close button:**
The banner variant uses translucent white backgrounds and white SVG strokes (for dark/colored banner backgrounds), while the standard pill uses opaque white background with dark strokes.

### Bottom-right guide with images

Notification-style guide anchored to the bottom right. Slides in from the right after a 2-second delay. Close button pill only on Bottom Right Aligned guides. Full-bleed images (zero padding on image rows), 20px horizontal padding on all other rows. **No brand color overrides on buttons** — Pendo's defaults are used.

**Files:** `bottom-right-guide-overrides.css` + `bottom-right-guide-overrides.js`

**Components used:**
- Slide-In Animation — `translateX(16px)` variant, 2s delay (CSS + JS)
- Close Button Pill — Bottom Right Aligned only (CSS + JS)
- Content Padding — image-aware, full-bleed images (CSS + JS)
- MutationObserver (JS)

**Bottom-right-specific notes:**
- Animation uses `translateX(16px)` (slides from right) instead of `translateY(16px)` (slides up). The `DELAY_MS` is 2000ms for a delayed entrance.
- Content padding is both CSS (designer-safe) and JS (runtime reinforcement). CSS uses `._pendo-row:has(._pendo-image)` to zero out image row padding. JS does the same with `row.querySelector("._pendo-image")`.
- The `img` rule is scoped to `._pendo-image img` (not bare `img`) to avoid affecting Pendo editor UI icons.
- Close button targets `TARGET_ALIGNMENT = "Bottom Right Aligned"` — change this value for other alignments.
- No brand colors, no button hover overrides — Pendo's default button styling is preserved.

### Dark multi-step guide with progress bar

Dark-themed guide with white close button pill, step progress bar, and text improvements. No brand color overrides on buttons. The progress bar reads `pendo.guides` to determine total steps and current step, then renders inline with the CTA button (or at the bottom of the container if no button row exists).

**Files:** `dark-guide-overrides.css` + `dark-guide-overrides.js`

**Components used:**
- Close Button Pill — dark variant, white border/stroke (CSS + JS)
- Progress Bar (CSS + JS)
- Content Padding (CSS)
- Text Width Override (CSS)
- Text Wrapping — `balance` on headings, `pretty` on body (CSS)
- Designer-safe close button positioning (CSS)
- MutationObserver + retry polling (JS)

**Dark close button variant:**
- Transparent background with `rgba(255, 255, 255, 0.4)` border
- White SVG stroke
- Hover: subtle white fill (`rgba(255, 255, 255, 0.08)`), brighter border
- No box shadow (cleaner on dark backgrounds)
- CSS also positions Pendo's native close button at `top: 16px; right: 16px` for designer consistency

**Progress bar notes:**
- Uses `pendo.guides` API to find the active guide's step count and current step
- When a button row exists: inserted to the left of the CTA inside `.pendo-mock-flexbox-row`
- When no button row exists: appended to the bottom of the container with its own padding
- Layout: `[====track====] [1 of 4]  [Primary CTA]`
- White fill on `rgba(255, 255, 255, 0.2)` track, max-width 100px
- Animates fill width on step changes (`transition: width 300ms ease`)
- Hidden on single-step guides (`totalSteps <= 1`)
- Includes a retry loop (polls every 250ms, up to 10s) because `pendo.guides` may not be populated when the code block first executes

**Text improvements:**
- Overrides Pendo's inline `max-width` on text elements (`_pendo-text-plain`, `_pendo-simple-text`, etc.) so text fills the full row width
- `text-wrap: balance` on headings — evens out line lengths
- `text-wrap: pretty` on body text — prevents orphan words on the last line

### Minimal centered guide (no scroll or animation)

Brand-colored buttons and a clean header/footer layout:

- Brand Colors (JS)
- Primary Button Hover (CSS + JS)
- Header Bar (CSS)
- Footer Bar (CSS)
- Heading Color (CSS)
- MutationObserver (JS)

---

## Content Guidelines

Character limits for in-product guide content. Users are in the middle of a task when guides appear — keep copy short, scannable, and action-oriented. Let the heading and CTA do the heavy lifting.

### Recommended limits

| Element | Max Characters | Rationale |
|---------|---------------|-----------|
| Heading | ~40 | Single line at most guide widths |
| Body text | ~200 | 3-4 lines, scannable without scrolling |
| Button label | ~15 | Fits without truncation on all guide types |
| Banner text | ~80 | Single line with ellipsis truncation |
| Poll question | ~60 | Single line, clear and direct |

### Tips

- Lead with the value or action, not background context
- If you need more than 200 characters, consider splitting across multiple steps
- Use bold text for the key takeaway (e.g. date/time) so users can scan
- Button labels should be specific ("Sign Me Up", "Watch Demo") rather than generic ("Learn More", "Click Here")
