# 2026-27 Fikstür (Hafta 1–34)

Bu SQL dosyalarını Supabase → **SQL Editor** → yapıştır → **Run**:

1. `supabase/migrations/20260723130000_seed_fixtures_2026_27_weeks_1_10.sql` — hafta 1–10
2. `supabase/migrations/20260817120000_fix_week1_tff_fixtures.sql` — canlı 1. haftadan Göztepe–Başakşehir silinir
3. `supabase/migrations/20260817130000_seed_fixtures_weeks_11_34.sql` — hafta 11–34 taslak

Canlıda 1–10 zaten yüklüyse sadece 2 ve 3’ü çalıştır. 11–34 dosyası 1–10’u silmez.

## Notlar

- Rakipler (Kasımpaşa, Alanyaspor vb.) takım listesine eklendi.
- TFF saat vermediyse maçlar **19:00 Türkiye saati** kabul edildi.
- Haftalar **taslak** olarak gelir → Yönetim’den bonus seç + yayınla.
- Derbiler otomatik: FB/GS/BJK/TS kendi aralarındaki maçlar.
- 1. Hafta (bu lig): `Galatasaray - Çorum FK` 14.08 21:30, `Eyüpspor - Beşiktaş`, `Trabzonspor - Kocaelispor`, `Gençlerbirliği - Fenerbahçe` 15.08 21:30. Göztepe ve Başakşehir 1. haftada yok (o maçlar oynanmamış sayılır).
- 10. Hafta: `Kasımpaşa - Beşiktaş`
- 11–34: TFF Trendyol Süper Lig 2026-27 fikstürü, 6 takip edilen takım. Saatler henüz yok → 19:00.

## Senin adımların

1. Yukarıdaki SQL’i (eksik olanları) Supabase’te çalıştır
2. Sitede **Yönetim** → ilgili hafta → bonus seç → **Haftayı Yayınla**

Hafta adları yarışma önekli (`SüperLig 1.Hafta`, ileride `Şampiyonlar Ligi 1.Hafta`). Yönetim → hafta sayfasından ad düzenlenebilir.
