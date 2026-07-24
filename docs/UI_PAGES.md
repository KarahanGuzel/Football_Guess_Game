# UI page map (MVP)

## Public / auth
- `/login` — username picker (predefined players)

## Player
- `/` — current week predictions
- `/predictions` — who submitted + everyone’s picks by player (visible while week is open)
- `/standings` — leaderboard
- `/history` — past weeks list
- `/history/[weekId]` — week results + everyone’s picks
- `/fixtures` — next week read-only

## Admin (`players.is_admin`)
- `/admin` — weeks list + create week
- `/admin/weeks/[weekId]` — add fixtures, mark bonus, enter scores, open/lock/calculate

## Shared chrome
- Top/bottom nav after login
- Badges: BONUS, DERBY, LOCKED
- Mobile-first forms: radio groups per market, one Save for the whole week
