"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteWeekAction } from "@/app/actions/admin";
import { BonusBadge, DerbyBadge } from "@/components/badges";
import { MatchTeamsLine } from "@/components/match-teams-line";
import {
  groupAdminWeekBundles,
  type AdminWeekBundle,
} from "@/lib/admin-weeks";
import { formatKickoff } from "@/lib/format";
import { effectiveWeekStatus } from "@/lib/week-lock";
import type { MatchWithTeams, Week } from "@/types/database";

export type { AdminWeekBundle };

const statusMeta: Record<string, { label: string; className: string }> = {
  draft: { label: "Taslak", className: "status-draft" },
  open: { label: "Yayında", className: "status-open" },
  locked: { label: "Kilitli", className: "status-locked" },
  scored: { label: "Puanlandı", className: "status-scored" },
};

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={`admin-week-chevron${open ? " admin-week-chevron-open" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
        <path d="M7.05 4.45a1 1 0 0 1 1.4-.1l5.2 4.55a1 1 0 0 1 0 1.5l-5.2 4.55a1 1 0 1 1-1.3-1.52L11.4 10 7.15 6.27a1 1 0 0 1-.1-1.82Z" />
      </svg>
    </span>
  );
}

function WeekItem({
  week,
  matches,
  open,
  pending,
  deleting,
  onToggle,
  onDelete,
}: {
  week: Week;
  matches: MatchWithTeams[];
  open: boolean;
  pending: boolean;
  deleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const status = effectiveWeekStatus(week, matches);
  const meta = statusMeta[status] ?? {
    label: status,
    className: "status-draft",
  };
  const bonusCount = matches.filter((m) => m.is_bonus).length;
  const derbyCount = matches.filter((m) => m.is_derby).length;

  return (
    <div className={`admin-week-item${open ? " admin-week-item-open" : ""}`}>
      <div className="admin-week-row">
        <button
          type="button"
          className="admin-week-toggle"
          onClick={onToggle}
          aria-expanded={open}
        >
          <span className="admin-week-toggle-main">
            <span className="week-row-title">{week.label}</span>
            <span className={`status-chip ${meta.className}`}>{meta.label}</span>
          </span>
          <Chevron open={open} />
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          disabled={pending}
          onClick={onDelete}
        >
          {deleting ? "Siliniyor..." : "Sil"}
        </button>
      </div>

      {open ? (
        <div className="admin-week-drawer">
          <div className="admin-week-stats">
            <span>{matches.length} maç</span>
            {bonusCount > 0 ? <span>{bonusCount} bonus</span> : null}
            {derbyCount > 0 ? <span>{derbyCount} derbi</span> : null}
          </div>

          {week.notes ? (
            <p className="muted admin-week-notes">{week.notes}</p>
          ) : null}

          {matches.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              Bu haftaya henüz maç eklenmemiş.
            </p>
          ) : (
            <ul className="admin-week-match-list">
              {matches.map((match) => (
                <li key={match.id} className="admin-week-match-row">
                  <div className="admin-week-match-main">
                    <MatchTeamsLine match={match} size={11} />
                    <span className="muted admin-week-match-kickoff">
                      {formatKickoff(match.kickoff_at)}
                    </span>
                  </div>
                  <span className="admin-week-match-badges">
                    {match.is_bonus ? <BonusBadge compact /> : null}
                    {match.is_derby ? <DerbyBadge compact /> : null}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="admin-week-drawer-foot">
            <Link href={`/admin/weeks/${week.id}`} className="admin-week-manage-link">
              Haftayı yönet
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AdminWeeksList({ weeks }: { weeks: AdminWeekBundle[] }) {
  const router = useRouter();
  const sections = useMemo(() => groupAdminWeekBundles(weeks), [weeks]);
  const liveIds = sections.find((section) => section.id === "live")?.weeks.map((w) => w.week.id) ?? [];
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(liveIds));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(weekId: string) {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(weekId)) next.delete(weekId);
      else next.add(weekId);
      return next;
    });
  }

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
    <div className="admin-weeks-stack">
      {sections.map((section) => (
        <section key={section.id} className="admin-weeks-section">
          <div className="admin-weeks-section-head">
            <h3 className="admin-weeks-section-title">{section.title}</h3>
            <span className="muted admin-weeks-section-count">{section.weeks.length}</span>
          </div>
          {section.weeks.length === 0 ? (
            <p className="muted admin-weeks-section-empty">
              {section.id === "live"
                ? "Şu an yayında veya kilitli hafta yok."
                : section.id === "upcoming"
                  ? "Taslak gelecek hafta yok."
                  : "Puanlanmış hafta yok."}
            </p>
          ) : (
            <div className="admin-weeks-accordion">
              {section.weeks.map(({ week, matches }) => (
                <WeekItem
                  key={week.id}
                  week={week}
                  matches={matches}
                  open={openIds.has(week.id)}
                  pending={pending}
                  deleting={pending && pendingId === week.id}
                  onToggle={() => toggle(week.id)}
                  onDelete={() => onDelete(week)}
                />
              ))}
            </div>
          )}
        </section>
      ))}
      {error ? <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p> : null}
    </div>
  );
}
