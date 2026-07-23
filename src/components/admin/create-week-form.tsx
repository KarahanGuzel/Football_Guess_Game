"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createWeekAction } from "@/app/actions/admin";

export function CreateWeekForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="panel reveal"
      style={{ display: "grid", gap: "0.75rem" }}
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await createWeekAction(formData);
          if (result && "error" in result && result.error) {
            setError(result.error);
            return;
          }
          if (result && "weekId" in result && result.weekId) {
            router.push(`/admin/weeks/${result.weekId}`);
          }
        });
      }}
    >
      <div className="section-head" style={{ marginBottom: 0 }}>
        <h2 className="section-title">Yeni hafta ekle</h2>
      </div>
      <div className="field">
        <label htmlFor="label">Hafta adı</label>
        <input
          id="label"
          name="label"
          placeholder="Örn: 2026-27 11. Hafta"
          required
        />
      </div>
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Oluşturuluyor..." : "Hafta Oluştur"}
      </button>
      {error ? <p className="flash flash-error">{error}</p> : null}
    </form>
  );
}
