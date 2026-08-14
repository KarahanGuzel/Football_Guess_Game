import { describe, expect, it } from "vitest";
import {
  attachCommentReactions,
  isSlipReactionKey,
  summarizeCommentReactions,
  toggleReactionList,
} from "@/lib/slip-reactions";

describe("slip reactions", () => {
  it("accepts only the three reaction keys", () => {
    expect(isSlipReactionKey("fire")).toBe(true);
    expect(isSlipReactionKey("heart")).toBe(false);
  });

  it("groups rows onto the matching comment", () => {
    const comments = attachCommentReactions(
      [{ id: "c1" }, { id: "c2" }],
      [
        { comment_id: "c1", player_id: "p1", reaction: "fire" },
        { comment_id: "c1", player_id: "p2", reaction: "fire" },
        { comment_id: "c1", player_id: "p1", reaction: "laugh" },
        { comment_id: "c2", player_id: "p3", reaction: "clap" },
        { comment_id: "c1", player_id: "p9", reaction: "nope" },
      ],
    );

    expect(comments[0].reactions).toEqual([
      { player_id: "p1", reaction: "fire" },
      { player_id: "p2", reaction: "fire" },
      { player_id: "p1", reaction: "laugh" },
    ]);
    expect(comments[1].reactions).toEqual([
      { player_id: "p3", reaction: "clap" },
    ]);
  });

  it("summarizes counts and whether the current player reacted", () => {
    const chips = summarizeCommentReactions(
      [
        { player_id: "p1", reaction: "fire" },
        { player_id: "p2", reaction: "fire" },
        { player_id: "p1", reaction: "laugh" },
      ],
      "p1",
    );

    expect(chips.map((chip) => [chip.key, chip.count, chip.mine])).toEqual([
      ["fire", 2, true],
      ["laugh", 1, true],
      ["clap", 0, false],
    ]);
  });

  it("toggles a single emoji without clearing the others", () => {
    const start = [
      { player_id: "p1", reaction: "fire" as const },
      { player_id: "p2", reaction: "fire" as const },
    ];
    const added = toggleReactionList(start, "p1", "laugh");
    expect(added).toEqual([
      { player_id: "p1", reaction: "fire" },
      { player_id: "p2", reaction: "fire" },
      { player_id: "p1", reaction: "laugh" },
    ]);
    expect(toggleReactionList(added, "p1", "fire")).toEqual([
      { player_id: "p2", reaction: "fire" },
      { player_id: "p1", reaction: "laugh" },
    ]);
  });
});
