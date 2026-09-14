"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { saveLigDefteriSettingsAction } from "@/app/actions/admin";
import {
  LIG_DEFTERI_SLOT_COUNT,
  type LigDefteriSettings,
  type LigDefteriSlot,
  type LigDefteriStory,
} from "@/lib/lig-defteri";

function slotFromForm(
  form: FormData,
  index: number,
  stories: LigDefteriStory[],
): LigDefteriSlot {
  const mode = form.get(`slot-${index}-mode`) === "custom" ? "custom" : "auto";
  const autoStoryId = String(form.get(`slot-${index}-auto`) ?? "").trim();
  return {
    mode,
    autoStoryId:
      mode === "auto" && autoStoryId && stories.some((story) => story.id === autoStoryId)
        ? autoStoryId
        : null,
    kicker: String(form.get(`slot-${index}-kicker`) ?? ""),
    headline: String(form.get(`slot-${index}-headline`) ?? ""),
    detail: String(form.get(`slot-${index}-detail`) ?? ""),
  };
}

export function LigDefteriAdminForm({
  stories,
  settings,
}: {
  stories: LigDefteriStory[];
  settings: LigDefteriSettings;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [modes, setModes] = useState(
    settings.slots.map((slot) => slot.mode),
  );

  const options = useMemo(
    () =>
      stories.map((story) => ({
        id: story.id,
        label: `${story.kicker} · ${story.headline}`,
      })),
    [stories],
  );

  return (
    <form
      className="panel reveal lig-defteri-admin"
      action={(formData) => {
        setError(null);
        setMessage(null);
        const slots = Array.from({ length: LIG_DEFTERI_SLOT_COUNT }, (_, index) =>
          slotFromForm(formData, index, stories),
        );
        startTransition(async () => {
          const result = await saveLigDefteriSettingsAction({ slots });
          if (result.error) {
            setError(result.error);
            return;
          }
          setMessage("Lig defteri kaydedildi.");
          router.refresh();
        });
      }}
    >
      <div className="section-head">
        <h2 className="section-title">Lig defteri</h2>
        <span className="muted" style={{ fontSize: "0.85rem" }}>
          Ana sayfada 5 satır
        </span>
      </div>
      <p className="muted" style={{ margin: "0 0 0.85rem", fontSize: "0.88rem" }}>
        Otomatik satır küpürlerden üretilir. İstersen bir satırı kilitle veya kendi
        cümleni yaz.
      </p>

      <ol className="lig-defteri-admin-slots">
        {settings.slots.map((slot, index) => (
          <li key={index} className="lig-defteri-admin-slot">
            <p className="lig-defteri-admin-slot-no">{index + 1}</p>
            <div className="field">
              <label htmlFor={`slot-${index}-mode`}>Kaynak</label>
              <select
                id={`slot-${index}-mode`}
                name={`slot-${index}-mode`}
                value={modes[index]}
                onChange={(event) => {
                  const value = event.target.value === "custom" ? "custom" : "auto";
                  setModes((prev) =>
                    prev.map((mode, i) => (i === index ? value : mode)),
                  );
                }}
              >
                <option value="auto">Otomatik</option>
                <option value="custom">Özel yazı</option>
              </select>
            </div>
            {modes[index] === "auto" ? (
              <div className="field">
                <label htmlFor={`slot-${index}-auto`}>Satır</label>
                <select
                  id={`slot-${index}-auto`}
                  name={`slot-${index}-auto`}
                  defaultValue={slot.autoStoryId ?? ""}
                >
                  <option value="">Sıradaki otomatik</option>
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <input type="hidden" name={`slot-${index}-auto`} value="" />
                <div className="field">
                  <label htmlFor={`slot-${index}-kicker`}>Üst yazı</label>
                  <input
                    id={`slot-${index}-kicker`}
                    name={`slot-${index}-kicker`}
                    defaultValue={slot.kicker}
                    placeholder="Bu hafta"
                  />
                </div>
                <div className="field">
                  <label htmlFor={`slot-${index}-headline`}>Cümle</label>
                  <input
                    id={`slot-${index}-headline`}
                    name={`slot-${index}-headline`}
                    defaultValue={slot.headline}
                    placeholder="Herkes Fenerbahçe dedi."
                    required={modes[index] === "custom"}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`slot-${index}-detail`}>Not</label>
                  <input
                    id={`slot-${index}-detail`}
                    name={`slot-${index}-detail`}
                    defaultValue={slot.detail}
                    placeholder="Fenerbahçe–Eyüpspor"
                  />
                </div>
              </>
            )}
          </li>
        ))}
      </ol>

      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Kaydediliyor..." : "Defteri kaydet"}
      </button>
      {error ? <p className="flash flash-error">{error}</p> : null}
      {message ? <p className="flash flash-ok">{message}</p> : null}
    </form>
  );
}
