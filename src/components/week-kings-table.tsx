import type { WeekKingRow } from "@/lib/data";

function weekNumber(label: string, index: number): string {
  const match = label.match(/(\d+)/);
  return match?.[1] ?? String(index + 1);
}

export function WeekKingsTable({
  rows,
  compact = false,
  titled = true,
}: {
  rows: WeekKingRow[];
  compact?: boolean;
  titled?: boolean;
}) {
  return (
    <div
      className={`panel standings-panel week-kings-panel${
        titled ? " standings-panel-titled" : ""
      }${compact ? " week-kings-panel-compact" : ""}`}
    >
      {titled ? (
        <div className="standings-panel-head">
          <h2 className="section-title">Haftanın kralı</h2>
          <p className="muted standings-panel-sub">
            Her puanlanan haftanın birincisi
          </p>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="muted week-kings-empty">
          Henüz puanlanmış hafta yok. İlk skor sonrası krallar burada.
        </p>
      ) : (
        <ul className="week-kings-list">
          {rows.map((row, index) => {
            const n = weekNumber(row.weekLabel, index);
            const names = row.kings
              .map((k) => k.displayName.toLocaleUpperCase("tr-TR"))
              .join(" & ");
            return (
              <li key={row.weekId} className="week-kings-line">
                <p className="week-kings-proclamation">
                  <span className="week-kings-prefix">{n}.Haftanın </span>
                  <span className="week-kings-gold">KRAL&apos;I</span>
                  <span className="week-kings-arrow"> → </span>
                  <span className="week-kings-gold">{names}</span>
                </p>
                <span className="week-kings-points" title="Hafta puanı">
                  {row.points}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {!compact && rows.length > 0 ? (
        <p className="standings-legend muted">
          Beraberlikte birden fazla isim yazılır.
        </p>
      ) : null}
    </div>
  );
}
