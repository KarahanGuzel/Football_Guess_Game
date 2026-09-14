import type { LigDefteriCard } from "@/lib/lig-defteri";

export function LigDefteriBanner({ card }: { card: LigDefteriCard | null }) {
  const entries = card?.entries ?? [];

  return (
    <aside
      className="panel standings-panel standings-panel-titled lig-defteri-panel"
      aria-label="Lig defteri"
    >
      <div className="standings-panel-head home-twin-head">
        <h2 className="section-title">Lig defteri</h2>
      </div>
      {entries.length === 0 ? (
        <p className="muted week-kings-empty">
          Henüz deftere düşecek kadar küpür yok.
        </p>
      ) : (
        <ul className="lig-defteri-list">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className={`lig-defteri-line${index === 0 ? " lig-defteri-line-lead" : ""}`}
            >
              <p className="lig-defteri-kicker">{entry.kicker}</p>
              <p className="lig-defteri-headline">{entry.headline}</p>
              {entry.detail ? (
                <p className="lig-defteri-detail">{entry.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
