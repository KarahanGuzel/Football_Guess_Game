"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCountdownLabel, getCountdownParts } from "@/lib/countdown";
import { formatDateTime } from "@/lib/format";

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

  const label = useMemo(() => {
    if (!lockAtIso) return null;
    if (locked) return "kilitli";
    return formatCountdownLabel(getCountdownParts(new Date(lockAtIso), now));
  }, [lockAtIso, locked, now]);

  if (!lockAtIso || !label) return null;

  return (
    <span className="home-lock-inline" title={formatDateTime(lockAtIso)}>
      <span className="home-lock-inline-label">Kilit</span>
      <strong>{label}</strong>
    </span>
  );
}
