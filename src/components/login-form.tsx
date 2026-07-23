"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/actions/auth";
import type { Player } from "@/types/database";

export function LoginForm({ players }: { players: Player[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="panel"
      style={{ display: "grid", gap: "1rem" }}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError(null);
        startTransition(async () => {
          const result = await loginAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <div className="field">
        <label htmlFor="playerId">Kullanıcı</label>
        <select id="playerId" name="playerId" required defaultValue="">
          <option value="" disabled>
            Seç...
          </option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.display_name}
              {player.is_admin ? " (admin)" : ""}
            </option>
          ))}
        </select>
      </div>
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
      {error ? <p style={{ color: "#ffb4b4", margin: 0 }}>{error}</p> : null}
    </form>
  );
}
