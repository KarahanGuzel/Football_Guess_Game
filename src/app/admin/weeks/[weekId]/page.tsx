import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminWeekControls } from "@/components/admin/week-controls";
import { requireAdmin } from "@/lib/auth/current-user";
import { getMatchesForWeek, getWeek } from "@/lib/data";

const statusMeta: Record<string, { label: string; className: string }> = {
  draft: { label: "Taslak", className: "status-draft" },
  open: { label: "Yayında", className: "status-open" },
  locked: { label: "Kilitli", className: "status-locked" },
  scored: { label: "Puanlandı", className: "status-scored" },
};

export default async function AdminWeekPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  await requireAdmin();
  const { weekId } = await params;
  const week = await getWeek(weekId);
  if (!week) notFound();

  const matches = await getMatchesForWeek(weekId);
  const meta = statusMeta[week.status] ?? {
    label: week.status,
    className: "status-draft",
  };

  return (
    <div className="stack-lg">
      <div>
        <p style={{ margin: "0 0 0.75rem" }}>
          <Link href="/admin" className="muted" style={{ fontSize: "0.9rem" }}>
            ← Yönetim
          </Link>
        </p>
        <header className="page-header">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.65rem",
              alignItems: "center",
            }}
          >
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              {week.label}
            </h1>
            <span className={`status-chip ${meta.className}`}>{meta.label}</span>
          </div>
          <p className="page-sub" style={{ marginTop: "0.45rem" }}>
            {matches.length} maç
          </p>
        </header>
      </div>
      <AdminWeekControls week={week} matches={matches} />
    </div>
  );
}
