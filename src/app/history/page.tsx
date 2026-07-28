import { HistoryWeeksAccordion } from "@/components/history-weeks-accordion";
import { requirePlayer } from "@/lib/auth/current-user";
import {
  getMatchesForWeek,
  getPastWeeks,
  getPredictionsForMatches,
} from "@/lib/data";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  await requirePlayer();
  const { week: openWeekId } = await searchParams;
  const weeks = await getPastWeeks();

  const bundles = await Promise.all(
    weeks.map(async (week) => {
      const matches = await getMatchesForWeek(week.id);
      const predictions = await getPredictionsForMatches(matches.map((m) => m.id));
      return { week, matches, predictions };
    }),
  );

  const initialOpenId =
    openWeekId && bundles.some((b) => b.week.id === openWeekId)
      ? openWeekId
      : null;

  return (
    <div className="stack-md">
      <header className="page-header">
        <h1 className="page-title">Geçmiş Haftalar</h1>
        <p className="page-sub">Haftayı açıp maç sonuçlarını ve tahminleri incele.</p>
      </header>

      {bundles.length === 0 ? (
        <div className="panel muted">Henüz geçmiş hafta yok.</div>
      ) : (
        <HistoryWeeksAccordion weeks={bundles} initialOpenId={initialOpenId} />
      )}
    </div>
  );
}
