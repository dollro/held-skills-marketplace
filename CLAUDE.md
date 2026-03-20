# Claude Marketplace

Curated registry of Claude Code plugins (skills + agents) maintained by Held.

## Project Structure

```
.claude-plugin/marketplace.json   ← central registry of all plugins
plugins/<name>/
  .claude-plugin/plugin.json      ← plugin manifest (name, description, version)
  skills/<skill-name>/SKILL.md    ← skill definition (frontmatter + instructions)
  skills/<skill-name>/references/ ← supporting reference docs (optional)
  skills/<skill-name>/resources/  ← resource files (optional)
  agents/<agent-name>.md          ← agent definitions (optional)
```

## Plugin Categories

- **ai-agent-dev-tools** — ai-dev, prompt-engineering
- **workflows** — agent-team, braindump2spec, brainstorming, branch, code-review, spec2plan
- **development** — electron-dev, fullstack-dev, pencil-pen-generator, uiux-design-penpot, uiux-design-tailwindv4, uiux-design-vue3, uiux-design-system, uiux-image2design
- **analysis** — equity-research

## Conventions

### Adding a Plugin

1. Create `plugins/<name>/.claude-plugin/plugin.json` with `name`, `description`, `version`
2. Create `plugins/<name>/skills/<skill-name>/SKILL.md` with frontmatter (`name`, `description`) and instructions
3. Register in `.claude-plugin/marketplace.json` under `plugins[]` with: `name`, `source`, `description`, `version`, `category`, `tags`, `keywords`

### SKILL.md Format

```markdown
---
name: <skill-name>
description: <one-line trigger description>
---

<skill instructions>
```

### Versioning

- Version each plugin independently in both `plugin.json` and `marketplace.json`
- Bump version when changing skill content, not just references

### Commit Messages

Follow conventional commits scoped to the plugin name:
- `feat(<plugin>): <description>` — new features or major content additions
- `fix(<plugin>): <description>` — corrections, alignment fixes
- `chore(<plugin>): <description>` — version bumps, housekeeping
- `fix(marketplace): <description>` — registry-level changes
