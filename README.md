# Football Guess Game (Tahmin Ligi)

Arkadaş grubu (5–10 kişi) için haftalık futbol tahmin oyunu.

**Stack:** Next.js · Supabase · Vercel

## Özellikler

- Şifresiz giriş (önceden tanımlı kullanıcı seçimi)
- Sonuç + Alt/Üst 2.5 tahmini
- İlk maç saatinde kilit
- Derbi ×2, haftalık bonus (6 veya 0)
- Puan durumu, geçmiş haftalar, gelecek fikstür
- Basit admin paneli

## Dokümanlar

| Dosya | İçerik |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | **Senin kurulum adımların** |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Mimari ve kurallar |
| [docs/SCORING_EXAMPLES.md](docs/SCORING_EXAMPLES.md) | Puan matrisi |
| [supabase/migrations/20260723000000_init.sql](supabase/migrations/20260723000000_init.sql) | DB şeması |

## Lokal geliştirme

```bash
cp .env.example .env.local
# .env.local değerlerini doldur
npm install
npm run dev
```

```bash
npm test
npm run build
```

## Desteklenen takımlar

Fenerbahçe · Galatasaray · Beşiktaş · Trabzonspor · Başakşehir · Göztepe
