import { describe, expect, it } from "vitest";
import {
  formatUnderOver,
  percentLabel,
  translateAdvice,
} from "@/lib/match-preview-labels";

describe("formatUnderOver", () => {
  it("maps over/under labels", () => {
    expect(formatUnderOver("Over 2.5")).toBe("Üst 2.5");
    expect(formatUnderOver("Under 2.5")).toBe("Alt 2.5");
  });
});

describe("translateAdvice", () => {
  it("translates common phrases", () => {
    const text = translateAdvice("Win or draw for Fenerbahce");
    expect(text?.toLowerCase()).toContain("galibiyet veya beraberlik");
  });
});

describe("percentLabel", () => {
  it("formats rounded percents", () => {
    expect(percentLabel(45.2)).toBe("45%");
    expect(percentLabel(null)).toBe("—");
  });
});
