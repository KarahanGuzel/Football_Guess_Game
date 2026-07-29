export type FanPalette = {
  id: "fenerbahce" | "galatasaray";
  label: string;
  primary: string;
  secondary: string;
};

export const FAN_PALETTES: Record<FanPalette["id"], FanPalette> = {
  fenerbahce: {
    id: "fenerbahce",
    label: "Sarı Lacivert",
    primary: "#FFED00",
    secondary: "#002D72",
  },
  galatasaray: {
    id: "galatasaray",
    label: "Sarı Kırmızı",
    primary: "#FDB912",
    secondary: "#A90432",
  },
};

/** slug veya display_name (küçük harf, Türkçe normalize) → renkler */
const FAN_BY_KEY: Record<string, FanPalette["id"]> = {
  karahan: "fenerbahce",
  batuhan: "fenerbahce",
  atinc: "fenerbahce",
  "atınç": "fenerbahce",
  baran: "fenerbahce",
  ismail: "fenerbahce",
  emrah: "galatasaray",
  bugra: "galatasaray",
  "buğra": "galatasaray",
  kaan: "galatasaray",
};

function normalizeKey(value: string): string {
  return value.trim().toLocaleLowerCase("tr-TR");
}

export function getFanPalette(
  slug?: string | null,
  displayName?: string | null,
): FanPalette | null {
  const keys = [slug, displayName].filter(Boolean) as string[];
  for (const key of keys) {
    const id = FAN_BY_KEY[normalizeKey(key)];
    if (id) return FAN_PALETTES[id];
  }
  return null;
}
