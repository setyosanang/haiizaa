-- ===========================================================
-- SCHEMA — Buat Iza. Bukan database sidang: proyek generik
-- untuk cerita/surat/ucapan interaktif apa pun.
-- Jalankan file ini pertama kali di Supabase SQL Editor.
-- ===========================================================

-- Identitas proyek (satu baris = satu "surat"/cerita yang dipublikasikan).
create table if not exists public.projects (
    id          bigint primary key,
    title       text        not null default 'Buat Iza',
    theme       text        not null default 'cute',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- Posisi baca yang disinkronkan Penulis ke semua pembaca (mode allow_jump:false).
create table if not exists public.player_state (
    project_id   bigint primary key references public.projects(id),
    current_step int         not null default 1,
    updated_at   timestamptz not null default now()
);

-- Log kehadiran (opsional/cadangan). Implementasi bawaan memakai Supabase
-- Realtime Presence (channel, tidak menulis ke tabel ini) — lihat panduan.md.
-- Tabel ini disediakan bila suatu saat ingin presence berbasis heartbeat DB.
create table if not exists public.presence (
    session_id  text        not null,
    project_id  bigint      not null references public.projects(id),
    last_seen   timestamptz not null default now(),
    created_at  timestamptz not null default now(),
    primary key (session_id, project_id)
);

-- Statistik ringan, tanpa identitas pengunjung.
create table if not exists public.analytics (
    project_id   bigint primary key references public.projects(id),
    total_views  bigint      not null default 0,
    online_count int         not null default 0,
    last_visit   timestamptz,
    updated_at   timestamptz not null default now()
);

-- Fungsi RPC dipanggil dari browser (anon) untuk menambah total_views
-- tanpa perlu memberi izin UPDATE penuh pada tabel analytics ke publik.
create or replace function public.increment_total_views(p_project_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.analytics
       set total_views = total_views + 1,
           last_visit  = now(),
           updated_at  = now()
     where project_id = p_project_id;
end;
$$;
