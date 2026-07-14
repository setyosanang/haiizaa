// ===========================================================
// UI — potongan kecil antarmuka yang tidak cukup besar untuk
// jadi modul sendiri: tombol musik, bilah Penulis, tampil/sembunyi
// elemen sesuai config.
// ===========================================================

import { qs } from './utils.js';
import * as audio from './audio.js';

export function applyVisibility(cfg) {
    const header = qs('.app-header');
    const nav = qs('#navigator');
    const musicBtn = qs('#music-toggle');
    if (header) header.hidden = !cfg.show_header;
    if (nav) nav.hidden = !cfg.show_node;
    if (musicBtn) musicBtn.hidden = !cfg.show_music_button;
}

export function wireMusicToggle() {
    const btn = qs('#music-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const muted = audio.toggleMute();
        btn.textContent = muted ? '🔇' : '🎵';
        btn.setAttribute('aria-label', muted ? 'Nyalakan musik' : 'Matikan musik');
    });
}

export function showWriterBar({ onLogout }) {
    const bar = qs('#writer-bar');
    if (!bar) return;
    bar.hidden = false;
    qs('#writer-badge', document).hidden = false;
    qs('#writer-logout')?.addEventListener('click', async () => {
        await onLogout();
        window.location.reload();
    });
}

export function updateStatPill(text) {
    const pill = qs('#stat-pill');
    if (pill) pill.textContent = text;
}
