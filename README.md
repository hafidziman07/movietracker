# MovieTracker (Supabase + Vercel)
Versi MovieTracker yang sudah dimigrasi dari PHP+MySQL (XAMPP) ke frontend statis + Supabase:
- Supabase Auth untuk login/registrasi
- Supabase Database (Postgres) untuk movies, watchlist, review, progress, reminder
- Supabase Realtime: perubahan review/watchlist/progress langsung tersinkron tanpa reload
- Row Level Security: pengguna hanya bisa mengubah data miliknya
## Struktur
- index.html: login / registrasi
- dashboard.html: ringkasan (sedang ditonton, stats)
- catalog.html: katalog film (search, filter genre, sort)
- watchlist.html: watchlist pribadi (plan/watching/completed)
- movie.html?id=: detail film + review real-time
- sql/schema.sql: skema Postgres + RLS + trigger profil + Realtime
- sql/seed.sql: data film demo
- api/config.js: serverless config (URL/anon key dari env)
## Langkah Deploy
1. Buat project Supabase, jalankan sql/schema.sql lalu sql/seed.sql di SQL Editor. Salin Project URL dan anon key.
2. Deploy repo ini ke Vercel (Framework: Other).
3. Set Environment Variables di Vercel: SUPABASE_URL dan SUPABASE_ANON_KEY.
4. Verifikasi: register akun, tambah watchlist, tulis review, cek sinkronisasi realtime di dua tab.
