"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resetSeasonToUnplayedAction } from "@/app/actions/admin";

const CONFIRM_TOKEN = "ONAYLA";

export function SeasonResetPanel() {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm">("idle");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canSubmit = typed.trim().toLocaleUpperCase("tr-TR") === CONFIRM_TOKEN;

  function onReset() {
    if (!canSubmit || pending) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await resetSeasonToUnplayedAction();
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage("Reset tamam. Fikstür duruyor; tahminler ve puanlar silindi.");
      setStep("idle");
      setTyped("");
      router.refresh();
    });
  }

  return (
    <section className="panel reveal season-reset-panel">
      <div className="section-head">
        <h2 className="section-title">Reset</h2>
      </div>
      <p className="season-reset-lead">
        Fikstür, bonus ve derbi işaretleri kalır. Tahminler, puan tablosu ve
        haftanın kralları sıfırlanır. Tüm haftalar taslağa döner — 1. hafta da
        oynanmamış görünür.
      </p>

      {step === "idle" ? (
        <button
          type="button"
          className="btn btn-season-reset"
          disabled={pending}
          onClick={() => {
            setError(null);
            setMessage(null);
            setTyped("");
            setStep("confirm");
          }}
        >
          Reset
        </button>
      ) : (
        <div className="season-reset-confirm">
          <p className="season-reset-confirm-copy">
            Bu işlem geri alınamaz. Onaylamak için{" "}
            <strong>{CONFIRM_TOKEN}</strong> yaz.
          </p>
          <div className="field">
            <label htmlFor="season-reset-token">Onay</label>
            <input
              id="season-reset-token"
              autoComplete="off"
              spellCheck={false}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder={CONFIRM_TOKEN}
            />
          </div>
          <div className="admin-action-row">
            <button
              type="button"
              className="btn btn-season-reset"
              disabled={pending || !canSubmit}
              onClick={onReset}
            >
              {pending ? "Reset..." : "Reset"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={pending}
              onClick={() => {
                setStep("idle");
                setTyped("");
                setError(null);
              }}
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {error ? (
        <p className="flash flash-error" style={{ marginTop: "0.75rem" }}>
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="flash flash-ok" style={{ marginTop: "0.75rem" }}>
          {message}
        </p>
      ) : null}
    </section>
  );
}
