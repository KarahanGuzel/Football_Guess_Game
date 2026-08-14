import { FanFlag } from "@/components/fan-flag";

function CrownIcon() {
  return (
    <svg
      className="player-chip-crown-icon"
      viewBox="0 0 20 12"
      width="14"
      height="9"
      aria-hidden="true"
    >
      <path
        d="M1.5 10.5h17L16.2 4.2l-3.4 3.1L10 1.8 7.2 7.3 3.8 4.2 1.5 10.5Z"
        fill="currentColor"
      />
      <rect x="1.2" y="10.2" width="17.6" height="1.4" rx="0.4" fill="currentColor" />
    </svg>
  );
}

export function PlayerChip({
  slug,
  displayName,
  size = 13,
  crowned = false,
  className = "",
}: {
  slug?: string | null;
  displayName: string;
  size?: number;
  crowned?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`player-chip${crowned ? " player-chip-crowned" : ""}${
        className ? ` ${className}` : ""
      }`}
    >
      <span className="player-chip-mark">
        {crowned ? (
          <span className="player-chip-crown" title="Haftanın kralı" aria-label="Haftanın kralı">
            <CrownIcon />
          </span>
        ) : null}
        <FanFlag slug={slug} displayName={displayName} size={size} />
      </span>
      <span className="player-chip-name">{displayName}</span>
    </span>
  );
}
