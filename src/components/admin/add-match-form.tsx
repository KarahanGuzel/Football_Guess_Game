"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addMatchAction } from "@/app/actions/admin";
import type { Team } from "@/types/database";

export function AddMatchForm({
  weekId,
  teams,
}: {
  weekId: string;
  teams: Team[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [homeTeamId, setHomeTeamId] = useState(teams[0]?.id ?? "");
  const [awayTeamId, setAwayTeamId] = useState(teams[1]?.id ?? "");
  const [kickoffAt, setKickoffAt] = useState("");

  return (
    <form
      className="panel reveal"
      style={{ display: "grid", gap: "0.75rem" }}
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await addMatchAction({
            weekId,
            homeTeamId,
            awayTeamId,
            kickoffAt,
          });
          if (result.error) {
            setError(result.error);
            return;
          }
          setKickoffAt("");
          router.refresh();
        });
      }}
    >
      <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Maç Ekle</h2>
      <div
        style={{
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        }}
      >
        <div className="field">
          <label htmlFor="homeTeamId">Ev sahibi</label>
          <select
            id="homeTeamId"
            value={homeTeamId}
            onChange={(e) => setHomeTeamId(e.target.value)}
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="awayTeamId">Deplasman</label>
          <select
            id="awayTeamId"
            value={awayTeamId}
            onChange={(e) => setAwayTeamId(e.target.value)}
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="kickoffAt">Maç saati (Türkiye)</label>
          <input
            id="kickoffAt"
            type="datetime-local"
            value={kickoffAt}
            onChange={(e) => setKickoffAt(e.target.value)}
            required
          />
        </div>
      </div>
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Ekleniyor..." : "Maçı Ekle"}
      </button>
      {error ? <p style={{ color: "#ffb4b4", margin: 0 }}>{error}</p> : null}
    </form>
  );
}
