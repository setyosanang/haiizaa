// ===========================================================
// ANALYTICS — statistik sederhana untuk Penulis (bukan untuk
// pembaca umum). Tidak menyimpan identitas pengunjung.
// ===========================================================

import { getClient } from './realtime.js';
import { getConfig } from './config-loader.js';

function projectId() {
    return getConfig().supabase?.projectId ?? 1;
}

export async function fetchStats() {
    if (!getConfig().analytics?.enabled) return null;
    const c = getClient();
    const { data, error } = await c
        .from('analytics')
        .select('total_views, online_count, last_visit')
        .eq('project_id', projectId())
        .maybeSingle();
    if (error) { console.warn('[analytics.js]', error.message); return null; }
    return data;
}
