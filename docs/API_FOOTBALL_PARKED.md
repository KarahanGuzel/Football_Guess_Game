# API-Football — parked (resume later)

Free plan bağlandı ama **2026 sezonuna izin vermiyor** (`try from 2022 to 2024`).
Prod’dan UI/client kaldırıldı; tam çalışan kod ayrı branch’te saklı.

## Where the code is

Branch: **`cursor/api-football-parked-2063`**

Snapshot tip: post–PR #37 + #38 (connection test, RapidAPI support, preview sync).

Also on that branch:

- `src/lib/api-football.ts`
- `src/lib/match-preview-*.ts`
- `src/components/match-preview-card.tsx`
- Admin: Bağlantıyı test et / İpuçlarını çek
- Home + Gelecek preview cards

DB migration already applied on Supabase (keep it):

- `supabase/migrations/20260731140000_match_previews.sql`
  - `match_previews` table
  - `teams.api_football_id`
  - `matches.api_football_fixture_id`

## Why parked

API-Football Free: endpoints OK, but season access limited to ~2022–2024.
Süper Lig 2026/27 (`API_FOOTBALL_SEASON=2026`) needs a **paid plan**.

## Resume checklist (when Pro is bought)

1. `git checkout cursor/api-football-parked-2063` (or merge that branch into a new PR onto `main`)
2. Vercel Production env (no git branch filter):
   - `API_FOOTBALL_KEY`
   - `API_FOOTBALL_PROVIDER=apisports`
   - `API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io`
   - `API_FOOTBALL_LEAGUE_ID=203`
   - `API_FOOTBALL_SEASON=2026`
3. Redeploy Production
4. Admin → week → **Bağlantıyı test et** → **İpuçlarını çek**

## Later nice-to-have (not built)

Auto week/fixture sync from one league fixtures request for our team pool — still deferred after previews.
