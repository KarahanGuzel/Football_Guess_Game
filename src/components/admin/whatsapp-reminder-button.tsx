"use client";

import { buildLockReminderMessage, buildWhatsAppShareUrl } from "@/lib/whatsapp";

export function WhatsAppReminderButton({
  weekLabel,
  lockAtLabel,
  appUrl,
  phone,
  className = "btn btn-secondary",
}: {
  weekLabel?: string;
  lockAtLabel?: string;
  appUrl: string;
  /** Optional international phone digits; omit to pick chat/group manually. */
  phone?: string | null;
  className?: string;
}) {
  const message = buildLockReminderMessage({ weekLabel, lockAtLabel, appUrl });
  const href = buildWhatsAppShareUrl(message, phone);

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={
        phone
          ? "Belirlenen numarada WhatsApp sohbetini aç"
          : "WhatsApp açılır; hangi gruba/kişiye göndereceğini sen seçersin"
      }
    >
      WhatsApp hatırlat
    </a>
  );
}
