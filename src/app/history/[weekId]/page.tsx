import Link from "next/link";
import { HistoryWeekContent } from "@/components/history-week-content";
import { requirePlayer } from "@/lib/auth/current-user";
import {
  getMatchesForWeek,
  getPredictionsForMatches,
  getWeek,
} from "@/lib/data";
import { notFound } from "next/navigation";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  await requirePlayer();
  const { weekId } = await params;
  const week = await getWeek(weekId);
  if (!week || (week.status !== "scored" && week.status !== "locked")) {
    notFound();
  }

  const matches = await getMatchesForWeek(weekId);
  const predictions = await getPredictionsForMatches(matches.map((m) => m.id));

  return (
    <div className="stack-md">
      <header className="page-header">
        <p className="page-sub" style={{ marginBottom: "0.35rem" }}>
          <Link href="/history" className="history-back-link">
            ← Geçmiş
          </Link>
        </p>
        <h1 className="page-title">{week.label}</h1>
      </header>

      <div className="panel history-detail-panel">
        <HistoryWeekContent matches={matches} predictions={predictions} />
      </div>
    </div>
  );
}
