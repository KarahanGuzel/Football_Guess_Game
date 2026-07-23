import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionOptions, type SessionData } from "@/lib/auth/session";
import type { SessionPlayer } from "@/types/session";

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}

export async function getCurrentPlayer(): Promise<SessionPlayer | null> {
  try {
    const session = await getSession();
    if (!session.playerId || !session.displayName) return null;
    return {
      playerId: session.playerId,
      displayName: session.displayName,
      isAdmin: Boolean(session.isAdmin),
    };
  } catch {
    return null;
  }
}

export async function requirePlayer(): Promise<SessionPlayer> {
  const player = await getCurrentPlayer();
  if (!player) redirect("/login");
  return player;
}

export async function requireAdmin(): Promise<SessionPlayer> {
  const player = await requirePlayer();
  if (!player.isAdmin) redirect("/");
  return player;
}
