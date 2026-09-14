import type { LigDefteriCard } from "@/lib/lig-defteri";

export function LigDefteriBanner({ card }: { card: LigDefteriCard }) {
  return (
    <aside className="lig-defteri panel" aria-label="Lig defteri">
      <div className="lig-defteri-top">
        <p className="lig-defteri-brand">Lig defteri</p>
        <p className="lig-defteri-kicker">{card.kicker}</p>
      </div>
      <p className="lig-defteri-headline">{card.headline}</p>
      {card.detail ? <p className="lig-defteri-detail">{card.detail}</p> : null}
      {card.chips.length > 0 ? (
        <ul className="lig-defteri-chips">
          {card.chips.map((chip) => (
            <li key={`${chip.label}-${chip.value}`}>
              <span className="lig-defteri-chip-label">{chip.label}</span>
              <span className="lig-defteri-chip-value">{chip.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}
