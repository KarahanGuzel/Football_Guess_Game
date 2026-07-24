import { getTeamPalette } from "@/lib/team-colors";

export function ColorFlag({
  primary,
  secondary,
  label,
  size = 14,
}: {
  primary: string;
  secondary: string;
  label: string;
  size?: number;
}) {
  const width = Math.round(size * 1.35);
  const height = size;

  return (
    <span
      className="fan-flag"
      title={label}
      aria-label={label}
      style={{
        width,
        height,
        borderRadius: 3,
        overflow: "hidden",
        display: "inline-flex",
        flexShrink: 0,
        verticalAlign: "middle",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
      }}
    >
      <span style={{ flex: 1, background: primary }} />
      <span style={{ flex: 1, background: secondary }} />
    </span>
  );
}

export function TeamFlag({
  teamName,
  size = 14,
}: {
  teamName?: string | null;
  size?: number;
}) {
  const palette = getTeamPalette(teamName);
  if (!palette) return null;
  return (
    <ColorFlag
      primary={palette.primary}
      secondary={palette.secondary}
      label={`${teamName} · ${palette.label}`}
      size={size}
    />
  );
}

export function TeamName({
  name,
  size = 13,
  weight = 700,
}: {
  name: string;
  size?: number;
  weight?: number;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        fontWeight: weight,
      }}
    >
      <TeamFlag teamName={name} size={size} />
      <span>{name}</span>
    </span>
  );
}
