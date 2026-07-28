"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/actions/auth";
import { FanFlag } from "@/components/fan-flag";
import { getFanPalette } from "@/lib/fan-colors";
import type { Player } from "@/types/database";

export function LoginForm({ players }: { players: Player[] }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="login-form panel"
      onSubmit={(event) => {
        event.preventDefault();
        if (!selectedId) {
          setError("Lütfen bir kullanıcı seç.");
          return;
        }
        const formData = new FormData();
        formData.set("playerId", selectedId);
        setError(null);
        startTransition(async () => {
          const result = await loginAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <div className="login-form-head">
        <p className="login-form-label">Kimsin?</p>
        <p className="muted login-form-hint">Adını seç, lig başlasın.</p>
      </div>

      <div
        className="login-player-grid"
        role="radiogroup"
        aria-label="Kullanıcı seç"
      >
        {players.map((player) => {
          const selected = selectedId === player.id;
          const palette = getFanPalette(player.slug, player.display_name);
          return (
            <button
              key={player.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`login-player-card${selected ? " login-player-card-selected" : ""}`}
              style={
                palette
                  ? {
                      ["--login-tint" as string]: palette.primary,
                      ["--login-tint-deep" as string]: palette.secondary,
                    }
                  : undefined
              }
              onClick={() => {
                setSelectedId(player.id);
                setError(null);
              }}
            >
              <span className="login-player-flag" aria-hidden="true">
                <FanFlag
                  slug={player.slug}
                  displayName={player.display_name}
                  size={22}
                />
              </span>
              <span className="login-player-meta">
                <span className="login-player-name">{player.display_name}</span>
                {player.is_admin ? (
                  <span className="login-player-role">Yönetici</span>
                ) : (
                  <span className="login-player-role muted">Oyuncu</span>
                )}
              </span>
              <span
                className={`login-player-check${selected ? " login-player-check-on" : ""}`}
                aria-hidden="true"
              >
                {selected ? (
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
                    <path d="M7.7 13.3 4.4 10l-1.4 1.4 4.7 4.7 9-9-1.4-1.4-7.6 7.6Z" />
                  </svg>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <button
        className={`btn btn-primary login-submit${selectedId ? " login-submit-ready" : ""}`}
        type="submit"
        disabled={pending || !selectedId}
      >
        {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>

      {error ? <p className="login-error">{error}</p> : null}
    </form>
  );
}
