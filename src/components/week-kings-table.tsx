import type { WeekKingRow } from "@/lib/data";

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
          <h2 className="section-title">
            Haftanın <span className="week-kings-gold">KRALI</span>
          </h2>
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
            const n = index + 1;
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
                  <span className="week-kings-points-unit"> puan</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
