import Link from "next/link";
import { CreateWeekForm } from "@/components/admin/create-week-form";
import { requireAdmin } from "@/lib/auth/current-user";
import { listWeeks } from "@/lib/data";

const statusLabel: Record<string, string> = {
  draft: "Taslak",
  open: "Açık",
  locked: "Kilitli",
  scored: "Puanlandı",
};

export default async function AdminPage() {
  await requireAdmin();
  const weeks = await listWeeks();

  return (
    <div>
      <h1 className="page-title">Yönetim</h1>
      <p className="page-sub">Hafta oluştur, maç ekle, bonus seç, skor gir, puan hesapla.</p>

      <div style={{ display: "grid", gap: "1rem" }}>
        <CreateWeekForm />

        <section className="panel" style={{ display: "grid", gap: "0.55rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Haftalar</h2>
          {weeks.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              Henüz hafta yok.
            </p>
          ) : (
            weeks.map((week) => (
              <Link
                key={week.id}
                href={`/admin/weeks/${week.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  padding: "0.65rem 0",
                  borderTop: "1px solid var(--line)",
                }}
              >
                <span style={{ fontWeight: 700 }}>{week.label}</span>
                <span className="muted">{statusLabel[week.status] ?? week.status}</span>
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
