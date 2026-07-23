import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-user";
import { listWeeks } from "@/lib/data";

const statusLabel: Record<string, string> = {
  draft: "Taslak — bonus seç / yayınla",
  open: "Açık — tahminler alınıyor",
  locked: "Kilitli — skor gir",
  scored: "Puanlandı",
};

export default async function AdminPage() {
  await requireAdmin();
  const weeks = await listWeeks();

  return (
    <div>
      <h1 className="page-title">Yönetim</h1>
      <p className="page-sub">
        Haftalar hazır gelir. Senin işin: bonus seçmek ve yayınlamak; maçlar bitince
        skor girmek.
      </p>

      <section className="panel" style={{ display: "grid", gap: "0.55rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Haftalar</h2>
        {weeks.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Henüz fikstür yüklenmemiş. Fikstürü paylaştığında haftalar burada
            görünecek.
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
              <span className="muted" style={{ fontSize: "0.9rem" }}>
                {statusLabel[week.status] ?? week.status}
              </span>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
