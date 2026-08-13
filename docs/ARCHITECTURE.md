# Football Guess Game — Architecture & Design

Hobby weekly prediction app for 5–10 friends.  
Stack: **Next.js (App Router) · Supabase Postgres · Vercel**

Design priorities: simplicity, maintainability, free-tier hosting. Not a commercial product.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Friends (browser)                    │
│              Private URL (Vercel deployment)             │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────┐
│                 Vercel · Next.js App Router              │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Server Comp. │  │ Server       │  │ Route Handlers │ │
│  │ + Pages      │  │ Actions      │  │ (auth, admin)  │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────┘ │
│         │                 │                    │         │
│         └────────────┬────┴────────────────────┘         │
│                      │                                    │
│         ┌────────────▼────────────┐                      │
│         │ Cookie session          │                      │
│         │ (iron-session / jose)   │                      │
│         │ player_id + is_admin    │                      │
│         └────────────┬────────────┘                      │
│                      │                                    │
│         ┌────────────▼────────────┐                      │
│         │ Supabase JS (server)    │                      │
│         │ SERVICE_ROLE key only   │                      │
│         └────────────┬────────────┘                      │
└──────────────────────┼──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Supabase (free tier)                        │
│              Postgres + (optional) Storage               │
│              RLS ON · no anon policies                   │
│              Browser never talks to Supabase directly    │
└─────────────────────────────────────────────────────────┘
```

### Why this shape

| Decision | Reason |
|---|---|
| Server-only Supabase access | No client keys, no complex RLS policies for a 10-user app |
| Cookie session (not Supabase Auth) | Username picker, no passwords, no registration — Auth would fight the product |
| Server Actions for mutations | Less boilerplate than REST for a small app; Route Handlers only where needed |
| Computed standings view | Avoid denormalized leaderboard tables until proven necessary |
| Predefined `players` rows | Matches “no registration” requirement |

### Free-tier notes

- **Vercel Hobby**: fine for this traffic.
- **Supabase Free**: one project, Postgres, plenty of headroom for ~10 users.
- No Edge Functions, Cron, Realtime, or Storage required for MVP.
- Optional later: Vercel Cron to auto-lock weeks at kickoff (MVP locks on write + admin “lock” or first kickoff check).

---

## 2. Domain Model & Business Rules

### Supported teams

| Team | Derby club? |
|---|---|
| Fenerbahçe | Yes |
| Galatasaray | Yes |
| Beşiktaş | Yes |
| Trabzonspor | Yes |
| Başakşehir | No |
| Göztepe | No |

Only matches involving these teams are entered by admin (both sides must be in this set).

### Derby detection

```
is_derby(home, away) :=
  home.is_derby_club = true AND away.is_derby_club = true
```

Stored on `matches.is_derby` at insert/update time (denormalized for queries/UI).  
DB check constraint: `NOT (is_bonus AND is_derby)`.

### Prediction markets (per match)

1. **Result**: `home` | `draw` | `away`
2. **Goals**: `under_25` | `over_25` (2.5 line)

Rules:

- Every match in the week must have both fields set.
- Users may edit freely while the week is open.
- **Lock**: when the first match of the week kicks off (`MIN(kickoff_at)`). After that, predictions are read-only.

### Point system

**Normal match**

| Outcome | Points |
|---|---|
| Result correct only | 2 |
| Over/Under correct only | 1 |
| Both correct (perfect) | 4 |
| Neither | 0 |

**Derby** (not bonus): multiply the above by **2**  
→ perfect derby = **8**, result-only = **4**, O/U-only = **2**.

**Bonus match** (exactly one per week, never a derby)

| Outcome | Points |
|---|---|
| Both correct | 6 |
| Anything else | 0 |

Bonus and derby are mutually exclusive by rule and by DB constraint.

### Scoring algorithm (canonical)

```ts
function actualResult(homeGoals: number, awayGoals: number): 'home' | 'draw' | 'away' {
  if (homeGoals > awayGoals) return 'home';
  if (homeGoals < awayGoals) return 'away';
  return 'draw';
}

function actualGoalsMarket(homeGoals: number, awayGoals: number): 'under_25' | 'over_25' {
  return homeGoals + awayGoals > 2.5 ? 'over_25' : 'under_25';
}

function scorePrediction(p: Prediction, m: Match): number {
  const resultOk = p.result === actualResult(m.home_goals!, m.away_goals!);
  const ouOk = p.goals_market === actualGoalsMarket(m.home_goals!, m.away_goals!);

  if (m.is_bonus) {
    return resultOk && ouOk ? 6 : 0;
  }

  let points = 0;
  if (resultOk && ouOk) points = 4;
  else if (resultOk) points = 2;
  else if (ouOk) points = 1;

  if (m.is_derby) points *= 2;
  return points;
}
```

### Standings aggregates

Computed over all **scored** predictions (matches with final scores and calculated points):

| Column | Definition |
|---|---|
| Total Points | `SUM(points_earned)` |
| Correct Result Count | `COUNT` where `result_correct` |
| Correct Over/Under Count | `COUNT` where `goals_correct` |
| Perfect Prediction Count | `COUNT` where both correct (bonus perfect counts) |
| Success Percentage | `ROUND(100.0 * perfect_count / total_scored_predictions, 1)` |

Ranking: `total_points DESC`, tie-break `perfect_count DESC`, then `display_name ASC`.

### Week lifecycle

```
draft → open → locked → scored
         ↑       ↑         ↑
    admin opens  first    admin enters
    for guessing kickoff  scores + calculate
```

- `draft`: admin building fixtures; users don’t see as “current”.
- `open`: predictions editable.
- `locked`: auto when `now() >= MIN(kickoff_at)`, or admin force-lock; predictions frozen.
- `scored`: all finished matches scored and points written.

---

## 3. Database Schema

### ERD

```
┌──────────────┐       ┌──────────────────┐
│   teams      │       │     players      │
│──────────────│       │──────────────────│
│ id (PK)      │       │ id (PK)          │
│ name         │       │ display_name     │
│ short_name   │       │ slug (unique)    │
│ is_derby_club│       │ is_admin         │
│ sort_order   │       │ is_active        │
└──────┬───────┘       │ created_at       │
       │               └────────┬─────────┘
       │                        │
       │         ┌──────────────┼──────────────┐
       │         │              │              │
┌──────▼─────────▼──┐    ┌──────▼──────┐       │
│      weeks        │    │ predictions │◄──────┘
│───────────────────│    │─────────────│
│ id (PK)           │    │ id (PK)     │
│ label             │    │ player_id   │──┐
│ status            │    │ match_id    │──┤
│ notes             │    │ result      │  │
│ created_at        │    │ goals_market│  │
└─────────┬─────────┘    │ result_ok   │  │
          │              │ goals_ok    │  │
          │              │ points      │  │
┌─────────▼─────────┐    │ updated_at  │  │
│      matches      │    └─────────────┘  │
│───────────────────│                     │
│ id (PK)           │◄────────────────────┘
│ week_id (FK)      │
│ home_team_id (FK) │──► teams
│ away_team_id (FK) │──► teams
│ kickoff_at        │
│ is_bonus          │
│ is_derby          │
│ home_goals        │
│ away_goals        │
│ status            │
└───────────────────┘
```

### Tables (summary)

See `supabase/migrations/20260723000000_init.sql` for full DDL.

| Table | Purpose |
|---|---|
| `teams` | Seeded Turkish clubs |
| `players` | Predefined users (+ admin flag) |
| `weeks` | Competition weeks + lifecycle status |
| `matches` | Fixtures, bonus/derby flags, scores |
| `predictions` | Per-player per-match picks + earned points |

### Key constraints

- `matches`: `home_team_id <> away_team_id`
- `matches`: `NOT (is_bonus AND is_derby)`
- Partial unique: **at most one** `is_bonus = true` per `week_id`
- `predictions`: `UNIQUE (player_id, match_id)`
- Enums via `CHECK` or Postgres enums for result / goals market / statuses
- FK indexes on all foreign keys

### Indexes

- `matches(week_id)`, `matches(kickoff_at)`
- `predictions(player_id)`, `predictions(match_id)`
- `weeks(status)` for “current week” lookup
- Unique `(player_id, match_id)`

### Views

- `standings` — aggregated leaderboard
- `week_lock_at` — `week_id`, `lock_at = MIN(kickoff_at)` helper (or function)

---

## 4. Authentication Approach

**No Supabase Auth. No passwords. No registration page.**

### Flow

1. Admin seeds `players` rows in SQL (or admin UI later).
2. `/login` lists active players (`SELECT id, display_name FROM players WHERE is_active`).
3. User selects a name → `POST` login Server Action.
4. Server sets an **HTTP-only, Secure, SameSite=Lax** signed cookie:

```ts
session = { playerId: string, isAdmin: boolean, displayName: string }
```

5. Middleware protects all routes except `/login`.
6. Logout clears the cookie.

### Library

Prefer **`iron-session`** (sealed cookie) or **`jose`** (JWT in cookie) with `SESSION_SECRET` in Vercel env.

### Admin gate

`players.is_admin = true` → can access `/admin/*`.  
Same cookie; middleware checks `isAdmin`.

### Security posture (hobby-honest)

- Obscurity of the Vercel URL is the main gate.
- Anyone with the URL can pick any username (including admin if they know who is admin).
- Acceptable for friends; if needed later: shared invite PIN on login, or password only for admin.

**Do not** put `SERVICE_ROLE` in `NEXT_PUBLIC_*` vars.

---

## 5. API Surface

Prefer **Server Actions** for mutations. Thin Route Handlers only if needed for clients/tools.

### Auth

| Action / Route | Method | Description |
|---|---|---|
| `login(playerId)` | SA | Set session cookie |
| `logout()` | SA | Clear session |

### Player

| Action | Description |
|---|---|
| `getCurrentWeek()` | Open/locked week + matches + my predictions |
| `upsertPredictions(weekId, items[])` | Save all picks; reject if locked or incomplete |
| `getStandings()` | Leaderboard view |
| `getPastWeeks()` | List scored/locked weeks |
| `getWeekDetail(weekId)` | Results + all users’ predictions + points |
| `getNextWeekFixtures()` | Next `draft`/`upcoming` week read-only |

### Admin

| Action | Description |
|---|---|
| `createWeek(label)` | New week `draft` |
| `addMatch(weekId, payload)` | Fixture; auto-set `is_derby`; reject bonus+derby |
| `setBonusMatch(matchId)` | Clear other bonuses in week; enforce not derby |
| `openWeek(weekId)` | `draft → open` |
| `lockWeek(weekId)` | Force lock |
| `enterScore(matchId, home, away)` | Final score |
| `calculateWeekPoints(weekId)` | Score all predictions; set week `scored` |

### Lock enforcement (server)

```ts
async function assertWeekEditable(weekId: string) {
  const lockAt = await getWeekLockAt(weekId); // MIN(kickoff_at)
  if (!lockAt || new Date() >= lockAt) throw new Error('WEEK_LOCKED');
  // also reject if status in ('locked','scored')
}
```

On every prediction write, re-check lock. UI also disables controls, but server is source of truth.

### Completeness rule

`upsertPredictions` must receive exactly one prediction for **every** match in the week. Reject partial saves.

---

## 6. Folder Structure

```
/
├── docs/
│   └── ARCHITECTURE.md          ← this file
├── supabase/
│   └── migrations/
│       └── 20260723000000_init.sql
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── login/page.tsx
│   │   ├── page.tsx                 ← Current Week
│   │   ├── standings/page.tsx
│   │   ├── history/
│   │   │   ├── page.tsx             ← Past weeks list
│   │   │   └── [weekId]/page.tsx
│   │   ├── fixtures/page.tsx        ← Next week (read-only)
│   │   └── admin/
│   │       ├── layout.tsx           ← admin gate
│   │       ├── page.tsx             ← week list / create
│   │       ├── weeks/[weekId]/page.tsx
│   │       └── calculate/page.tsx   ← optional shortcut
│   ├── components/
│   │   ├── nav.tsx
│   │   ├── match-row.tsx
│   │   ├── prediction-form.tsx
│   │   ├── bonus-badge.tsx
│   │   ├── derby-badge.tsx
│   │   ├── standings-table.tsx
│   │   └── admin/
│   │       ├── week-form.tsx
│   │       ├── match-form.tsx
│   │       └── score-form.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   └── server.ts            ← service-role client
│   │   ├── auth/
│   │   │   ├── session.ts
│   │   │   └── middleware.ts
│   │   ├── scoring.ts               ← pure point logic (+ unit tests)
│   │   ├── week-lock.ts
│   │   └── constants.ts             ← optional helpers
│   ├── types/
│   │   └── database.ts              ← generated or hand-written
│   └── middleware.ts                ← Next.js middleware entry
├── .env.example
├── package.json
└── README.md
```

---

## 7. UI Structure

Mobile-first, simple, few pages. Bottom or top nav after login:

| Route | Page | Behavior |
|---|---|---|
| `/login` | Username select | One tap enter |
| `/` | Current week | Match list; bonus highlighted; derby tagged; prediction radios; Save |
| `/standings` | Leaderboard | Sortable table of stats |
| `/history` | Past weeks | List → detail with results vs picks |
| `/fixtures` | Next week | Read-only fixtures if published as draft/upcoming |
| `/admin/*` | Admin | Create week, fixtures, bonus, scores, calculate |

### Current week UX rules

- Show lock countdown / lock timestamp.
- After lock: form disabled; show submitted picks.
- Incomplete state: Save disabled until all matches filled.
- Bonus match: visually distinct (label “BONUS · 6 pts if perfect”).
- Derby: label “DERBY · 2× points”.

### Suggested nav labels

`Bu Hafta` · `Puan Durumu` · `Geçmiş` · `Gelecek` · (Admin)

(Turkish UI optional; English fine for MVP.)

---

## 8. Standings Calculation Logic

1. Admin enters all final scores for the week.
2. Admin runs `calculateWeekPoints(weekId)`:
   - For each prediction joined to match with non-null scores:
     - Set `result_correct`, `goals_correct`, `points_earned` via `scorePrediction`.
   - Set week `status = 'scored'`.
3. Standings page reads `standings` view (or equivalent query).

Idempotent: re-running calculation overwrites prediction score columns (safe if scores corrected).

---

## 9. Derby Detection Logic

```ts
// lib/derby.ts
export function detectDerby(homeIsDerbyClub: boolean, awayIsDerbyClub: boolean): boolean {
  return homeIsDerbyClub && awayIsDerbyClub;
}
```

On `addMatch` / `updateMatch`:

1. Load both teams’ `is_derby_club`.
2. Set `matches.is_derby`.
3. If `is_bonus && is_derby` → reject.

Seeded once in SQL; no runtime list of names required after seed.

---

## 10. Bonus Match Logic

1. Admin marks exactly one match per week as bonus (`setBonusMatch`).
2. Implementation: transaction that sets all week matches `is_bonus = false`, then target `is_bonus = true`.
3. Guards:
   - Target must not be derby.
   - Week must not yet be `scored` (optional: allow change until `open` only).
4. UI shows bonus before predictions (visible in open week).
5. Scoring path short-circuits to 6-or-0 (see algorithm above).

DB backup: partial unique index on `(week_id) WHERE is_bonus`.

---

## 11. Environment Variables

```bash
# .env.example
NEXT_PUBLIC_APP_URL=http://localhost:3000

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server only

SESSION_SECRET=long-random-string-at-least-32-chars
```

No `NEXT_PUBLIC_SUPABASE_ANON_KEY` required if the browser never calls Supabase.

---

## 12. MVP Roadmap

### Phase 0 — Foundation
- Next.js app on Vercel
- Supabase project + run init migration
- Seed teams + 5–10 players (1 admin)
- Cookie auth + middleware
- Basic shell nav

### Phase 1 — Core play loop
- Admin: create week, add matches, set bonus, open week
- Player: current week predictions (full-week save)
- Lock check on write (`MIN(kickoff_at)`)
- Admin: enter scores + calculate points
- Standings page
- Past week detail

### Phase 2 — Polish
- Next week fixtures page
- Lock countdown UI
- Mobile layout pass
- Empty/error states
- Unit tests for `scoring.ts` and derby/bonus guards

### Phase 3 — Nice-to-haves (optional)
- Shared invite PIN on login
- Auto-lock via Vercel Cron
- Recalculate after score edits
- Export week results
- Simple dark/light theme
- **API-Football match previews (parked):** full implementation on branch `cursor/api-football-parked-2063`. Free plan blocks season 2026; resume after Pro — see `docs/API_FOOTBALL_PARKED.md`.
- **API-Football week fixture sync (later):** one league fixtures request for our pool teams → auto-create draft week + matches; then attach previews.

**Out of scope for hobby MVP:** public registration, payments, live odds APIs, push notifications, multi-league support, complex RLS per-user policies.

---

## 13. Testing Strategy (lightweight)

| Layer | What |
|---|---|
| Unit | `scorePrediction` matrix (normal / derby / bonus / miss) |
| Unit | `detectDerby` + bonus rejection |
| Integration (optional) | Server Action lock rejection with fake clock |
| Manual | Full week playthrough with 2 test users |

---

## 14. Implementation Order (suggested first PRs)

1. Schema migration + seed data  
2. Auth (login/logout/session)  
3. Admin week + match CRUD + bonus  
4. Prediction form + lock  
5. Scoring + standings + history  
6. Fixtures page + UI polish  

---

## Appendix A — Example week

| Match | Flags | Perfect points |
|---|---|---|
| Fenerbahçe vs Göztepe | — | 4 |
| Galatasaray vs Beşiktaş | DERBY | 8 |
| Trabzonspor vs Başakşehir | BONUS | 6 or 0 |
| Başakşehir vs Göztepe | — | 4 |

Invalid: marking Galatasaray vs Beşiktaş as BONUS (derby).

---

## Appendix B — Completeness check SQL sketch

```sql
-- Players missing predictions for an open week
select p.id, p.display_name
from players p
cross join matches m
left join predictions pr
  on pr.player_id = p.id and pr.match_id = m.id
where m.week_id = $week_id
  and p.is_active
group by p.id, p.display_name
having count(*) filter (where pr.id is null) > 0;
```
