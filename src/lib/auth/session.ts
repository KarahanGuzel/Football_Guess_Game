import type { SessionData } from "@/types/database";
import type { SessionOptions } from "iron-session";

export type { SessionData };

export function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "SESSION_SECRET eksik veya çok kısa (en az 32 karakter olmalı).",
    );
  }

  return {
    password,
    cookieName: "fgg_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}
