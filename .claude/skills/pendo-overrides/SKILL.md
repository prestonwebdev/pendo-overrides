---
name: pendo-overrides
description: Domain-specific context for building Pendo guide CSS/JS overrides. Use when creating, modifying, or debugging custom Pendo guide styling, layout, animations, close buttons, progress bars, or brand color theming. Covers designer vs preview differences, DOM structure quirks, and common pitfalls.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Grep, Glob
---

# Pendo Guide Override Development

You are assisting with custom CSS and JS overrides for Pendo in-product guides. This skill contains hard-won domain knowledge about Pendo's DOM structure, designer limitations, and proven patterns.

**Always read the component reference first:**
- `pendo-override-components.md` — Full breakdown of all override components with code snippets
- Existing override files in the project root for working examples

## Critical: Designer vs Preview

The #1 source of bugs. Understand this before writing any code.

- **CSS** runs in both the Pendo designer and the live preview
- **JS** only runs in the live preview, NOT in the designer's visual editor
- Any DOM elements created by JS (scroll wrappers, close button pills, progress bars) will not exist in the designer
- Always provide CSS fallbacks for JS-created styling so the designer looks reasonable

## Pendo DOM Structure

### Key selectors
- `._pendo-step-container-styles` — main guide container
- `._pendo-step-container-size` — sizing/positioning parent (used for centering)
- `._pendo-row` — content rows (header, body, footer)
- `.bb-button` — Pendo building block buttons
- `._pendo-button-primaryButton` — primary action buttons
- `._pendo-button-secondaryButton` — secondary action buttons
- `._pendo-button-custom` — custom-styled buttons
- `._pendo-text-paragraph` — standalone text blocks (e.g. poll questions); these are NOT `._pendo-row` elements
- `._pendo-text-title` — title/heading text blocks
- `._pendo-text-custom` — custom text blocks
- `._pendo-text-plain` — inner `<p>` elements where Pendo sets inline `max-width`
- `._pendo-simple-text` — inner `<div>` text wrapper
- `._pendo-image` — content images (NOT editor UI icons)
- `.pendo-mock-flexbox-row` — Pendo's fake flexbox layout inside rows
- `.pendo-mock-flexbox-element` — individual flex items in the mock layout
- `.pendo-code-block` — HTML code building blocks
- `.pendo-block-controls-wrapper` — designer wrapper around each block (with interleaved `.pendo-add-bb-container` elements)

### Structure gotchas

1. **Rows are NOT direct children of the container** in the designer. They're nested inside `.pendo-block-controls-wrapper` divs. Use `getTopLevelAncestor()` to walk up from a row to its direct-child wrapper.

2. **Poll question text sits OUTSIDE `._pendo-row`** — it's a standalone `._pendo-text-paragraph` with `[data-pendo-poll-id]`. Different poll types use different classes (`._pendo-number-scale-poll-question`, `._pendo-yes-no-poll-question`), but all have `[data-pendo-poll-id]`.

3. **Pendo's mock flexbox is not real flexbox** — `.pendo-mock-flexbox-row` uses absolute positioning internally. Override with `display: flex !important` when you need real flex behavior.

4. **Pendo sets inline `max-width` on `<p>` elements** — override with `._pendo-text-plain { max-width: 100% !important }`.

5. **Code blocks are separate top-level elements** — HTML code blocks (`.pendo-code-block`) live in their own `.pendo-block-controls-wrapper` outside any row. Their parent wrapper often collapses to 0px height. To position them (e.g. icons), absolutely position the wrapper itself, not just the code block.

## Common Patterns

### Double padding prevention
When a JS-created wrapper provides padding, CSS rules must exclude elements inside that wrapper:
```css
/* Only apply when NOT inside the scroll wrapper */
._pendo-step-container-styles ._pendo-row:not(.pendo-scroll-content *) {
  padding-left: 20px !important;
  padding-right: 20px !important;
}
```

### Footer scoping
Footer styles target `._pendo-row:has(.bb-button)`, which matches ANY row with a button. Scope to exclude the scroll content area:
```css
._pendo-step-container-styles ._pendo-row:has(.bb-button):not(.pendo-scroll-content *) {
  /* footer styles */
}
```

### Pendo inline style override
Pendo sets inline styles on hover via its own JS. CSS `:hover` can't beat inline styles even with `!important`. Use JS `mouseenter`/`mouseleave` listeners with `setProperty("property", value, "important")`.

### Image scoping
Always use `._pendo-image img` instead of bare `img` to avoid matching Pendo editor UI icons.

### Animation pattern
CSS defines the initial hidden state and transition. JS adds a class after a delay:
```css
._pendo-step-container-styles {
  opacity: 0;
  transform: translateY(16px); /* or translateX for slide-in */
  transition: opacity 320ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 320ms cubic-bezier(0.4, 0, 0.2, 1);
}
._pendo-step-container-styles.pendo-animate-in {
  opacity: 1;
  transform: translateY(0);
}
```

### Close button pill pattern
JS wraps Pendo's native close button in a custom div, replaces content with an SVG X icon, and adds keyboard/click handlers. The pill wrapper class is `.pendo-close-circle-wrap`. Always check `container.dataset.pendoCloseScoped` to avoid re-processing.

### Brand colors pattern
Read `ba-theme` JSON attribute from `<body>`, parse to get color shades (keys: 100, 300, 500, 900), set CSS custom properties (`--pendo-brand-base`, etc.). Always provide CSS fallback values: `var(--pendo-brand-base, #287411)`.

### MutationObserver pattern
Pendo frequently re-renders guide DOM. Use a debounced MutationObserver on `document.body` with `{ childList: true, subtree: true }`. Disconnect when no guide is visible to avoid unnecessary work.

### Scrollable content pattern
For fixed header/footer with scrollable middle:
1. Find header row (`[data-_pendo-row-1]`) and footer row (last row with `.bb-button`)
2. Walk up to their top-level wrappers using `getTopLevelAncestor()`
3. Wrap everything between them in a scroll div
4. Set container to `display: flex; flex-direction: column; max-height: Npx; overflow: hidden`

### Progress bar pattern
Uses `pendo.guides` API. Iterate guides, find one where `guide.isShown()` is true, read `guide.steps.length` and find current step via `step.isShown()`. Note: `pendo.guides` may not be populated immediately — use a retry loop (poll every 250ms, up to 10s).

## Text Improvements
- `text-wrap: balance` on headings — evens out line lengths
- `text-wrap: pretty` on body text — prevents orphan words
- Override `max-width` on `._pendo-text-plain` and `._pendo-simple-text` to prevent Pendo's builder-set constraints

## Close Button Variants

| Variant | Background | Border | Stroke | Use case |
|---------|-----------|--------|--------|----------|
| Standard | `#ffffff` | `1px solid #c6c2bf` | `#3b3737` | Light backgrounds |
| Banner | `rgba(255,255,255,0.01)` | `1.3px solid rgba(255,255,255,0.3)` | `#ffffff` | Colored/dark banners |
| Dark | `transparent` | `1.3px solid rgba(255,255,255,0.4)` | `#ffffff` | Dark guide backgrounds |

## Guide Type Quick Reference

| Type | File prefix | Animation | Close alignment | Brand colors | Special features |
|------|------------|-----------|-----------------|-------------|-----------------|
| Centered | `pendo-guide` | slideUp | Centered | Yes | Scroll container, header/footer bars |
| Tooltip | `tooltip-guide` | None | All | Yes (pri + sec) | Minimal, no layout overrides |
| Banner | `banner-guide` | None | All (abs pos) | No | Icon positioning, text truncation |
| Bottom-right | `bottom-right-guide` | slideRight (2s) | Bottom Right Aligned | No | Full-bleed images, poll padding |
| Dark multi-step | `dark-guide` | None | All | No | Progress bar, text-wrap improvements |

## Content Guidelines

| Element | Max Characters | Rationale |
|---------|---------------|-----------|
| Heading | ~40 | Single line at most guide widths |
| Body text | ~200 | 3-4 lines, scannable without scrolling |
| Button label | ~15 | Fits without truncation |
| Banner text | ~80 | Single line with ellipsis truncation |
| Poll question | ~60 | Single line, clear and direct |

## Debugging

When troubleshooting layout issues, provide the user with a DOM dump script that logs element structure, computed styles, and dimensions. Key things to check:
- Computed `padding`, `margin`, `max-width` on text elements
- Whether elements are inside or outside `._pendo-row`
- Whether JS-created wrappers exist (`.pendo-scroll-content`, `.pendo-close-circle-wrap`, `.pendo-progress-wrap`)
- `data-vertical-alignment` attribute on `._pendo-step-container-size`
- Whether `pendo.guides` is populated and `guide.isShown()` returns true

Always ask the user to run diagnostics in the **browser** DevTools console, not the terminal.
