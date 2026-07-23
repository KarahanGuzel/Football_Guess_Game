# Kurulum Rehberi

MVP’yi ayağa kaldırmak için senin yapman gerekenler:

## 1) Supabase projesi

1. [supabase.com](https://supabase.com) → yeni proje oluştur (free tier yeterli).
2. **SQL Editor**’de şu dosyanın içeriğini çalıştır:
   - `supabase/migrations/20260723000000_init.sql`
3. Project Settings → API:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`  
     (anon key kullanma; bu uygulama service role ile sunucudan bağlanıyor.)

## 2) Oyuncu isimleri

Migration örnek oyuncular ekler: `Admin`, `Ali`, `Ayşe`, `Mehmet`, `Zeynep`.

Gerçek isimler için SQL Editor’de güncelle/ekle:

```sql
update public.players set display_name = 'SeninAdın' where slug = 'admin';

insert into public.players (display_name, slug, is_admin)
values ('YeniOyuncu', 'yeni-oyuncu', false);
```

## 3) Ortam değişkenleri

### Lokal

```bash
cp .env.example .env.local
```

Doldur:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SESSION_SECRET=en-az-32-karakter-rastgele-bir-string
```

`SESSION_SECRET` üretmek için:

```bash
openssl rand -base64 48
```

### Vercel

Project → Settings → Environment Variables → aynı 4 değişkeni ekle.

## 4) Deploy

1. Bu repo’yu Vercel’e import et (framework: Next.js).
2. Deploy et.
3. Çıkan URL’yi sadece arkadaşlarınla paylaş.

## 5) İlk kullanım

1. `/login` → **Admin** ile gir.
2. **Admin** → hafta oluştur → maç ekle → 1 bonus seç → **Haftayı Aç**.
3. Diğer kullanıcılarla giriş yapıp tahmin gir.
4. Maçlar bitince skorları gir → **Puanları Hesapla**.

## Notlar

- Maç saati formu **Türkiye saati (UTC+3)** kabul eder.
- Şifre yok; URL’yi bilen herkes kullanıcı seçebilir (arkadaş grubu için bilinçli tercih).
- İleride istersen girişe ortak PIN eklenebilir.
