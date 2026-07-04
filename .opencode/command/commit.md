---
description: Commit pending changes grouped into logical commits using folder hierarchy
---

Review the pending changes and create logical commits, grouping related files together. Do NOT create a commit for every single file — group them meaningfully.

## Steps

1. Run `git status --porcelain` and `git diff --stat` to see all pending changes.
2. Analyze the changed files and group them into logical commits using these rules:

   **Group by folder hierarchy depth (top-down):**
   - For each changed file, determine its depth: root = 0, `foo/` = 1, `foo/bar/` = 2, etc.
   - Group files that share the same top-level directory together. Files under `services/api/` and `services/web/` both belong to the `services` group at depth 1.
   - Root-level files (depth 0) form their own group.

   **Sub-group by type within each folder group:**
   - Source code (`**/*.ts`, `**/*.js`, `**/*.py`, etc.)
   - Config files (`package.json`, `tsconfig.json`, `*.config.*`, etc.)
   - Lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) — always commit these with their corresponding config changes, not alone
   - Documentation (`README.md`, `*.md`)

   **Merge small groups:**
   - If a folder group has only 1-2 changed files, combine it with its nearest parent group. Don't create separate commits for trivial changes.
   - If all changes are within a single subtree (e.g., only `services/api/` has changes), just use that folder name as scope.

3. For each group, run `git add <files>` then `git commit` with a message that:
   - Starts with a verb in imperative mood (add, fix, update, refactor, remove, etc.)
   - Uses the topmost changed folder as scope when relevant: `feat(services): ...` or `fix(api): ...`
   - For root-level changes, omit the scope: `docs: ...` or `chore: ...`
   - Keep the first line under 72 characters

4. After all commits, run `git status` to confirm nothing is left unstaged, then show the recent commits with `git log --oneline -10`.

## Commit message format

```
<type>(<scope>): <short description>

type: feat | fix | refactor | docs | chore | style | test
scope: <folder-name> — derive from the changed files, omit for root-level changes
```

If there is a mix of feat, fix, and refactor changes within a single group, pick the most significant type. Prefer `feat` > `fix` > `refactor` > `chore`.

Do NOT ask for confirmation — just make the commits.
