export type TeamPalette = {
  label: string;
  primary: string;
  secondary: string;
};

/**
 * Süper Lig takım renkleri.
 * DB'deki takım adları + yaygın alias'lar desteklenir.
 */
const TEAM_COLORS: Record<string, TeamPalette> = {
  "amed sportif faaliyetler": {
    label: "Yeşil - Kırmızı",
    primary: "#009639",
    secondary: "#E30613",
  },
  beşiktaş: {
    label: "Siyah - Beyaz",
    primary: "#111111",
    secondary: "#FFFFFF",
  },
  "corendon alanyaspor": {
    label: "Turuncu - Yeşil",
    primary: "#F7941D",
    secondary: "#00843D",
  },
  alanyaspor: {
    label: "Turuncu - Yeşil",
    primary: "#F7941D",
    secondary: "#00843D",
  },
  "çaykur rizespor": {
    label: "Yeşil - Mavi",
    primary: "#009639",
    secondary: "#0055A5",
  },
  rizespor: {
    label: "Yeşil - Mavi",
    primary: "#009639",
    secondary: "#0055A5",
  },
  "çorum fk": {
    label: "Kırmızı - Siyah",
    primary: "#E30613",
    secondary: "#111111",
  },
  erzurumspor: {
    label: "Mavi - Beyaz",
    primary: "#0055A5",
    secondary: "#FFFFFF",
  },
  "erzurumspor fk": {
    label: "Mavi - Beyaz",
    primary: "#0055A5",
    secondary: "#FFFFFF",
  },
  eyüpspor: {
    label: "Mor - Sarı",
    primary: "#6B2D8B",
    secondary: "#FDB912",
  },
  fenerbahçe: {
    label: "Sarı - Lacivert",
    primary: "#FFED00",
    secondary: "#002D72",
  },
  galatasaray: {
    label: "Sarı - Kırmızı",
    primary: "#FDB912",
    secondary: "#A90432",
  },
  "gaziantep fk": {
    label: "Kırmızı - Siyah",
    primary: "#E30613",
    secondary: "#111111",
  },
  gençlerbirliği: {
    label: "Kırmızı - Siyah",
    primary: "#E30613",
    secondary: "#111111",
  },
  göztepe: {
    label: "Sarı - Kırmızı",
    primary: "#FDB912",
    secondary: "#A90432",
  },
  "i̇stanbul başakşehir": {
    label: "Turuncu - Lacivert",
    primary: "#F7941D",
    secondary: "#002D72",
  },
  "istanbul başakşehir": {
    label: "Turuncu - Lacivert",
    primary: "#F7941D",
    secondary: "#002D72",
  },
  başakşehir: {
    label: "Turuncu - Lacivert",
    primary: "#F7941D",
    secondary: "#002D72",
  },
  kasımpaşa: {
    label: "Lacivert - Beyaz",
    primary: "#002D72",
    secondary: "#FFFFFF",
  },
  kocaelispor: {
    label: "Yeşil - Siyah",
    primary: "#009639",
    secondary: "#111111",
  },
  konyaspor: {
    label: "Yeşil - Beyaz",
    primary: "#009639",
    secondary: "#FFFFFF",
  },
  samsunspor: {
    label: "Kırmızı - Beyaz",
    primary: "#E30613",
    secondary: "#FFFFFF",
  },
  trabzonspor: {
    label: "Bordo - Mavi",
    primary: "#8B1538",
    secondary: "#6CABDD",
  },
};

function normalizeTeamName(value: string): string {
  return value.trim().toLocaleLowerCase("tr-TR");
}

export function getTeamPalette(teamName?: string | null): TeamPalette | null {
  if (!teamName) return null;
  return TEAM_COLORS[normalizeTeamName(teamName)] ?? null;
}
