# Pendo Guide Overrides

Modular CSS/JS overrides for customizing Pendo in-product guides. Includes a skill for AI coding agents (Claude Code, Codex) that provides domain-specific context for building and debugging overrides.

## Install the AI Skill

```bash
curl -sL https://raw.githubusercontent.com/prestonwebdev/pendo-overrides/main/install.sh | bash
```

This installs the Pendo overrides skill for **Claude Code** and **Codex** so they understand Pendo's DOM structure, designer vs preview differences, and proven override patterns.

## What's Included

### Override Files

| Files | Guide Type | Features |
|-------|-----------|----------|
| `pendo-guide-overrides.*` | Centered | Scrollable content, fixed header/footer, animation, brand colors |
| `tooltip-guide-overrides.*` | Tooltip | Brand-colored primary + secondary buttons, close pill |
| `banner-guide-overrides.*` | Banner | Inline icon, text truncation, translucent close pill |
| `bottom-right-guide-overrides.*` | Bottom-right | Full-bleed images, slide-in animation, poll question padding |
| `dark-guide-overrides.*` | Dark multi-step | White close pill, step progress bar, text-wrap improvements |

### Documentation

- **`pendo-override-components.md`** — Full component reference with standalone CSS/JS snippets for each override. Mix and match to build new guide types.

### AI Context Files

| File | Used By |
|------|---------|
| `.claude/skills/pendo-overrides/SKILL.md` | Claude Code |
| `AGENTS.md` | Codex |
| `CLAUDE.md` | Claude Code (project-level) |

## Override Components

Each override is independent and can be mixed into any guide type:

- **Brand Colors** — CSS custom properties from customer theme
- **Primary/Secondary Button Hover** — Overrides Pendo's inline hover styles
- **Slide-Up/Slide-In Animation** — CSS transition triggered by JS
- **Close Button Pill** — Standard, banner (translucent), and dark (white) variants
- **Header/Footer Bar** — Fixed bars with brand theming
- **Scrollable Content** — JS-created scroll wrapper between header and footer
- **Progress Bar** — Reads `pendo.guides` API for step count
- **Content Padding** — Designer-safe padding with image-aware and poll-aware variants
- **Text Improvements** — `text-wrap: balance/pretty`, max-width overrides

See `pendo-override-components.md` for full code snippets and customization notes.

## Key Concepts

**Designer vs Preview** — CSS works in both. JS only runs in the preview. Always provide CSS fallbacks for JS-created elements.

**Double Padding** — When a JS scroll wrapper provides padding, use `:not(.pendo-scroll-content *)` on CSS rules to prevent stacking.

**Poll Questions** — These use `._pendo-text-paragraph[data-pendo-poll-id]` and sit outside `._pendo-row` elements. They need separate padding rules.

**Pendo Inline Styles** — Pendo sets styles via JS on hover. CSS `:hover` can't override inline styles. Use JS `mouseenter`/`mouseleave` with `setProperty()`.

## Content Guidelines

| Element | Max Characters |
|---------|---------------|
| Heading | ~40 |
| Body text | ~200 |
| Button label | ~15 |
| Banner text | ~80 |
| Poll question | ~60 |
