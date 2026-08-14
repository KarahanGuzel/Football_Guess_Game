export type CountdownParts = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

export function getCountdownParts(target: Date, now = new Date()): CountdownParts {
  const totalMs = Math.max(0, target.getTime() - now.getTime());
  const expired = totalMs <= 0;
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { totalMs, days, hours, minutes, seconds, expired };
}

/** Compact Turkish remaining time, e.g. "2g 14sa", "3sa 12dk", "45dk 08sn". */
export function formatCountdownLabel(parts: CountdownParts): string {
  if (parts.expired) return "Kilitlendi";
  if (parts.days > 0) {
    return `${parts.days}g ${parts.hours}sa`;
  }
  if (parts.hours > 0) {
    return `${parts.hours}sa ${parts.minutes}dk`;
  }
  if (parts.minutes > 0) {
    return `${parts.minutes}dk ${String(parts.seconds).padStart(2, "0")}sn`;
  }
  return `${parts.seconds}sn`;
}

export type LockCountdownView = {
  label: string;
  time: string | null;
  showEmoji: boolean;
};

/**
 * Open week: ticking countdown + whistle.
 * Admin lock (or time expiry): "Kilitlendi", no whistle.
 * Unlock: countdown comes back.
 */
export function getLockCountdownView(input: {
  locked: boolean;
  lockAtIso: string | null;
  now?: Date;
}): LockCountdownView | null {
  if (input.locked) {
    return { label: "Kilitlendi", time: null, showEmoji: false };
  }
  if (!input.lockAtIso) return null;

  const parts = getCountdownParts(new Date(input.lockAtIso), input.now);
  if (parts.expired) {
    return { label: "Kilitlendi", time: null, showEmoji: false };
  }

  return {
    label: "Tahminlerin Kilitlenmesine",
    time: formatCountdownLabel(parts),
    showEmoji: true,
  };
}
