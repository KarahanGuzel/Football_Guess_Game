import { ColorFlag } from "@/components/team-flag";
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

  return (
    <ColorFlag
      primary={palette.primary}
      secondary={palette.secondary}
      label={title ?? palette.label}
      size={size}
    />
  );
}
