-- ===========================================================
-- SEED — satu baris proyek awal. project_id harus sama dengan
-- config.json → supabase.projectId (default: 1).
-- ===========================================================

insert into public.projects (id, title, theme)
values (1, 'Buat Iza', 'cute')
on conflict (id) do nothing;

insert into public.player_state (project_id, current_step)
values (1, 1)
on conflict (project_id) do nothing;

insert into public.analytics (project_id, total_views, online_count)
values (1, 0, 0)
on conflict (project_id) do nothing;
