import { HistoryWeeksAccordion } from "@/components/history-weeks-accordion";
import { requirePlayer } from "@/lib/auth/current-user";
import {
  getMatchesForWeek,
  getPastWeeks,
  getPredictionsForMatches,
} from "@/lib/data";
import { compareWeeksChronologically } from "@/lib/week-label";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const player = await requirePlayer();
  const { week: openWeekId } = await searchParams;
  const weeks = await getPastWeeks();

  const bundles = await Promise.all(
    weeks.map(async (week) => {
      const matches = await getMatchesForWeek(week.id);
      const predictions = await getPredictionsForMatches(matches.map((m) => m.id));
      return { week, matches, predictions };
    }),
  );

  const chronological = [...bundles].sort((a, b) =>
    compareWeeksChronologically(a.week, b.week),
  );
  const latestScored = [...chronological]
    .reverse()
    .find((bundle) => bundle.week.status === "scored");

  const initialOpenId =
    openWeekId && chronological.some((b) => b.week.id === openWeekId)
      ? openWeekId
      : (latestScored?.week.id ?? null);

  return (
    <div className="stack-md">
      <header className="page-header">
        <h1 className="page-title">Geçmiş Haftalar</h1>
        <p className="page-sub">Sezon duvarı — kartı aç, maçları gör.</p>
      </header>

      {bundles.length === 0 ? (
        <div className="panel muted">Henüz geçmiş hafta yok.</div>
      ) : (
        <HistoryWeeksAccordion
          weeks={chronological}
          initialOpenId={initialOpenId}
          currentPlayerId={player.playerId}
        />
      )}
    </div>
  );
}
