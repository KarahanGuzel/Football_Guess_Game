export function BonusBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`badge badge-bonus${compact ? " badge-compact" : ""}`}
      title="Bonus"
    >
      {compact ? "B" : "Bonus"}
    </span>
  );
}

export function DerbyBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`badge badge-derby${compact ? " badge-compact" : ""}`}
      title="Derbi"
    >
      {compact ? "D" : "Derbi"}
    </span>
  );
}
