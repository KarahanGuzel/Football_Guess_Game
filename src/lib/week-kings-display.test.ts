import { describe, expect, it } from "vitest";
import { compactWeekKings } from "@/lib/week-kings-display";

describe("compactWeekKings", () => {
  it("keeps the latest week and the previous four", () => {
    const rows = [1, 2, 3, 4, 5, 6];
    expect(compactWeekKings(rows)).toEqual([6, 5, 4, 3, 2]);
  });
});
