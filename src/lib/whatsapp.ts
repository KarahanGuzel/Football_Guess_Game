import { getPublicAppUrl } from "@/lib/app-url";

export function buildLockReminderMessage(options?: {
  weekLabel?: string;
  lockAtLabel?: string;
  appUrl?: string;
}): string {
  const appUrl = options?.appUrl ?? getPublicAppUrl();
  const weekLine = options?.weekLabel ? `${options.weekLabel}\n` : "";
  const lockLine = options?.lockAtLabel
    ? `Kilit zamanı: ${options.lockAtLabel}\n`
    : "";

  return [
    "⚽ Tahmin Ligi",
    "Tahminler kilitleniyor!",
    "",
    weekLine.trimEnd(),
    lockLine.trimEnd(),
    "Tahminlerini gir:",
    appUrl,
  ]
    .filter((line, index, arr) => {
      if (line !== "") return true;
      // keep a single blank line between header and body
      return index > 0 && arr[index - 1] !== "";
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Opens WhatsApp share sheet with prefilled text (no API key needed). */
export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
