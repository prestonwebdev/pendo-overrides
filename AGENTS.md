# Pendo Guide Override Development

This repository contains modular CSS/JS overrides for Pendo in-product guides. When working on these files, read `pendo-override-components.md` for the full component reference and `.claude/skills/pendo-overrides/SKILL.md` for domain-specific patterns and pitfalls.

## Critical Context

- **CSS** runs in both the Pendo designer and the live preview
- **JS** only runs in the live preview, NOT in the designer's visual editor
- Any DOM elements created by JS will not exist in the designer — always provide CSS fallbacks
- Pendo frequently overwrites inline styles — use `!important` and re-apply via MutationObserver
- Poll question text (`._pendo-text-paragraph[data-pendo-poll-id]`) sits OUTSIDE `._pendo-row` elements
- Pendo rows are nested inside `.pendo-block-controls-wrapper` divs in the designer — they are NOT direct children of the container
- Pendo sets inline `max-width` on `<p>` elements — override with `max-width: 100% !important`
- Pendo's `.pendo-mock-flexbox-row` uses absolute positioning, not real flexbox — override with `display: flex !important`

## Double Padding Prevention

When a JS-created wrapper provides padding, CSS rules must exclude elements inside it:
```css
._pendo-step-container-styles ._pendo-row:not(.pendo-scroll-content *) {
  padding-left: 20px !important;
}
```

## File Structure

| Files | Guide Type | Key Features |
|-------|-----------|-------------|
| `pendo-guide-overrides.*` | Centered | Scroll container, header/footer, animation, brand colors |
| `tooltip-guide-overrides.*` | Tooltip | Brand buttons (primary + secondary), close pill |
| `banner-guide-overrides.*` | Banner | Icon positioning, text truncation, translucent close |
| `bottom-right-guide-overrides.*` | Bottom-right | Full-bleed images, slide-in animation, poll padding |
| `dark-guide-overrides.*` | Dark multi-step | White close pill, progress bar, text-wrap improvements |

## Content Guidelines

- Heading: ~40 characters max
- Body text: ~200 characters max
- Button label: ~15 characters max
- Banner text: ~80 characters max
- Poll question: ~60 characters max
