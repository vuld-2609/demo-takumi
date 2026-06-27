<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Git workflow (branching)

- **A new screen / new feature MUST start from `main`.** Run `git checkout main && git pull`, then create a fresh branch: `git checkout -b feat/<slug>` (use `fix/<slug>` for bug fixes). Never build a new screen/feature directly on `main` or on an unrelated existing branch.
- One feature = one branch, kept focused so it can be **squash-merged into `main`** cleanly via a PR with no conflicts.
- Push the feature branch and open a PR targeting `main`; do not push directly to `main`.
