"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePlayer } from "@/lib/auth/current-user";
import { getPlayerById, getWeek } from "@/lib/data";
import { isSlipReactionKey } from "@/lib/slip-reactions";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const addSchema = z.object({
  weekId: z.string().uuid(),
  targetPlayerId: z.string().uuid(),
  body: z.string().trim().min(1).max(280),
});

function revalidateComments() {
  revalidatePath("/predictions");
}

function reactionTableMissing(error: { code?: string; message: string }) {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.message.includes("slip_comment_reactions")
  );
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

export async function toggleSlipCommentReactionAction(input: {
  commentId: string;
  reaction: string;
}) {
  const player = await requirePlayer();
  const commentId = input.commentId?.trim();
  if (!commentId) return { error: "Yorum bulunamadı." };
  if (!isSlipReactionKey(input.reaction)) {
    return { error: "Geçersiz tepki." };
  }

  const db = getSupabaseAdmin();
  const { data: comment, error: fetchError } = await db
    .from("slip_comments")
    .select("id, week_id")
    .eq("id", commentId)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!comment) return { error: "Yorum bulunamadı." };

  const week = await getWeek(comment.week_id);
  if (!week) return { error: "Hafta bulunamadı." };
  if (week.status === "draft") {
    return { error: "Taslak haftaya tepki verilemez." };
  }

  const { data: existing, error: existingError } = await db
    .from("slip_comment_reactions")
    .select("id")
    .eq("comment_id", commentId)
    .eq("player_id", player.playerId)
    .eq("reaction", input.reaction)
    .maybeSingle();

  if (existingError) {
    if (reactionTableMissing(existingError)) {
      return { error: "Tepkiler için SQL henüz çalıştırılmamış." };
    }
    return { error: existingError.message };
  }

  if (existing) {
    const { error } = await db
      .from("slip_comment_reactions")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: error.message };
    revalidateComments();
    return { ok: true as const };
  }

  const { error } = await db.from("slip_comment_reactions").insert({
    comment_id: commentId,
    player_id: player.playerId,
    reaction: input.reaction,
  });

  if (error) {
    if (error.code === "23505") {
      revalidateComments();
      return { ok: true as const };
    }
    if (reactionTableMissing(error)) {
      return { error: "Tepkiler için SQL henüz çalıştırılmamış." };
    }
    return { error: error.message };
  }

  revalidateComments();
  return { ok: true as const };
}
