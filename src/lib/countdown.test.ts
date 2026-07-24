import { describe, expect, it } from "vitest";
import { formatCountdownLabel, getCountdownParts } from "@/lib/countdown";

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
    expect(formatCountdownLabel(parts)).toBe("kilitlendi");
  });
});
