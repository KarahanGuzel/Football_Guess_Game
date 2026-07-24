export function RankMedal({ rank }: { rank: number }) {
  if (rank < 1 || rank > 3) return null;

  const label = rank === 1 ? "Altın madalya" : rank === 2 ? "Gümüş madalya" : "Bronz madalya";

  return (
    <span
      className={`rank-medal rank-medal-${rank}`}
      title={label}
      aria-label={label}
    >
      {rank}
    </span>
  );
}
