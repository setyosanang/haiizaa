// ===========================================================
// STATE — state lokal di browser pembaca (bukan state realtime
// Supabase — itu urusan realtime.js). Disimpan di localStorage
// supaya posisi baca terakhir tidak hilang saat reload.
// ===========================================================

const KEY = 'buat_iza_state';

function read() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (_) { return {}; }
}

function write(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
}

export const State = {
    get current_step() { return read().current_step ?? 0; },
    get visited_step() { return read().visited_step ?? []; },
    get last_music() { return read().last_music ?? ''; },
    get theme() { return read().theme ?? null; },

    setCurrentStep(index) {
        const s = read();
        s.current_step = index;
        const visited = new Set(s.visited_step || []);
        visited.add(index);
        s.visited_step = [...visited];
        write(s);
    },

    setLastMusic(src) {
        const s = read(); s.last_music = src; write(s);
    },

    setTheme(theme) {
        const s = read(); s.theme = theme; write(s);
    },

    isVisited(index) {
        return this.visited_step.includes(index);
    }
};
