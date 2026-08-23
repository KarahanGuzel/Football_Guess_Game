import { AdminWeeksList } from "@/components/admin/weeks-list";
import { CreateWeekForm } from "@/components/admin/create-week-form";
import { SeasonResetPanel } from "@/components/admin/season-reset-panel";
import { StandingsTable } from "@/components/standings-table";
import { requireAdmin } from "@/lib/auth/current-user";
import {
  getMatchesForWeek,
  getStandings,
  getStandingsProgress,
  listWeeks,
} from "@/lib/data";
import { attachStandingsRankChanges } from "@/lib/standings-rank";

export default async function AdminPage() {
  await requireAdmin();
  const [weeks, rawStandings, progress] = await Promise.all([
    listWeeks(),
    getStandings(),
    getStandingsProgress(),
  ]);
  const standings = attachStandingsRankChanges(rawStandings, progress);

  const weekBundles = await Promise.all(
    weeks.map(async (week) => ({
      week,
      matches: await getMatchesForWeek(week.id),
    })),
  );

  return (
    <div className="stack-lg">
      <header className="page-header">
        <h1 className="page-title">Yönetim</h1>
      </header>

      <CreateWeekForm />

      <section className="panel reveal">
        <div className="section-head">
          <h2 className="section-title">Haftalar</h2>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {weeks.length} hafta
          </span>
        </div>
        <AdminWeeksList weeks={weekBundles} />
      </section>

      <section className="stack-md reveal">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <h2 className="section-title">Puan Durumu</h2>
        </div>
        <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          Tablo maç sonuçlarından hesaplanır; buradan elle değiştirilmez.
        </p>
        <StandingsTable rows={standings} compact />
      </section>

      <SeasonResetPanel />
    </div>
  );
}
