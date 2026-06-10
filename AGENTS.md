# shareMall

## Repo state

No application code yet — this is a blank scaffold with OpenCode's OpenSpec workflow configured.

## Workflow

Changes go through the OpenSpec experimental workflow via custom commands:

1. `/opsx-propose <name>` — create a change (proposal, design, tasks)
2. `/opsx-apply <name>` — implement tasks
3. `/opsx-archive <name>` — finalize and archive

Use `/opsx-explore` to think through ideas before proposing changes.

Requires `openspec` CLI.

## Structure

- `.opencode/skills/` — OpenSpec workflow skills (propose, apply, archive, explore)
- `.opencode/commands/` — corresponding custom command definitions
- `.opencode/.gitignore` ignores `node_modules`, `package.json`, `package-lock.json`, `bun.lock`, and itself

## Dependencies

- `@opencode-ai/plugin` v1.14.33 (managed under `.opencode/`)
