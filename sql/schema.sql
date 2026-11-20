-- =====================================================
-- MovieTracker — Skema Supabase (Postgres)
-- Jalankan file ini di Supabase SQL Editor
-- =====================================================

-- 1) Tabel users (profil, dilengkapi otomatis via trigger)
create table if not exists users (
  id_user uuid primary key references auth.users(id) on delete cascade,
  nama text,
  email text,
  created_at timestamptz default now()
);

-- 2) Tabel movies
create table if not exists movies (
  id_movie bigserial primary key,
  judul text not null,
  tahun_rilis int,
  genre text,
  durasi int,
  rating_umur text,
  deskripsi text,
  poster_url text,
  created_at timestamptz default now()
);

-- 3) Watchlist
create table if not exists watchlist (
  id_watchlist bigserial primary key,
  id_user uuid not null references users(id_user) on delete cascade,
  id_movie bigint not null references movies(id_movie) on delete cascade,
  status text not null default 'plan' check (status in ('plan','watching','completed')),
  created_at timestamptz default now(),
  unique (id_user, id_movie)
);

-- 4) Review
create table if not exists review (
  id_review bigserial primary key,
  id_user uuid not null references users(id_user) on delete cascade,
  id_movie bigint not null references movies(id_movie) on delete cascade,
  rating int not null check (rating between 1 and 5),
  komentar text,
  tanggal_review timestamptz default now(),
  unique (id_user, id_movie)
);

-- 5) Progress menonton
create table if not exists progress (
  id_progress bigserial primary key,
  id_user uuid not null references users(id_user) on delete cascade,
  id_movie bigint not null references movies(id_movie) on delete cascade,
  progress_terakhir int default 0,
  terakhir_nonton timestamptz default now(),
  unique (id_user, id_movie)
);

-- 6) Reminder
create table if not exists reminder (
  id_reminder bigserial primary key,
  id_user uuid not null references users(id_user) on delete cascade,
  id_movie bigint references movies(id_movie) on delete cascade,
  jadwal timestamptz,
  catatan text,
  created_at timestamptz default now()
);

-- =====================================================
-- Trigger: buat profil users otomatis saat registrasi
-- =====================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id_user, nama, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nama', split_part(new.email,'@',1)), new.email)
  on conflict (id_user) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- Row Level Security
-- =====================================================
alter table users    enable row level security;
alter table movies   enable row level security;
alter table watchlist enable row level security;
alter table review   enable row level security;
alter table progress enable row level security;
alter table reminder enable row level security;

-- Profil: semua bisa lihat, hanya pemilik bisa ubah
create policy "users_select" on users for select using (true);
create policy "users_update" on users for update using (auth.uid() = id_user);

-- Movies: publik dibaca, hanya service role yang menulis
create policy "movies_select" on movies for select using (true);

-- Watchlist / progress / reminder: hanya milik sendiri
create policy "watchlist_all" on watchlist
  for all using (auth.uid() = id_user) with check (auth.uid() = id_user);
create policy "progress_all" on progress
  for all using (auth.uid() = id_user) with check (auth.uid() = id_user);
create policy "reminder_all" on reminder
  for all using (auth.uid() = id_user) with check (auth.uid() = id_user);

-- Review: semua bisa baca, hanya penulis bisa tulis/ubah
create policy "review_select" on review for select using (true);
create policy "review_write" on review
  for all using (auth.uid() = id_user) with check (auth.uid() = id_user);

-- =====================================================
-- Realtime: aktifkan publikasi perubahan
-- =====================================================
alter publication supabase_realtime add table movies;
alter publication supabase_realtime add table watchlist;
alter publication supabase_realtime add table review;
alter publication supabase_realtime add table progress;
alter publication supabase_realtime add table reminder;
