import Link from "next/link";
import { requirePlayer } from "@/lib/auth/current-user";
import { getPastWeeks } from "@/lib/data";

const statusLabel: Record<string, string> = {
  locked: "Kilitli",
  scored: "Puanlandı",
};

export default async function HistoryPage() {
  await requirePlayer();
  const weeks = await getPastWeeks();

  return (
    <div>
      <h1 className="page-title">Geçmiş Haftalar</h1>
      <p className="page-sub">Sonuçlar, tahminler ve puanlar.</p>

      <div style={{ display: "grid", gap: "0.65rem" }}>
        {weeks.length === 0 ? (
          <div className="panel muted">Henüz geçmiş hafta yok.</div>
        ) : (
          weeks.map((week) => (
            <Link
              key={week.id}
              href={`/history/${week.id}`}
              className="panel"
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700 }}>{week.label}</span>
              <span className="muted">{statusLabel[week.status] ?? week.status}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
