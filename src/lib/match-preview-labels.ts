/** Light Turkish framing for API-Football prediction strings. */

export function formatUnderOver(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  if (lower.includes("over")) {
    const n = trimmed.replace(/over/i, "").trim();
    return n ? `Üst ${n}` : "Üst";
  }
  if (lower.includes("under")) {
    const n = trimmed.replace(/under/i, "").trim();
    return n ? `Alt ${n}` : "Alt";
  }
  return trimmed;
}

export function translateAdvice(advice: string | null | undefined): string | null {
  if (!advice) return null;
  let text = advice.trim();

  const replacements: Array<[RegExp, string]> = [
    [/win or draw/gi, "galibiyet veya beraberlik"],
    [/double chance/gi, "çift şans"],
    [/combo double chance/gi, "çift şans"],
    [/\bdraw\b/gi, "beraberlik"],
    [/\bwinner\b/gi, "kazanan"],
    [/over\s*2\.5/gi, "üst 2.5"],
    [/under\s*2\.5/gi, "alt 2.5"],
    [/over/gi, "üst"],
    [/under/gi, "alt"],
    [/\bhome\b/gi, "ev sahibi"],
    [/\baway\b/gi, "deplasman"],
  ];

  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }

  // "Win or draw for Arsenal" style leftovers
  text = text.replace(/\bfor\b/gi, "—");
  text = text.replace(/\s+/g, " ").replace(/\s—\s—/g, " —").trim();
  if (text.length > 0) {
    text = text.charAt(0).toLocaleUpperCase("tr-TR") + text.slice(1);
  }
  return text;
}

export function percentLabel(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${Math.round(Number(value))}%`;
}
