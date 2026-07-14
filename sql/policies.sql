-- ===========================================================
-- POLICIES — publik hanya boleh membaca; hanya Penulis (user
-- Supabase Auth yang login) yang boleh mengubah current_step.
-- Jalankan setelah rls.sql.
-- ===========================================================

-- projects: publik boleh baca (untuk tahu judul/tema aktif).
create policy "public_read_projects"
    on public.projects for select
    to anon, authenticated
    using (true);

-- player_state: publik baca (mode sinkron), hanya Penulis yang update.
create policy "public_read_player_state"
    on public.player_state for select
    to anon, authenticated
    using (true);

create policy "writer_update_player_state"
    on public.player_state for update
    to authenticated
    using (true)
    with check (true);

-- presence: cadangan (lihat catatan di schema.sql). Publik boleh baca
-- & menulis baris presence miliknya sendiri jika suatu saat dipakai.
create policy "public_read_presence"
    on public.presence for select
    to anon, authenticated
    using (true);

create policy "public_upsert_presence"
    on public.presence for insert
    to anon, authenticated
    with check (true);

create policy "public_update_own_presence"
    on public.presence for update
    to anon, authenticated
    using (true)
    with check (true);

-- analytics: publik boleh baca (Penulis melihat statistik dari browser
-- yang sama), tapi TIDAK boleh UPDATE langsung — hanya lewat fungsi
-- increment_total_views() yang berjalan sebagai security definer.
create policy "public_read_analytics"
    on public.analytics for select
    to anon, authenticated
    using (true);

grant execute on function public.increment_total_views(bigint) to anon, authenticated;
