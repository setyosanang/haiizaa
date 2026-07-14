// ===========================================================
// ENGINE — otak project. Urutan kerja:
// Load Config → Load Workflow → Load Current Step → Animation
// Engine → Background Engine → Doodle Engine → Audio Engine →
// Renderer → Realtime. Semua otomatis, workflow tidak berisi logika.
// ===========================================================

import { qs } from './utils.js';
import { loadConfig, getConfig, resolveMusic } from './config-loader.js';
import { loadWorkflow, getNodeByIndex, totalNodes } from './workflow-loader.js';
import { State } from './state.js';
import { renderNode, renderEmpty } from './renderer.js';
import { renderNavigator, onNavigate } from './navigator.js';
import { packageClass } from './animation.js';
import { resolveBackground, applyBackground } from './background.js';
import { applyDoodles, applyCardDoodles } from './doodle.js';
import * as audio from './audio.js';
import * as ui from './ui.js';
import * as admin from './admin.js';
import * as realtime from './realtime.js';
import * as analytics from './analytics.js';
import { wireMusicPlayer } from './musicplayer.js';

let cfg = null;
let isWriter = false;
let total = 0;

async function goTo(index, { sync = false } = {}) {
    if (total === 0) return;
    const clamped = ((index % total) + total) % total;
    const node = getNodeByIndex(clamped);
    if (!node) return;

    const group = cfg.animation_group || 2;
    const pkgClass = packageClass(clamped, group, cfg.animation_mode);
    const bgKey = resolveBackground(clamped, group, cfg.default_background);

    renderNode(node, { pkgClass });
    applyBackground(qs('#bg-layer'), bgKey, cfg.background_mode);
    applyDoodles(qs('#doodle-layer'), clamped, group, cfg.doodle_mode);
    // Doodle di dalam kartu berganti tiap SATU node (bergantian tiap
    // halaman), terpisah dari animation_group yang hanya mengatur paket
    // animasi & doodle latar belakang.
    applyCardDoodles(qs('#card-doodle-layer'), clamped, cfg.doodle_mode);

    const musicKey = node.musik || node.music || '';
    const track = resolveMusic(musicKey) || resolveMusic(cfg.default_music);
    audio.play(track?.src || '', track?.title || '');

    State.setCurrentStep(clamped);
    renderNavigator(total, clamped, isWriter || cfg.allow_jump);

    if (sync) {
        try { await realtime.writeCurrentStep(node.id); } catch (err) { console.warn('[engine.js] Gagal sinkron:', err.message); }
    }
}

async function detectWriter() {
    try {
        const session = await admin.getSession();
        return !!session;
    } catch (_) {
        return false;
    }
}

async function setupRealtime() {
    if (!cfg.supabase || cfg.supabase.projectUrl?.includes('PLACEHOLDER')) return;

    try {
        realtime.subscribePlayerState((data) => {
            const idx = Math.max(0, (data.current_step ?? 1) - 1);
            if (!isWriter && cfg.allow_jump === false) goTo(idx, { sync: false });
            if (cfg.presence?.enabled) ui.updateStatPill(`Penulis di halaman ${idx + 1}`);
        });
    } catch (err) { console.warn('[engine.js] Realtime tidak aktif:', err.message); }

    if (cfg.presence?.enabled) {
        try {
            realtime.joinPresence((count) => {
                const pill = qs('#presence-pill');
                if (pill) pill.textContent = count > 0 ? `${count} ${cfg.presence.label_online}` : '';
            });
        } catch (err) { console.warn('[engine.js] Presence tidak aktif:', err.message); }
    }

    if (cfg.analytics?.enabled) {
        realtime.incrementViewOnce().catch(() => {});
        if (isWriter) {
            analytics.fetchStats().then((stats) => {
                if (stats) ui.updateStatPill(`${stats.total_views ?? 0} kali dibuka`);
            }).catch(() => {});
        }
    }
}

export async function init() {
    cfg = await loadConfig();
    await loadWorkflow();
    total = totalNodes();

    ui.applyVisibility(cfg);
    ui.wireMusicToggle();
    wireMusicPlayer();
    audio.setVolume(cfg.music_volume ?? 0.5);

    if (total === 0) {
        renderEmpty(cfg.empty_state);
        return;
    }

    isWriter = await detectWriter();
    if (isWriter) ui.showWriterBar({ onLogout: admin.logout });

    let startIndex = 0;
    if (cfg.allow_jump === false) {
        try {
            const data = await realtime.fetchPlayerState();
            startIndex = data ? Math.max(0, (data.current_step ?? 1) - 1) : 0;
        } catch (_) { startIndex = 0; }
    } else {
        startIndex = Math.min(State.current_step, total - 1);
    }

    onNavigate((i) => goTo(i, { sync: isWriter }));
    await goTo(startIndex, { sync: false });
    await setupRealtime();
}
