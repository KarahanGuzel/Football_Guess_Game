"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePlayer } from "@/lib/auth/current-user";
import { getMatchesForWeek, getWeek } from "@/lib/data";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isWeekLockedByTime } from "@/lib/week-lock";

const predictionItemSchema = z.object({
  matchId: z.string().uuid(),
  result: z.enum(["home", "draw", "away"]),
  goalsMarket: z.enum(["under_25", "over_25"]),
});

const upsertSchema = z.object({
  weekId: z.string().uuid(),
  items: z.array(predictionItemSchema).min(1),
});

export async function upsertPredictionsAction(input: {
  weekId: string;
  items: { matchId: string; result: "home" | "draw" | "away"; goalsMarket: "under_25" | "over_25" }[];
}) {
  const player = await requirePlayer();
  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Geçersiz tahmin verisi." };
  }

  const week = await getWeek(parsed.data.weekId);
  if (!week) return { error: "Hafta bulunamadı." };

  const matches = await getMatchesForWeek(week.id);
  if (matches.length === 0) return { error: "Bu haftada maç yok." };

  if (isWeekLockedByTime(week.status, matches)) {
    return { error: "Tahminler kilitlendi. Artık değişiklik yapılamaz." };
  }

  if (week.status !== "open") {
    return { error: "Bu hafta tahminlere açık değil." };
  }

  const matchIds = new Set(matches.map((m) => m.id));
  const submittedIds = new Set(parsed.data.items.map((i) => i.matchId));

  if (submittedIds.size !== matchIds.size || [...matchIds].some((id) => !submittedIds.has(id))) {
    return { error: "Tüm maçlar için tahmin yapmalısın." };
  }

  for (const item of parsed.data.items) {
    if (!matchIds.has(item.matchId)) {
      return { error: "Geçersiz maç seçimi." };
    }
  }

  const rows = parsed.data.items.map((item) => ({
    player_id: player.playerId,
    match_id: item.matchId,
    result: item.result,
    goals_market: item.goalsMarket,
  }));

  const { error } = await getSupabaseAdmin().from("predictions").upsert(rows, {
    onConflict: "player_id,match_id",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/history");
  return { ok: true as const };
}
