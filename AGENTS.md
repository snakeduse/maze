## Codex Planning Workflow

Before adding a new feature, read:

- `docs/codex/ROADMAP.md`
- `docs/codex/CHANGELOG.md`
- current source code

When the user asks "what is next?", "continue", or "plan next step":

1. Inspect the current code.
2. Compare the code with `docs/codex/ROADMAP.md`.
3. Propose the next small task.
4. Do not implement it immediately unless the user asks to implement it.
5. The task must be small and safe.
6. The task must include:
   - goal;
   - files likely to change;
   - acceptance criteria;
   - checks to run;
   - things not to do.

When implementing a task:

1. Keep existing behavior working.
2. Make the smallest useful change.
3. Run `npm run build`.
4. Fix build errors.
5. Update `docs/codex/CHANGELOG.md`.
6. Update `README.md` if user-visible behavior changed.
