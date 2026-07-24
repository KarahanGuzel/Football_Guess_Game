import { describe, expect, it } from "vitest";
import { buildLockReminderMessage, buildWhatsAppShareUrl } from "@/lib/whatsapp";

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

  it("encodes WhatsApp share URL", () => {
    const url = buildWhatsAppShareUrl("merhaba dünya");
    expect(url).toBe(
      `https://wa.me/?text=${encodeURIComponent("merhaba dünya")}`,
    );
  });
});
