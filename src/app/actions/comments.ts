"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePlayer } from "@/lib/auth/current-user";
import { getPlayerById, getWeek } from "@/lib/data";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const addSchema = z.object({
  weekId: z.string().uuid(),
  targetPlayerId: z.string().uuid(),
  body: z.string().trim().min(1).max(280),
});

function revalidateComments() {
  revalidatePath("/predictions");
}

export async function addSlipCommentAction(input: {
  weekId: string;
  targetPlayerId: string;
  body: string;
}) {
  const player = await requirePlayer();
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Yorum 1–280 karakter olmalı." };
  }

  const week = await getWeek(parsed.data.weekId);
  if (!week) return { error: "Hafta bulunamadı." };
  if (week.status === "draft") {
    return { error: "Taslak haftaya yorum yazılamaz." };
  }

  const target = await getPlayerById(parsed.data.targetPlayerId);
  if (!target) return { error: "Oyuncu bulunamadı." };

  const { error } = await getSupabaseAdmin().from("slip_comments").insert({
    week_id: parsed.data.weekId,
    target_player_id: parsed.data.targetPlayerId,
    author_player_id: player.playerId,
    body: parsed.data.body,
  });

  if (error) return { error: error.message };
  revalidateComments();
  return { ok: true as const };
}

export async function deleteSlipCommentAction(commentId: string) {
  const player = await requirePlayer();
  if (!commentId) return { error: "Yorum bulunamadı." };

  const { data: comment, error: fetchError } = await getSupabaseAdmin()
    .from("slip_comments")
    .select("id, author_player_id")
    .eq("id", commentId)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!comment) return { error: "Yorum bulunamadı." };

  const canDelete =
    comment.author_player_id === player.playerId || player.isAdmin;
  if (!canDelete) return { error: "Bu yorumu silemezsin." };

  const { error } = await getSupabaseAdmin()
    .from("slip_comments")
    .delete()
    .eq("id", commentId);

  if (error) return { error: error.message };
  revalidateComments();
  return { ok: true as const };
}
