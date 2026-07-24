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
      return index > 0 && arr[index - 1] !== "";
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Digits only international phone, e.g. 905551112233. */
export function normalizeWhatsAppPhone(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
}

export function getConfiguredWhatsAppPhone(): string | null {
  return normalizeWhatsAppPhone(process.env.NEXT_PUBLIC_WHATSAPP_PHONE);
}

/**
 * Opens WhatsApp with prefilled text.
 * - With phone: opens that chat directly
 * - Without phone: opens chat picker — you choose the group/person
 * WhatsApp does not allow deep-linking into a named group with a message.
 */
export function buildWhatsAppShareUrl(
  text: string,
  phone?: string | null,
): string {
  const normalized = normalizeWhatsAppPhone(phone);
  if (normalized) {
    return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
