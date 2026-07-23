"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteWeekAction } from "@/app/actions/admin";
import type { Week } from "@/types/database";

const statusMeta: Record<
  string,
  { label: string; className: string }
> = {
  draft: { label: "Taslak", className: "status-draft" },
  open: { label: "Yayında", className: "status-open" },
  locked: { label: "Kilitli", className: "status-locked" },
  scored: { label: "Puanlandı", className: "status-scored" },
};

export function AdminWeeksList({ weeks }: { weeks: Week[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete(week: Week) {
    const confirmed = window.confirm(
      `"${week.label}" silinsin mi?\n\nBu haftaya ait maçlar ve tahminler de silinir.`,
    );
    if (!confirmed) return;

    setError(null);
    setPendingId(week.id);
    startTransition(async () => {
      const result = await deleteWeekAction(week.id);
      setPendingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (weeks.length === 0) {
    return (
      <p className="muted" style={{ margin: 0 }}>
        Henüz fikstür yüklenmemiş. Fikstürü paylaştığında haftalar burada görünecek.
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gap: "0.65rem" }}>
      {weeks.map((week) => {
        const meta = statusMeta[week.status] ?? {
          label: week.status,
          className: "status-draft",
        };
        const deleting = pending && pendingId === week.id;

        return (
          <div key={week.id} className="week-row">
            <Link href={`/admin/weeks/${week.id}`} className="week-row-main">
              <span className="week-row-title">{week.label}</span>
              <span className={`status-chip ${meta.className}`}>{meta.label}</span>
            </Link>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              disabled={pending}
              onClick={() => onDelete(week)}
            >
              {deleting ? "Siliniyor..." : "Sil"}
            </button>
          </div>
        );
      })}
      {error ? <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p> : null}
    </div>
  );
}
