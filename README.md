# Football Guess Game

Weekly football prediction game for a small group of friends (5–10 users).

**Stack:** Next.js · Supabase · Vercel

## Design docs

| Doc | Contents |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Full architecture, schema, auth, APIs, UI, roadmap |
| [docs/SCORING_EXAMPLES.md](docs/SCORING_EXAMPLES.md) | Point system matrix |
| [src/lib/scoring.ts](src/lib/scoring.ts) | Canonical TypeScript scoring helpers |
| [supabase/migrations/20260723000000_init.sql](supabase/migrations/20260723000000_init.sql) | Database DDL + seed data |

## Product summary

- No registration / no passwords — pick a predefined username
- Predict **match result** + **over/under 2.5** for every match of the week
- Predictions lock when the first match kicks off
- Derby matches (FB / GS / BJK / TS) score **2×**
- Exactly one **bonus** match per week (never a derby): both correct = **6**, else **0**
- Standings: points, correct result, correct O/U, perfects, success %

## Supported teams

Fenerbahçe · Galatasaray · Beşiktaş · Trabzonspor · Başakşehir · Göztepe

## Status

Architecture and database schema are documented. Application code is not implemented yet — see the MVP roadmap in `docs/ARCHITECTURE.md`.

## Quick start (when implementing)

1. Create a Supabase project and run the init migration.
2. Create a Next.js App Router app with the folder layout in the architecture doc.
3. Set env vars from `.env.example`.
4. Deploy to Vercel; share the private URL with friends.
5. Replace seed player names in SQL (or via admin UI).

## Environment

Copy `.env.example` → `.env.local` and fill in Supabase + session secret values.
