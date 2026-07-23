import { PredictionForm } from "@/components/prediction-form";
import { requirePlayer } from "@/lib/auth/current-user";
import {
  getCurrentPlayableWeek,
  getPredictionsForPlayer,
} from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export default async function CurrentWeekPage() {
  const player = await requirePlayer();

  let data: Awaited<ReturnType<typeof getCurrentPlayableWeek>> = null;
  let loadError: string | null = null;

  try {
    data = await getCurrentPlayableWeek();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Hafta yüklenemedi.";
  }

  if (loadError) {
    return (
      <div>
        <h1 className="page-title">Bu Hafta</h1>
        <p style={{ color: "#ffb4b4" }}>{loadError}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className="page-title">Bu Hafta</h1>
        <p className="page-sub">Şu an açık bir tahmin haftası yok.</p>
        <div className="panel muted">
          Yönetici yeni bir hafta açtığında burada görünecek.
        </div>
      </div>
    );
  }

  const predictions = await getPredictionsForPlayer(
    player.playerId,
    data.matches.map((m) => m.id),
  );

  const locked = data.status !== "open";

  return (
    <div>
      <h1 className="page-title">{data.week.label}</h1>
      <p className="page-sub">
        {locked
          ? "Tahminler kilitli. Maç sonuçlarını geçmişten takip edebilirsin."
          : "Tüm maçlar için sonuç ve alt/üst tahminini yap."}
        {data.lockAt ? (
          <>
            {" "}
            Kilit: <strong>{formatDateTime(data.lockAt.toISOString())}</strong>
          </>
        ) : null}
      </p>

      {data.matches.length === 0 ? (
        <div className="panel muted">Bu haftaya henüz maç eklenmemiş.</div>
      ) : (
        <PredictionForm
          weekId={data.week.id}
          matches={data.matches}
          initialPredictions={predictions}
          locked={locked}
        />
      )}
    </div>
  );
}
