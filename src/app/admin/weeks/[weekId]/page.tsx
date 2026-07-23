import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminWeekControls } from "@/components/admin/week-controls";
import { requireAdmin } from "@/lib/auth/current-user";
import { getMatchesForWeek, getWeek } from "@/lib/data";

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

  const matches = await getMatchesForWeek(weekId);

  return (
    <div>
      <p style={{ margin: "0 0 0.75rem" }}>
        <Link href="/admin" className="muted" style={{ fontSize: "0.9rem" }}>
          ← Yönetim
        </Link>
      </p>
      <h1 className="page-title">{week.label}</h1>
      <p className="page-sub">Durum: {statusLabel[week.status] ?? week.status}</p>
      <AdminWeekControls week={week} matches={matches} />
    </div>
  );
}
