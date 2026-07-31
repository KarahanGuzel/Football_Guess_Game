import {
  formatUnderOver,
  percentLabel,
  translateAdvice,
} from "@/lib/match-preview-labels";
import type { MatchPreview } from "@/types/database";

export function MatchPreviewCard({ preview }: { preview: MatchPreview }) {
  const home = Number(preview.percent_home ?? 0);
  const draw = Number(preview.percent_draw ?? 0);
  const away = Number(preview.percent_away ?? 0);
  const total = home + draw + away || 1;
  const advice = translateAdvice(preview.advice);
  const underOver = formatUnderOver(preview.under_over);

  return (
    <aside className="match-preview" aria-label="Maç öncesi ipucu">
      <div className="match-preview-head">
        <span className="match-preview-kicker">Maç öncesi ipucu</span>
        {underOver ? (
          <span className="match-preview-chip">{underOver}</span>
        ) : null}
      </div>

      <div className="match-preview-bar" aria-hidden="true">
        <span style={{ width: `${(home / total) * 100}%` }} className="match-preview-bar-home" />
        <span style={{ width: `${(draw / total) * 100}%` }} className="match-preview-bar-draw" />
        <span style={{ width: `${(away / total) * 100}%` }} className="match-preview-bar-away" />
      </div>

      <div className="match-preview-percents">
        <span>
          Ev <strong>{percentLabel(preview.percent_home)}</strong>
        </span>
        <span>
          X <strong>{percentLabel(preview.percent_draw)}</strong>
        </span>
        <span>
          Dep <strong>{percentLabel(preview.percent_away)}</strong>
        </span>
      </div>

      {advice ? <p className="match-preview-advice">{advice}</p> : null}
    </aside>
  );
}
