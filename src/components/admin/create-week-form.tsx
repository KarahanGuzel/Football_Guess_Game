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
      className="panel"
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
      <div className="field">
        <label htmlFor="label">Yeni hafta adı</label>
        <input
          id="label"
          name="label"
          placeholder="Örn: 2025-26 12. Hafta"
          required
        />
      </div>
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Oluşturuluyor..." : "Hafta Oluştur"}
      </button>
      {error ? <p style={{ color: "#ffb4b4", margin: 0 }}>{error}</p> : null}
    </form>
  );
}
