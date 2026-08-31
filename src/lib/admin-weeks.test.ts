import { describe, expect, it } from "vitest";
import { groupAdminWeekBundles } from "@/lib/admin-weeks";
import { sortMatchesForDisplay } from "@/lib/match-display";
import { derbySplitWashStyle } from "@/lib/team-colors";
import { compareWeeksChronologically, weekIndexFromLabel } from "@/lib/week-label";
import { canCalculateWeekPoints } from "@/lib/week-lock";
import type { MatchWithTeams, Week } from "@/types/database";

function week(
  id: string,
  status: Week["status"],
  label: string,
  createdAt: string,
): Week {
  return {
    id,
    label,
    status,
    notes: null,
    created_at: createdAt,
    bypass_time_lock: false,
  };
}

function match(id: string, kickoff: string, derby = false): MatchWithTeams {
  return {
    id,
    week_id: "w",
    home_team_id: "h",
    away_team_id: "a",
    kickoff_at: kickoff,
    is_bonus: false,
    is_derby: derby,
    home_goals: null,
    away_goals: null,
    status: "scheduled",
    home_team: {
      id: "h",
      name: "Fenerbahçe",
      short_name: "FB",
      is_derby_club: true,
      sort_order: 1,
    },
    away_team: {
      id: "a",
      name: "Beşiktaş",
      short_name: "BJK",
      is_derby_club: true,
      sort_order: 2,
    },
  };
}

describe("weekIndexFromLabel / compareWeeksChronologically", () => {
  it("sorts week 10 after week 2", () => {
    expect(weekIndexFromLabel("SüperLig 10.Hafta")).toBe(10);
    const weeks = [
      { label: "SüperLig 10.Hafta", created_at: "2026-08-01T10:00:00.000Z" },
      { label: "SüperLig 2.Hafta", created_at: "2026-08-01T11:00:00.000Z" },
      { label: "SüperLig 3.Hafta", created_at: "2026-08-01T12:00:00.000Z" },
    ];
    const sorted = [...weeks].sort(compareWeeksChronologically);
    expect(sorted.map((w) => w.label)).toEqual([
      "SüperLig 2.Hafta",
      "SüperLig 3.Hafta",
      "SüperLig 10.Hafta",
    ]);
  });
});

describe("groupAdminWeekBundles", () => {
  it("splits live, upcoming, and scored, and treats a timed-out open week as live/locked", () => {
    const now = new Date("2026-09-04T18:00:00.000Z");
    const sections = groupAdminWeekBundles(
      [
        {
          week: week("w4", "open", "SüperLig 4.Hafta", "2026-08-20T10:00:00.000Z"),
          matches: [match("m4", "2026-09-04T17:00:00.000Z")],
        },
        {
          week: week("w5", "draft", "SüperLig 5.Hafta", "2026-08-01T10:00:00.000Z"),
          matches: [match("m5", "2026-09-13T16:00:00.000Z")],
        },
        {
          week: week("w10", "draft", "SüperLig 10.Hafta", "2026-07-23T10:00:00.000Z"),
          matches: [match("m10", "2026-11-01T16:00:00.000Z")],
        },
        {
          week: week("w3", "scored", "SüperLig 3.Hafta", "2026-08-10T10:00:00.000Z"),
          matches: [match("m3", "2026-08-30T16:00:00.000Z")],
        },
        {
          week: week("w1", "scored", "SüperLig 1.Hafta", "2026-08-01T10:00:00.000Z"),
          matches: [match("m1", "2026-08-16T16:00:00.000Z")],
        },
      ],
      now,
    );

    expect(sections.map((s) => s.id)).toEqual(["live", "upcoming", "scored"]);
    expect(sections[0].weeks.map((w) => w.week.id)).toEqual(["w4"]);
    expect(sections[1].weeks.map((w) => w.week.label)).toEqual([
      "SüperLig 5.Hafta",
      "SüperLig 10.Hafta",
    ]);
    expect(sections[2].weeks.map((w) => w.week.label)).toEqual([
      "SüperLig 3.Hafta",
      "SüperLig 1.Hafta",
    ]);
  });
});

describe("sortMatchesForDisplay", () => {
  it("puts the derby above earlier non-derby kickoffs", () => {
    const derby = match("d", "2026-09-05T17:00:00.000Z", true);
    const earlier = match("e", "2026-09-04T17:00:00.000Z");
    const later = match("l", "2026-09-06T17:00:00.000Z");
    expect(sortMatchesForDisplay([later, derby, earlier]).map((m) => m.id)).toEqual([
      "d",
      "e",
      "l",
    ]);
  });
});

describe("derbySplitWashStyle", () => {
  it("splits Fenerbahce yellow and Besiktas black", () => {
    expect(
      derbySplitWashStyle({
        homeName: "Fenerbahçe",
        awayName: "Beşiktaş",
      }),
    ).toEqual({
      "--derby-home": "#FFED00",
      "--derby-home-b": "#002D72",
      "--derby-away": "#111111",
      "--derby-away-b": "#FFFFFF",
    });
  });
});

describe("canCalculateWeekPoints", () => {
  it("allows scoring an open week after the time lock", () => {
    const matches = [{ kickoff_at: "2026-09-04T17:00:00.000Z" }];
    expect(
      canCalculateWeekPoints(
        { status: "open" },
        matches,
        new Date("2026-09-04T16:00:00.000Z"),
      ),
    ).toBe(true);
    expect(
      canCalculateWeekPoints(
        { status: "open" },
        matches,
        new Date("2026-09-04T15:00:00.000Z"),
      ),
    ).toBe(false);
  });
});
