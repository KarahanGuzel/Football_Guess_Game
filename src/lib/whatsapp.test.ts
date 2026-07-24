import { describe, expect, it } from "vitest";
import {
  buildLockReminderMessage,
  buildWhatsAppShareUrl,
  normalizeWhatsAppPhone,
} from "@/lib/whatsapp";

describe("whatsapp reminder", () => {
  it("builds lock reminder with site link", () => {
    const text = buildLockReminderMessage({
      weekLabel: "2026-27 Hafta 3",
      lockAtLabel: "24 Temmuz 19:00",
      appUrl: "https://tahmin.example",
    });
    expect(text).toContain("Tahminler kilitleniyor!");
    expect(text).toContain("2026-27 Hafta 3");
    expect(text).toContain("https://tahmin.example");
  });

  it("opens chat picker when no phone is set", () => {
    const url = buildWhatsAppShareUrl("merhaba dünya");
    expect(url).toBe(
      `https://wa.me/?text=${encodeURIComponent("merhaba dünya")}`,
    );
  });

  it("opens a direct chat when phone is set", () => {
    expect(normalizeWhatsAppPhone("+90 555 111 22 33")).toBe("905551112233");
    const url = buildWhatsAppShareUrl("selam", "+90 555 111 22 33");
    expect(url).toBe(
      `https://wa.me/905551112233?text=${encodeURIComponent("selam")}`,
    );
  });
});
