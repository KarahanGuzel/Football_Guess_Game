"use client";

import { useEffect, useMemo, useState } from "react";
import { getLockCountdownView } from "@/lib/countdown";
import { formatDateTime } from "@/lib/format";

const WHISTLE = "📣";

export function LockCountdown({
  lockAtIso,
  locked,
}: {
  lockAtIso: string | null;
  locked: boolean;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (locked || !lockAtIso) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [locked, lockAtIso]);

  const content = useMemo(
    () => getLockCountdownView({ locked, lockAtIso, now }),
    [lockAtIso, locked, now],
  );

  if (!content) return null;

  return (
    <span
      className={`home-lock-inline${content.showEmoji ? "" : " home-lock-inline-locked"}`}
      title={lockAtIso ? formatDateTime(lockAtIso) : undefined}
    >
      <span className="home-lock-inline-text">
        <span className="home-lock-inline-label">{content.label}</span>
        {content.time ? (
          <strong className="home-lock-inline-time">{content.time}</strong>
        ) : null}
      </span>
      {content.showEmoji ? (
        <span className="home-lock-inline-emoji" aria-hidden="true">
          {WHISTLE}
        </span>
      ) : null}
    </span>
  );
}
