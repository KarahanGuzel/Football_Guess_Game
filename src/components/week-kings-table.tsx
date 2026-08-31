import { weekIndexFromLabel } from "@/lib/week-label";
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
  const ordered = [...rows].reverse();

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

      {ordered.length === 0 ? (
        <p className="muted week-kings-empty">
          Henüz puanlanmış hafta yok. İlk skor sonrası krallar burada.
        </p>
      ) : (
        <ul className="week-kings-list">
          {ordered.map((row, index) => {
            const latest = index === 0;
            const weekNo = weekIndexFromLabel(row.weekLabel);
            const names = row.kings
              .map((k) => k.displayName.toLocaleUpperCase("tr-TR"))
              .join(" & ");
            return (
              <li
                key={row.weekId}
                className={`week-kings-line${latest ? " week-kings-line-latest" : ""}`}
              >
                {latest ? (
                  <span className="week-kings-latest-tag">Son hafta</span>
                ) : null}
                <p className="week-kings-proclamation">
                  <span className="week-kings-prefix">
                    {latest
                      ? "Son haftanın "
                      : weekNo != null
                        ? `${weekNo}.Haftanın `
                        : `${row.weekLabel} `}
                  </span>
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
