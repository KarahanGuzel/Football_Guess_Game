import { describe, expect, it } from "vitest";
import {
  formatCountdownLabel,
  getCountdownParts,
  getLockCountdownView,
} from "@/lib/countdown";

describe("countdown", () => {
  it("formats multi-day remaining time", () => {
    const now = new Date("2026-07-24T12:00:00.000Z");
    const target = new Date("2026-07-26T14:30:00.000Z");
    const parts = getCountdownParts(target, now);
    expect(parts.days).toBe(2);
    expect(formatCountdownLabel(parts)).toBe("2g 2sa");
  });

  it("marks expired targets", () => {
    const now = new Date("2026-07-24T12:00:00.000Z");
    const target = new Date("2026-07-24T11:00:00.000Z");
    const parts = getCountdownParts(target, now);
    expect(parts.expired).toBe(true);
    expect(formatCountdownLabel(parts)).toBe("Kilitlendi");
  });
});

describe("getLockCountdownView", () => {
  const lockAtIso = "2026-08-16T16:00:00.000Z";
  const beforeLock = new Date("2026-08-16T12:00:00.000Z");
  const afterLock = new Date("2026-08-16T17:00:00.000Z");

  it("shows the ticking countdown and whistle while the week is open", () => {
    expect(
      getLockCountdownView({ locked: false, lockAtIso, now: beforeLock }),
    ).toEqual({
      label: "Tahminlerin Kilitlenmesine",
      time: "4sa 0dk",
      showEmoji: true,
    });
  });

  it("switches to Kilitlendi without the whistle when admin locks", () => {
    expect(
      getLockCountdownView({ locked: true, lockAtIso, now: beforeLock }),
    ).toEqual({
      label: "Kilitlendi",
      time: null,
      showEmoji: false,
    });
  });

  it("restores the countdown after unlock if lock time has not passed", () => {
    expect(
      getLockCountdownView({ locked: false, lockAtIso, now: beforeLock })
        ?.showEmoji,
    ).toBe(true);
  });

  it("shows Kilitlendi without the whistle after the timer expires", () => {
    expect(
      getLockCountdownView({ locked: false, lockAtIso, now: afterLock }),
    ).toEqual({
      label: "Kilitlendi",
      time: null,
      showEmoji: false,
    });
  });

  it("still shows Kilitlendi when locked even if there is no lock time", () => {
    expect(
      getLockCountdownView({ locked: true, lockAtIso: null }),
    ).toEqual({
      label: "Kilitlendi",
      time: null,
      showEmoji: false,
    });
  });
});
