import { StandingsTable } from "@/components/standings-table";
import { requirePlayer } from "@/lib/auth/current-user";
import { getStandings } from "@/lib/data";

export default async function StandingsPage() {
  await requirePlayer();

  let rows: Awaited<ReturnType<typeof getStandings>> = [];
  let errorMessage: string | null = null;

  try {
    rows = await getStandings();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Puan durumu alınamadı.";
  }

  return (
    <div>
      <h1 className="page-title">Puan Durumu</h1>
      <p className="page-sub">Toplam puana göre sıralama.</p>

      {errorMessage ? (
        <p style={{ color: "#ffb4b4" }}>{errorMessage}</p>
      ) : (
        <StandingsTable rows={rows} />
      )}
    </div>
  );
}
