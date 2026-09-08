"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateWeekLabelAction } from "@/app/actions/admin";

export function EditWeekLabelForm({
  weekId,
  initialLabel,
}: {
  weekId: string;
  initialLabel: string;
}) {
  const router = useRouter();
  const [label, setLabel] = useState(initialLabel);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setLabel(initialLabel);
  }, [initialLabel]);

  const dirty = label.trim() !== initialLabel;

  return (
    <form
      className="panel reveal"
      style={{ display: "grid", gap: "0.75rem" }}
      action={(formData) => {
        setError(null);
        setMessage(null);
        startTransition(async () => {
          const result = await updateWeekLabelAction(formData);
          if (result?.error) {
            setError(result.error);
            return;
          }
          setMessage("Hafta adı güncellendi.");
          router.refresh();
        });
      }}
    >
      <div className="section-head" style={{ marginBottom: 0 }}>
        <h2 className="section-title">Hafta adı</h2>
      </div>
      <input type="hidden" name="weekId" value={weekId} />
      <div className="field">
        <label htmlFor="week-label">İsim</label>
        <input
          id="week-label"
          name="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={80}
          placeholder="SüperLig 5.Hafta"
          required
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", alignItems: "center" }}>
        <button
          className="btn btn-secondary"
          type="submit"
          disabled={pending || !dirty || !label.trim()}
        >
          {pending ? "Kaydediliyor..." : "Adı Kaydet"}
        </button>
        {dirty ? (
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            disabled={pending}
            onClick={() => {
              setLabel(initialLabel);
              setError(null);
              setMessage(null);
            }}
          >
            Vazgeç
          </button>
        ) : null}
      </div>
      {message ? <p className="flash flash-ok">{message}</p> : null}
      {error ? <p className="flash flash-error">{error}</p> : null}
    </form>
  );
}
