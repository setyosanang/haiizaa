-- ===========================================================
-- RLS — mengaktifkan Row Level Security di semua tabel.
-- Jalankan setelah schema.sql, sebelum policies.sql.
-- ===========================================================

alter table public.projects     enable row level security;
alter table public.player_state enable row level security;
alter table public.presence     enable row level security;
alter table public.analytics    enable row level security;
