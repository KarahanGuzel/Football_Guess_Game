import { AdminStandingsPanel } from "@/components/admin/standings-panel";
import { AdminWeeksList } from "@/components/admin/weeks-list";
import { CreateWeekForm } from "@/components/admin/create-week-form";
import { requireAdmin } from "@/lib/auth/current-user";
import { getMatchesForWeek, getStandings, listWeeks } from "@/lib/data";

export default async function AdminPage() {
  await requireAdmin();
  const [weeks, standings] = await Promise.all([listWeeks(), getStandings()]);

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

      <AdminStandingsPanel rows={standings} />
    </div>
  );
}
