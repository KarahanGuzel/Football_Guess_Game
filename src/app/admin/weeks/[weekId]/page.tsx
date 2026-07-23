import { notFound } from "next/navigation";
import { AddMatchForm } from "@/components/admin/add-match-form";
import { AdminWeekControls } from "@/components/admin/week-controls";
import { requireAdmin } from "@/lib/auth/current-user";
import { getMatchesForWeek, getWeek, listTeams } from "@/lib/data";

const statusLabel: Record<string, string> = {
  draft: "Taslak",
  open: "Açık",
  locked: "Kilitli",
  scored: "Puanlandı",
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

  const [matches, teams] = await Promise.all([
    getMatchesForWeek(weekId),
    listTeams(),
  ]);

  return (
    <div>
      <h1 className="page-title">{week.label}</h1>
      <p className="page-sub">Durum: {statusLabel[week.status] ?? week.status}</p>

      <div style={{ display: "grid", gap: "1rem" }}>
        {week.status === "draft" ? (
          <AddMatchForm weekId={week.id} teams={teams} />
        ) : null}
        <AdminWeekControls week={week} matches={matches} />
      </div>
    </div>
  );
}
