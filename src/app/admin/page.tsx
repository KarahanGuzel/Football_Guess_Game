import { requireAdmin } from "@/lib/auth/current-user";
import { getStandings, listWeeks } from "@/lib/data";
import { AdminStandingsPanel } from "@/components/admin/standings-panel";
import { AdminWeeksList } from "@/components/admin/weeks-list";
import { CreateWeekForm } from "@/components/admin/create-week-form";

export default async function AdminPage() {
  await requireAdmin();
  const [weeks, standings] = await Promise.all([listWeeks(), getStandings()]);

  return (
    <div className="stack-lg">
      <header className="page-header">
        <h1 className="page-title">Yönetim</h1>
        <p className="page-sub">
          Manuel hafta ekleyebilir, bonus seçip yayınlayabilir, kilitleyip skor
          girebilirsin.
        </p>
      </header>

      <CreateWeekForm />

      <section className="panel reveal">
        <div className="section-head">
          <h2 className="section-title">Haftalar</h2>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {weeks.length} hafta
          </span>
        </div>
        <AdminWeeksList weeks={weeks} />
      </section>

      <AdminStandingsPanel rows={standings} />
    </div>
  );
}
