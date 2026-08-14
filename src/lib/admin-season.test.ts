import { describe, expect, it } from "vitest";
import {
  canClearScoredWeek,
  getClearWeekBlockReason,
  getLaterPlayedWeeks,
} from "@/lib/admin-season";
import type { WeekStatus } from "@/types/database";

function week(
  id: string,
  status: WeekStatus,
  createdAt: string,
  label = id,
) {
  return { id, label, status, created_at: createdAt };
}

const week1 = week("w1", "scored", "2026-08-01T10:00:00.000Z", "SüperLig 1.Hafta");
const week2 = week("w2", "scored", "2026-08-08T10:00:00.000Z", "SüperLig 2.Hafta");
const week3draft = week("w3", "draft", "2026-08-15T10:00:00.000Z", "SüperLig 3.Hafta");
const week3open = week("w3", "open", "2026-08-15T10:00:00.000Z", "SüperLig 3.Hafta");
const week3locked = week("w3", "locked", "2026-08-15T10:00:00.000Z", "SüperLig 3.Hafta");

describe("getClearWeekBlockReason", () => {
  it("allows clearing the latest scored week when later weeks are still draft", () => {
    const weeks = [week1, week2, week3draft];
    expect(canClearScoredWeek(week2, weeks)).toBe(true);
    expect(getClearWeekBlockReason(week2, weeks)).toBeNull();
  });

  it("blocks an earlier scored week until the later scored week is cleared", () => {
    const weeks = [week1, week2, week3draft];
    expect(canClearScoredWeek(week1, weeks)).toBe(false);
    expect(getClearWeekBlockReason(week1, weeks)).toBe(
      "Önce SüperLig 2.Hafta temizlenmeli.",
    );
  });

  it("blocks clearing when a later week is already open", () => {
    const weeks = [week1, week2, week3open];
    expect(getClearWeekBlockReason(week2, weeks)).toBe(
      "SüperLig 3.Hafta hâlâ yayında. Sıra bozulmasın diye bu hafta temizlenemez.",
    );
  });

  it("blocks clearing when a later week is locked", () => {
    const weeks = [week1, week2, week3locked];
    expect(getClearWeekBlockReason(week2, weeks)).toBe(
      "SüperLig 3.Hafta hâlâ kilitli. Sıra bozulmasın diye bu hafta temizlenemez.",
    );
  });

  it("rejects weeks that are not scored", () => {
    expect(getClearWeekBlockReason(week3open, [week3open])).toBe(
      "Sadece puanı hesaplanmış hafta temizlenebilir.",
    );
  });

  it("points at the latest blocking week, not an in-between one", () => {
    const week3scored = week("w3", "scored", "2026-08-15T10:00:00.000Z", "SüperLig 3.Hafta");
    const weeks = [week1, week2, week3scored];
    expect(getClearWeekBlockReason(week1, weeks)).toBe(
      "Önce SüperLig 3.Hafta temizlenmeli.",
    );
    expect(getLaterPlayedWeeks(week1, weeks).map((w) => w.id)).toEqual([
      "w2",
      "w3",
    ]);
  });
});
