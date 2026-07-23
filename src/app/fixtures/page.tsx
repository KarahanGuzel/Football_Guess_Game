import { BonusBadge, DerbyBadge } from "@/components/badges";
import { requirePlayer } from "@/lib/auth/current-user";
import { getNextFixturesWeek } from "@/lib/data";
import { formatKickoff } from "@/lib/format";

export default async function FixturesPage() {
  await requirePlayer();
  const data = await getNextFixturesWeek();

  return (
    <div>
      <h1 className="page-title">Gelecek Hafta</h1>
      <p className="page-sub">Salt okunur fikstür listesi.</p>

      {!data || data.matches.length === 0 ? (
        <div className="panel muted">Henüz gelecek hafta fikstürü yayınlanmadı.</div>
      ) : (
        <div style={{ display: "grid", gap: "0.65rem" }}>
          <div className="muted" style={{ marginBottom: "0.25rem" }}>
            {data.week.label}
          </div>
          {data.matches.map((match) => (
            <article
              key={match.id}
              className="panel"
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>
                  {match.home_team.name} – {match.away_team.name}
                </div>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  {formatKickoff(match.kickoff_at)}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                {match.is_bonus ? <BonusBadge /> : null}
                {match.is_derby ? <DerbyBadge /> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
