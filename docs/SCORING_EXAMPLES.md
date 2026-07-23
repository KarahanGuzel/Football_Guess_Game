# Football Guess Game — scoring examples

These cases mirror `docs/reference/scoring.ts` and the SQL `score_prediction` function.

| Scenario | Result OK | O/U OK | Bonus | Derby | Points |
|---|---|---|---|---|---|
| Normal miss | no | no | no | no | 0 |
| Normal result only | yes | no | no | no | 2 |
| Normal O/U only | no | yes | no | no | 1 |
| Normal perfect | yes | yes | no | no | 4 |
| Derby result only | yes | no | no | yes | 4 |
| Derby O/U only | no | yes | no | yes | 2 |
| Derby perfect | yes | yes | no | yes | 8 |
| Bonus miss (result only) | yes | no | yes | no | 0 |
| Bonus miss (O/U only) | no | yes | yes | no | 0 |
| Bonus perfect | yes | yes | yes | no | 6 |
| Bonus + derby | — | — | yes | yes | **rejected** |

## Success percentage

```
success_% = 100 * perfect_prediction_count / scored_prediction_count
```

A “perfect” prediction means both markets correct (including bonus perfects).
