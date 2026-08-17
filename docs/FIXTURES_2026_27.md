# 2026-27 Fikstür (Hafta 1–10)

Bu SQL dosyasını Supabase → **SQL Editor** → yapıştır → **Run**:

`supabase/migrations/20260723130000_seed_fixtures_2026_27_weeks_1_10.sql`

## Notlar

- Rakipler (Kasımpaşa, Alanyaspor vb.) takım listesine eklendi.
- Saat verilmediği için diğer maçlar **19:00 Türkiye saati** kabul edildi.
- Haftalar **taslak** olarak gelir → Yönetim’den bonus seç + yayınla.
- Derbiler otomatik: FB/GS/BJK/TS kendi aralarındaki maçlar.
- 1. Hafta (TFF): `Galatasaray - Çorum FK` 14.08 21:30, `Kasımpaşa - Trabzonspor` 15.08 19:00, `Gençlerbirliği - Fenerbahçe` 15.08 21:30, `Beşiktaş - Eyüpspor` 16.08 21:30, `Samsunspor - Göztepe` 17.08 21:30
- 10. Hafta: `Kasımpaşa - Beşiktaş`

## Senin adımların

1. Yukarıdaki SQL’i Supabase’te çalıştır
2. PR #3 (yönetim sadeleştirme) merge’li değilse onu da mergele
3. Sitede **Yönetim** → `SüperLig 1.Hafta` → bonus seç → **Haftayı Yayınla**

Hafta adları yarışma önekli (`SüperLig 1.Hafta`, ileride `Şampiyonlar Ligi 1.Hafta`). Yönetim → hafta sayfasından ad düzenlenebilir.
