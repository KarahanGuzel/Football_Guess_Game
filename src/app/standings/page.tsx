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
    <div className="stack-lg">
      <header className="page-header">
        <h1 className="page-title">Puan Durumu</h1>
        <p className="page-sub">
          Sezon sıralaması: toplam puan önce, eşitlikte tam isabet sayısı.
        </p>
      </header>

      {errorMessage ? (
        <p style={{ color: "var(--flash-error)" }}>{errorMessage}</p>
      ) : (
        <StandingsTable rows={rows} />
      )}
    </div>
  );
}
