import { requireAdmin } from "@/lib/auth/current-user";
import { listWeeks } from "@/lib/data";
import { AdminWeeksList } from "@/components/admin/weeks-list";

export default async function AdminPage() {
  await requireAdmin();
  const weeks = await listWeeks();

  return (
    <div className="stack-lg">
      <header className="page-header">
        <h1 className="page-title">Yönetim</h1>
        <p className="page-sub">
          Bonus seç, yayınla, kilitle; maçlar bitince skor gir ve puanları hesapla.
        </p>
      </header>

      <section className="panel reveal">
        <div className="section-head">
          <h2 className="section-title">Haftalar</h2>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {weeks.length} hafta
          </span>
        </div>
        <AdminWeeksList weeks={weeks} />
      </section>
    </div>
  );
}
