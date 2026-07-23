"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/current-user";
import { getPlayerById } from "@/lib/data";

export async function loginAction(formData: FormData): Promise<{ error: string } | void> {
  const playerId = String(formData.get("playerId") ?? "");
  if (!playerId) {
    return { error: "Lütfen bir kullanıcı seç." };
  }

  let player;
  try {
    player = await getPlayerById(playerId);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Giriş yapılamadı. Ortam ayarlarını kontrol et.",
    };
  }

  if (!player) {
    return { error: "Kullanıcı bulunamadı." };
  }

  try {
    const session = await getSession();
    session.playerId = player.id;
    session.displayName = player.display_name;
    session.isAdmin = player.is_admin;
    await session.save();
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Oturum oluşturulamadı (SESSION_SECRET?).",
    };
  }

  redirect("/");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  revalidatePath("/", "layout");
  redirect("/login");
}
