# Proposed Next.js app tree (not scaffolded yet)

See docs/ARCHITECTURE.md §6 for the full target layout.

This repo currently contains:

```
docs/                  architecture + UI + scoring examples
supabase/migrations/   Postgres DDL + seeds
src/lib/scoring.ts     canonical scoring helpers
src/types/session.ts   session shape placeholder
.env.example
README.md
```

Implement the App Router under `src/app/` in subsequent PRs.
