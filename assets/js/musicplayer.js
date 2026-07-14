// ===========================================================
// MUSIC PLAYER (UI) — hanya menggambar bar musik kecil di dalam
// kartu: judul lagu, tombol putar/jeda, bar putus-putus yang lucu,
// dan penghitung waktu. Semua data waktu/status datang dari audio.js
// lewat setProgressHandler; modul ini tidak menyentuh elemen <audio>.
// ===========================================================

import { qs } from './utils.js';
import * as audio from './audio.js';

function formatTime(sec = 0) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function wireMusicPlayer() {
    const btn = qs('#music-play-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const playing = audio.togglePlay();
        btn.textContent = playing ? '⏸' : '▶';
        btn.setAttribute('aria-label', playing ? 'Jeda musik' : 'Putar musik');
    });

    audio.setProgressHandler((state) => {
        const player = qs('#music-player');
        if (!player) return;

        if (!state || !state.title) {
            player.hidden = true;
            return;
        }

        player.hidden = false;
        const titleEl = qs('#music-title');
        const fillEl = qs('#music-progress-fill');
        const thumbEl = qs('#music-progress-thumb');
        const timeEl = qs('#music-time');
        const playBtn = qs('#music-play-btn');

        if (titleEl) titleEl.textContent = state.title;

        const pct = state.duration > 0 ? Math.min(100, (state.currentTime / state.duration) * 100) : 0;
        if (fillEl) fillEl.style.width = `${pct}%`;
        if (thumbEl) thumbEl.style.left = `${pct}%`;
        if (timeEl) timeEl.textContent = `${formatTime(state.currentTime)} / ${formatTime(state.duration)}`;
        if (playBtn) {
            playBtn.textContent = state.playing ? '⏸' : '▶';
            playBtn.setAttribute('aria-label', state.playing ? 'Jeda musik' : 'Putar musik');
        }
    });
}
