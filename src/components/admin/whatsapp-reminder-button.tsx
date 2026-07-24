"use client";

import { buildLockReminderMessage, buildWhatsAppShareUrl } from "@/lib/whatsapp";

export function WhatsAppReminderButton({
  weekLabel,
  lockAtLabel,
  appUrl,
  className = "btn btn-secondary",
}: {
  weekLabel?: string;
  lockAtLabel?: string;
  appUrl: string;
  className?: string;
}) {
  const message = buildLockReminderMessage({ weekLabel, lockAtLabel, appUrl });
  const href = buildWhatsAppShareUrl(message);

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="WhatsApp’ta hatırlatma mesajı aç"
    >
      WhatsApp hatırlat
    </a>
  );
}
