"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCountdownLabel, getCountdownParts } from "@/lib/countdown";
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

  const content = useMemo(() => {
    if (!lockAtIso) return null;
    if (locked) {
      return {
        prefix: "Tahminler kilitlendi",
        time: null as string | null,
      };
    }
    const parts = getCountdownParts(new Date(lockAtIso), now);
    if (parts.expired) {
      return {
        prefix: "Tahminler kilitlendi",
        time: null as string | null,
      };
    }
    return {
      prefix: "Tahminlerin Kilitlenmesine",
      time: formatCountdownLabel(parts),
    };
  }, [lockAtIso, locked, now]);

  if (!lockAtIso || !content) return null;

  return (
    <span className="home-lock-inline" title={formatDateTime(lockAtIso)}>
      <span className="home-lock-inline-text">
        <span className="home-lock-inline-label">{content.prefix}</span>
        {content.time ? (
          <strong className="home-lock-inline-time">{content.time}</strong>
        ) : null}
      </span>
      <span className="home-lock-inline-emoji" aria-hidden="true">
        {WHISTLE}
      </span>
    </span>
  );
}
