"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resetStandingsAction } from "@/app/actions/admin";
import { StandingsTable } from "@/components/standings-table";
import type { StandingRow } from "@/types/database";

export function AdminStandingsPanel({ rows }: { rows: StandingRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onReset() {
    const confirmed = window.confirm(
      "Puan tablosu sıfırlansın mı?\n\nTüm oyuncuların puanları silinir. Puanlanmış haftalar kilitliye döner (maç skorları kalır; yeniden hesaplanabilir).",
    );
    if (!confirmed) return;

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await resetStandingsAction();
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage("Puan tablosu sıfırlandı.");
      router.refresh();
    });
  }

  return (
    <section className="panel reveal">
      <div className="section-head">
        <h2 className="section-title">Puan Durumu</h2>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          disabled={pending}
          onClick={onReset}
        >
          {pending ? "Sıfırlanıyor..." : "Puan Tablosunu Sıfırla"}
        </button>
      </div>
      <StandingsTable rows={rows} compact />
      {error ? <p className="flash flash-error" style={{ marginTop: "0.75rem" }}>{error}</p> : null}
      {message ? <p className="flash flash-ok" style={{ marginTop: "0.75rem" }}>{message}</p> : null}
    </section>
  );
}
