# Pendo Overrides

This repository contains modular CSS/JS overrides for Pendo in-product guides.

## Key Files

- `pendo-override-components.md` — Full component reference with code snippets, dependencies, and customization notes
- `.claude/skills/pendo-overrides/SKILL.md` — Domain-specific patterns, DOM structure, and common pitfalls
- `AGENTS.md` — Context file for Codex and other AI code generators

## Working on Overrides

Always read `pendo-override-components.md` before creating or modifying overrides. The most common mistakes are:

1. Forgetting that JS doesn't run in the Pendo designer
2. Double padding from CSS + JS scroll wrapper
3. Targeting `._pendo-row` when poll questions use `._pendo-text-paragraph`
4. Using bare `img` selectors that match Pendo editor UI icons
5. Not scoping footer styles with `:not(.pendo-scroll-content *)`

When debugging, ask the user to run diagnostic scripts in the **browser** DevTools console, not the terminal.
