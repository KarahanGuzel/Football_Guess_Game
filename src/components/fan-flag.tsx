import { getFanPalette } from "@/lib/fan-colors";

export function FanFlag({
  slug,
  displayName,
  size = 14,
  title,
}: {
  slug?: string | null;
  displayName?: string | null;
  size?: number;
  title?: string;
}) {
  const palette = getFanPalette(slug, displayName);
  if (!palette) return null;

  const width = Math.round(size * 1.35);
  const height = size;

  return (
    <span
      className="fan-flag"
      title={title ?? palette.label}
      aria-label={palette.label}
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
      <span style={{ flex: 1, background: palette.primary }} />
      <span style={{ flex: 1, background: palette.secondary }} />
    </span>
  );
}
