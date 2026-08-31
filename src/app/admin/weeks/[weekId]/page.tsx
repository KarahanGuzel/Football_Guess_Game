import { notFound } from "next/navigation";
import Link from "next/link";
import { AddMatchForm } from "@/components/admin/add-match-form";
import { EditWeekLabelForm } from "@/components/admin/edit-week-label-form";
import { AdminWeekControls } from "@/components/admin/week-controls";
import { requireAdmin } from "@/lib/auth/current-user";
import { getClearWeekBlockReason } from "@/lib/admin-season";
import { getMatchesForWeek, getWeek, listTeams, listWeeks } from "@/lib/data";
import { effectiveWeekStatus } from "@/lib/week-lock";

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

  const [matches, teams, weeks] = await Promise.all([
    getMatchesForWeek(weekId),
    listTeams(),
    listWeeks(),
  ]);
  const clearBlockedReason =
    week.status === "scored" ? getClearWeekBlockReason(week, weeks) : null;
  const shownStatus = effectiveWeekStatus(week, matches);
  const meta = statusMeta[shownStatus] ?? {
    label: shownStatus,
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

      <EditWeekLabelForm weekId={week.id} initialLabel={week.label} />

      {shownStatus === "draft" || shownStatus === "open" ? (
        <AddMatchForm weekId={week.id} teams={teams} />
      ) : null}

      <AdminWeekControls
        week={week}
        matches={matches}
        clearBlockedReason={clearBlockedReason}
      />
    </div>
  );
}
