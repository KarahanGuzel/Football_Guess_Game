"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/current-user";
import {
  getMatchesForWeek,
  getPredictionsForMatches,
  getWeek,
} from "@/lib/data";
import { scorePrediction } from "@/lib/scoring";
import { getSupabaseAdmin } from "@/lib/supabase/server";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/standings");
  revalidatePath("/history");
  revalidatePath("/fixtures");
  revalidatePath("/admin");
}

/** `YYYY-MM-DDTHH:mm` → ISO UTC, Türkiye saati (UTC+3) olarak yorumlanır. */
function istanbulLocalToIso(local: string): string | null {
  const normalized = local.length === 16 ? `${local}:00` : local;
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!match) return null;
  const [, y, mo, d, h, mi, s = "00"] = match;
  const iso = `${y}-${mo}-${d}T${h}:${mi}:${s}+03:00`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function createWeekAction(formData: FormData) {
  await requireAdmin();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return { error: "Hafta adı gerekli." };

  const { data, error } = await getSupabaseAdmin()
    .from("weeks")
    .insert({ label, status: "draft" })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true as const, weekId: data.id as string };
}

export async function updateWeekLabelAction(formData: FormData) {
  await requireAdmin();
  const weekId = String(formData.get("weekId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();

  if (!weekId) return { error: "Hafta bulunamadı." };
  if (!label) return { error: "Hafta adı gerekli." };
  if (label.length > 80) return { error: "Hafta adı en fazla 80 karakter olabilir." };

  const week = await getWeek(weekId);
  if (!week) return { error: "Hafta bulunamadı." };

  if (week.label === label) {
    return { ok: true as const };
  }

  const { error } = await getSupabaseAdmin()
    .from("weeks")
    .update({ label })
    .eq("id", weekId);

  if (error) return { error: error.message };
  revalidateAll();
  revalidatePath(`/admin/weeks/${weekId}`);
  revalidatePath(`/history/${weekId}`);
  return { ok: true as const };
}

export async function openWeekAction(weekId: string) {
  await requireAdmin();
  const matches = await getMatchesForWeek(weekId);
  if (matches.length === 0) return { error: "Önce en az bir maç ekle." };

  const bonusCount = matches.filter((m) => m.is_bonus).length;
  if (bonusCount !== 1) {
    return { error: "Haftayı açmadan önce tam olarak 1 bonus maç seçmelisin." };
  }

  const { error } = await getSupabaseAdmin()
    .from("weeks")
    .update({ status: "open" })
    .eq("id", weekId)
    .eq("status", "draft");

  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true as const };
}

export async function lockWeekAction(weekId: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin()
    .from("weeks")
    .update({ status: "locked" })
    .eq("id", weekId)
    .in("status", ["open", "draft"]);

  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true as const };
}

export async function unlockWeekAction(weekId: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin()
    .from("weeks")
    .update({ status: "open" })
    .eq("id", weekId)
    .eq("status", "locked");

  if (error) return { error: error.message };
  revalidateAll();
  revalidatePath(`/admin/weeks/${weekId}`);
  return { ok: true as const };
}

const matchSchema = z.object({
  weekId: z.string().uuid(),
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  kickoffAt: z.string().min(1),
});

export async function addMatchAction(input: {
  weekId: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt: string;
}) {
  await requireAdmin();
  const parsed = matchSchema.safeParse(input);
  if (!parsed.success) return { error: "Geçersiz maç bilgisi." };

  if (parsed.data.homeTeamId === parsed.data.awayTeamId) {
    return { error: "Ev sahibi ve deplasman aynı olamaz." };
  }

  const week = await getWeek(parsed.data.weekId);
  if (!week) return { error: "Hafta bulunamadı." };
  if (week.status === "scored") {
    return { error: "Puanı hesaplanmış haftaya maç eklenemez." };
  }

  // datetime-local değeri Europe/Istanbul (UTC+3, yaz saati yok) kabul edilir
  const kickoffIso = istanbulLocalToIso(parsed.data.kickoffAt);
  if (!kickoffIso) {
    return { error: "Geçersiz maç saati." };
  }

  const { error } = await getSupabaseAdmin().from("matches").insert({
    week_id: parsed.data.weekId,
    home_team_id: parsed.data.homeTeamId,
    away_team_id: parsed.data.awayTeamId,
    kickoff_at: kickoffIso,
  });

  if (error) return { error: error.message };
  revalidateAll();
  revalidatePath(`/admin/weeks/${parsed.data.weekId}`);
  return { ok: true as const };
}

export async function setBonusMatchAction(weekId: string, matchId: string) {
  await requireAdmin();
  const matches = await getMatchesForWeek(weekId);
  const match = matches.find((m) => m.id === matchId);
  if (!match) return { error: "Maç bulunamadı." };
  if (match.is_derby) {
    return { error: "Derbi maç bonus olamaz." };
  }

  const db = getSupabaseAdmin();
  const clear = await db
    .from("matches")
    .update({ is_bonus: false })
    .eq("week_id", weekId);
  if (clear.error) return { error: clear.error.message };

  const set = await db
    .from("matches")
    .update({ is_bonus: true })
    .eq("id", matchId)
    .eq("week_id", weekId);
  if (set.error) return { error: set.error.message };

  revalidateAll();
  revalidatePath(`/admin/weeks/${weekId}`);
  return { ok: true as const };
}

export async function enterScoreAction(input: {
  matchId: string;
  weekId: string;
  homeGoals: number;
  awayGoals: number;
}) {
  await requireAdmin();
  const homeGoals = Number(input.homeGoals);
  const awayGoals = Number(input.awayGoals);
  if (
    !Number.isInteger(homeGoals) ||
    !Number.isInteger(awayGoals) ||
    homeGoals < 0 ||
    awayGoals < 0
  ) {
    return { error: "Skorlar 0 veya pozitif tam sayı olmalı." };
  }

  const { error } = await getSupabaseAdmin()
    .from("matches")
    .update({
      home_goals: homeGoals,
      away_goals: awayGoals,
      status: "finished",
    })
    .eq("id", input.matchId)
    .eq("week_id", input.weekId);

  if (error) return { error: error.message };
  revalidateAll();
  revalidatePath(`/admin/weeks/${input.weekId}`);
  return { ok: true as const };
}

export async function saveWeekScoresAction(input: {
  weekId: string;
  scores: { matchId: string; homeGoals: number; awayGoals: number }[];
}) {
  await requireAdmin();

  const week = await getWeek(input.weekId);
  if (!week) return { error: "Hafta bulunamadı." };
  if (week.status !== "locked" && week.status !== "open") {
    return { error: "Bu haftaya skor girilemez." };
  }

  const matches = await getMatchesForWeek(input.weekId);
  const matchIds = new Set(matches.map((m) => m.id));

  if (input.scores.length !== matches.length) {
    return { error: "Tüm maçlar için skor girmelisin." };
  }

  for (const row of input.scores) {
    if (!matchIds.has(row.matchId)) {
      return { error: "Geçersiz maç." };
    }
    const homeGoals = Number(row.homeGoals);
    const awayGoals = Number(row.awayGoals);
    if (
      !Number.isInteger(homeGoals) ||
      !Number.isInteger(awayGoals) ||
      homeGoals < 0 ||
      awayGoals < 0
    ) {
      return { error: "Skorlar 0 veya pozitif tam sayı olmalı." };
    }
  }

  const db = getSupabaseAdmin();
  for (const row of input.scores) {
    const { error } = await db
      .from("matches")
      .update({
        home_goals: Number(row.homeGoals),
        away_goals: Number(row.awayGoals),
        status: "finished",
      })
      .eq("id", row.matchId)
      .eq("week_id", input.weekId);

    if (error) return { error: error.message };
  }

  revalidateAll();
  revalidatePath(`/admin/weeks/${input.weekId}`);
  return { ok: true as const };
}

export async function calculateWeekPointsAction(weekId: string) {
  await requireAdmin();

  const week = await getWeek(weekId);
  if (!week) return { error: "Hafta bulunamadı." };
  if (week.status !== "locked") {
    return { error: "Puan hesaplamak için hafta kilitli olmalı." };
  }

  const matches = await getMatchesForWeek(weekId);
  if (matches.length === 0) return { error: "Bu haftada maç yok." };

  const incomplete = matches.some(
    (m) => m.home_goals === null || m.away_goals === null,
  );
  if (incomplete) {
    return { error: "Tüm maç skorları kaydedilmeden puan hesaplanamaz." };
  }

  const matchById = new Map(matches.map((m) => [m.id, m]));
  const predictions = await getPredictionsForMatches(matches.map((m) => m.id));
  const db = getSupabaseAdmin();

  for (const prediction of predictions) {
    const match = matchById.get(prediction.match_id);
    if (!match || match.home_goals === null || match.away_goals === null) {
      continue;
    }

    const scored = scorePrediction({
      result: prediction.result,
      goalsMarket: prediction.goals_market,
      homeGoals: match.home_goals,
      awayGoals: match.away_goals,
      isBonus: match.is_bonus,
      isDerby: match.is_derby,
    });

    const { error } = await db
      .from("predictions")
      .update({
        result_correct: scored.resultCorrect,
        goals_correct: scored.goalsCorrect,
        points_earned: scored.pointsEarned,
      })
      .eq("id", prediction.id);

    if (error) return { error: error.message };
  }

  const finishMatches = await db
    .from("matches")
    .update({ status: "finished" })
    .eq("week_id", weekId);
  if (finishMatches.error) return { error: finishMatches.error.message };

  const scoreWeek = await db
    .from("weeks")
    .update({ status: "scored" })
    .eq("id", weekId);
  if (scoreWeek.error) return { error: scoreWeek.error.message };

  revalidateAll();
  revalidatePath(`/admin/weeks/${weekId}`);
  revalidatePath(`/history/${weekId}`);
  return { ok: true as const };
}

/** Puanlanmış haftayı sıfırlar: skorlar + o haftanın tahmin puanları temizlenir, durum kilitli olur. */
export async function clearWeekAction(weekId: string) {
  await requireAdmin();
  const week = await getWeek(weekId);
  if (!week) return { error: "Hafta bulunamadı." };
  if (week.status !== "scored") {
    return { error: "Sadece puanı hesaplanmış hafta temizlenebilir." };
  }

  const matches = await getMatchesForWeek(weekId);
  const matchIds = matches.map((m) => m.id);
  const db = getSupabaseAdmin();

  if (matchIds.length > 0) {
    const clearPredictions = await db
      .from("predictions")
      .update({
        result_correct: null,
        goals_correct: null,
        points_earned: null,
      })
      .in("match_id", matchIds);
    if (clearPredictions.error) return { error: clearPredictions.error.message };
  }

  const clearScores = await db
    .from("matches")
    .update({
      home_goals: null,
      away_goals: null,
      status: "scheduled",
    })
    .eq("week_id", weekId);
  if (clearScores.error) return { error: clearScores.error.message };

  const resetWeek = await db
    .from("weeks")
    .update({ status: "locked" })
    .eq("id", weekId);
  if (resetWeek.error) return { error: resetWeek.error.message };

  revalidateAll();
  revalidatePath(`/admin/weeks/${weekId}`);
  revalidatePath(`/history/${weekId}`);
  return { ok: true as const };
}

/** Tüm puan tablosunu sıfırlar (tüm tahmin puanları + puanlanmış haftalar kilitliye döner). */
export async function resetStandingsAction() {
  await requireAdmin();
  const db = getSupabaseAdmin();

  const { data: predictionRows, error: listError } = await db
    .from("predictions")
    .select("id");
  if (listError) return { error: listError.message };

  const predictionIds = (predictionRows ?? []).map((row) => row.id as string);
  if (predictionIds.length > 0) {
    const clearPredictions = await db
      .from("predictions")
      .update({
        result_correct: null,
        goals_correct: null,
        points_earned: null,
      })
      .in("id", predictionIds);
    if (clearPredictions.error) return { error: clearPredictions.error.message };
  }

  const resetWeeks = await db
    .from("weeks")
    .update({ status: "locked" })
    .eq("status", "scored");
  if (resetWeeks.error) return { error: resetWeeks.error.message };

  revalidateAll();
  return { ok: true as const };
}

export async function deleteMatchAction(weekId: string, matchId: string) {
  await requireAdmin();
  const week = await getWeek(weekId);
  if (!week) return { error: "Hafta bulunamadı." };
  if (week.status !== "draft") {
    return { error: "Sadece taslak haftalardan maç silinebilir." };
  }

  const { error } = await getSupabaseAdmin()
    .from("matches")
    .delete()
    .eq("id", matchId)
    .eq("week_id", weekId);

  if (error) return { error: error.message };
  revalidateAll();
  revalidatePath(`/admin/weeks/${weekId}`);
  return { ok: true as const };
}

export async function deleteWeekAction(weekId: string) {
  await requireAdmin();
  const week = await getWeek(weekId);
  if (!week) return { error: "Hafta bulunamadı." };

  const { error } = await getSupabaseAdmin().from("weeks").delete().eq("id", weekId);

  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true as const };
}

