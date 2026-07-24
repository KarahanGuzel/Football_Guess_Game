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

Migration şu oyuncuları ekler:

| İsim | Rol |
|---|---|
| Karahan | Admin |
| Batuhan | Oyuncu |
| Buğra | Oyuncu |
| Baran | Oyuncu |
| Atınç | Oyuncu |
| Emrah | Oyuncu |
| Kaan | Oyuncu |

Eski örnek seed’i (Admin/Ali/…) çalıştırdıysan SQL Editor’de şunu çalıştır:

```sql
delete from public.predictions;
delete from public.players;

insert into public.players (display_name, slug, is_admin) values
  ('Karahan', 'karahan', true),
  ('Batuhan', 'batuhan', false),
  ('Buğra', 'bugra', false),
  ('Baran', 'baran', false),
  ('Atınç', 'atinc', false),
  ('Emrah', 'emrah', false),
  ('Kaan', 'kaan', false);
```

Yeni oyuncu eklemek için:

```sql
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
# opsiyonel: sabit WhatsApp numarası (yoksa buton sohbet seçici açar)
# NEXT_PUBLIC_WHATSAPP_PHONE=905551112233
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

1. `/login` → **Karahan** ile gir.
2. **Yönetim** → hafta oluştur → maç ekle → 1 bonus seç → **Haftayı Aç**.
3. Diğer kullanıcılarla giriş yapıp tahmin gir.
4. Maçlar bitince skorları gir → **Puanları Hesapla**.

## Notlar

- Maç saati formu **Türkiye saati (UTC+3)** kabul eder.
- Şifre yok; URL’yi bilen herkes kullanıcı seçebilir (arkadaş grubu için bilinçli tercih).
- İleride istersen girişe ortak PIN eklenebilir.
