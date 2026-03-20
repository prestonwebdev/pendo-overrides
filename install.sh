#!/bin/bash
# ==========================================================================
# Pendo Overrides Skill Installer
#
# Installs the pendo-overrides skill for Claude Code, Codex, and other
# AI coding agents.
#
# Usage: curl -sL https://raw.githubusercontent.com/prestonwebdev/pendo-overrides/main/install.sh | bash
# ==========================================================================

set -e

SKILL_NAME="pendo-overrides"
CANONICAL="$HOME/.agents/skills/$SKILL_NAME"
LINKED=0

echo ""
echo "🔧 Installing $SKILL_NAME skill..."
echo ""

# 1) Create canonical skill directory
mkdir -p "$CANONICAL"

# 2) Download skill files from GitHub
REPO_RAW="https://raw.githubusercontent.com/prestonwebdev/pendo-overrides/main"

echo "  Downloading skill files..."
curl -sL "$REPO_RAW/.claude/skills/pendo-overrides/SKILL.md" -o "$CANONICAL/SKILL.md"
curl -sL "$REPO_RAW/AGENTS.md" -o "$CANONICAL/AGENTS.md"
curl -sL "$REPO_RAW/pendo-override-components.md" -o "$CANONICAL/pendo-override-components.md"

echo "  Saved to $CANONICAL"

# 3) Link to Claude Code
if [ -d "$HOME/.claude" ]; then
  CLAUDE_DIR="$HOME/.claude/skills/$SKILL_NAME"
  mkdir -p "$HOME/.claude/skills"
  rm -rf "$CLAUDE_DIR"
  ln -s "$CANONICAL" "$CLAUDE_DIR"
  echo "  ✓ Linked to Claude Code (~/.claude/skills/$SKILL_NAME)"
  LINKED=$((LINKED + 1))
else
  echo "  - Claude Code not detected (no ~/.claude directory)"
fi

# 4) Link to Codex
if command -v codex &> /dev/null || [ -d "$HOME/.codex" ]; then
  CODEX_DIR="$HOME/.codex/skills/$SKILL_NAME"
  mkdir -p "$HOME/.codex/skills"
  rm -rf "$CODEX_DIR"
  ln -s "$CANONICAL" "$CODEX_DIR"
  echo "  ✓ Linked to Codex (~/.codex/skills/$SKILL_NAME)"
  LINKED=$((LINKED + 1))
else
  echo "  - Codex not detected"
fi

echo ""
if [ $LINKED -gt 0 ]; then
  echo "✅ Installed! Linked to $LINKED agent(s)."
  echo ""
  echo "The skill provides Pendo guide override context including:"
  echo "  • DOM structure and selector reference"
  echo "  • Designer vs preview differences"
  echo "  • Common patterns (scroll containers, close buttons, progress bars)"
  echo "  • Content guidelines and debugging tips"
  echo ""
  echo "Use /pendo-overrides in Claude Code to invoke it directly."
else
  echo "⚠️  No supported agents detected, but files saved to $CANONICAL"
  echo "   You can manually symlink or copy to your agent's skills directory."
fi
echo ""
