// ===========================================================
// REALTIME — satu-satunya modul yang tahu cara bicara ke
// Supabase: client singleton, sinkronisasi player_state, dan
// presence (siapa sedang membaca sekarang). Bukan database
// sidang — proyek ini generik untuk cerita/surat apa saja.
// ===========================================================

import { getConfig } from './config-loader.js';

let client = null;
let presenceChannel = null;
let stateChannel = null;

export function getClient() {
    if (client) return client;
    const cfg = getConfig();
    const sb = cfg.supabase || {};

    if (!sb.projectUrl || sb.projectUrl.includes('PLACEHOLDER') || !sb.publishableKey || sb.publishableKey.includes('PLACEHOLDER')) {
        console.warn('[realtime.js] config.json → supabase belum diisi. Lihat panduan.md.');
    }
    if (!window.supabase) {
        throw new Error('Library @supabase/supabase-js belum dimuat.');
    }
    client = window.supabase.createClient(sb.projectUrl, sb.publishableKey);
    return client;
}

function projectId() {
    return getConfig().supabase?.projectId ?? 1;
}

/** Ambil current_step terakhir yang ditulis Penulis (untuk mode sinkron / preview admin). */
export async function fetchPlayerState() {
    const c = getClient();
    const { data, error } = await c
        .from('player_state')
        .select('current_step, updated_at')
        .eq('project_id', projectId())
        .maybeSingle();
    if (error) throw error;
    return data;
}

/** Penulis menulis posisi baca ke Supabase — ini yang menyinkronkan semua client. */
export async function writeCurrentStep(index) {
    const c = getClient();
    const { error } = await c
        .from('player_state')
        .update({ current_step: index, updated_at: new Date().toISOString() })
        .eq('project_id', projectId());
    if (error) throw error;
}

/** Subscribe ke perubahan player_state. onChange menerima {current_step, updated_at}. */
export function subscribePlayerState(onChange) {
    const c = getClient();
    stateChannel = c
        .channel(`player_state_${projectId()}`)
        .on('postgres_changes', {
            event: 'UPDATE', schema: 'public', table: 'player_state', filter: `project_id=eq.${projectId()}`
        }, (payload) => onChange(payload.new))
        .subscribe();
    return () => c.removeChannel(stateChannel);
}

/** Presence — hanya menghitung berapa yang online, tidak menyimpan identitas. */
export function joinPresence(onCountChange) {
    const c = getClient();
    const key = 'reader_' + Math.random().toString(36).slice(2);

    presenceChannel = c.channel(`presence_${projectId()}`, { config: { presence: { key } } });

    presenceChannel
        .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState();
            onCountChange(Object.keys(state).length);
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await presenceChannel.track({ online_at: new Date().toISOString() });
            }
        });

    return () => c.removeChannel(presenceChannel);
}

export async function incrementViewOnce() {
    const c = getClient();
    const flagKey = 'bi_viewed_' + projectId();
    if (sessionStorage.getItem(flagKey)) return;
    sessionStorage.setItem(flagKey, '1');
    const { error } = await c.rpc('increment_total_views', { p_project_id: projectId() });
    if (error) console.warn('[realtime.js] Gagal mencatat view:', error.message);
}
