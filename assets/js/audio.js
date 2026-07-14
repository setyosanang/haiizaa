// ===========================================================
// AUDIO ENGINE — satu track aktif, fade out lama → fade in baru
// saat node berganti. File musik ada di data/music/.
// ===========================================================

let current = null;
let currentTitle = '';
let volume = 0.5;
let muted = false;
let progressHandler = null;

export function setVolume(v) { volume = v; if (current) current.volume = muted ? 0 : v; }
export function isMuted() { return muted; }

export function toggleMute() {
    muted = !muted;
    if (current) current.volume = muted ? 0 : volume;
    return muted;
}

/** setProgressHandler(fn) — fn dipanggil tiap update waktu/status dengan
 *  { title, currentTime, duration, playing } supaya UI bar musik bisa
 *  digambar ulang tanpa audio.js perlu tahu soal DOM. */
export function setProgressHandler(fn) { progressHandler = fn; }

function emitProgress() {
    if (!progressHandler) return;
    if (!current) { progressHandler(null); return; }
    progressHandler({
        title: currentTitle,
        currentTime: current.currentTime || 0,
        duration: current.duration || 0,
        playing: !current.paused
    });
}

function fade(audioEl, to, duration = 500) {
    const from = audioEl.volume;
    const steps = 16;
    let step = 0;
    const id = setInterval(() => {
        step++;
        audioEl.volume = from + (to - from) * (step / steps);
        if (step >= steps) clearInterval(id);
    }, duration / steps);
}

/**
 * play(src, title) — src kosong berarti "tidak ada musik untuk node ini",
 * track yang sedang berjalan akan di-fade out dan dihentikan.
 */
export function play(src, title = '') {
    if (!src) {
        if (current) { fade(current, 0, 400); setTimeout(() => current?.pause(), 420); }
        current = null;
        currentTitle = '';
        emitProgress();
        return;
    }

    if (current && current.dataset.src === src) {
        currentTitle = title;
        emitProgress();
        return; // sudah main track yang sama
    }

    const old = current;
    if (old) fade(old, 0, 400);

    const next = new Audio(src);
    next.dataset.src = src;
    next.loop = true;
    next.volume = 0;
    next.addEventListener('timeupdate', emitProgress);
    next.addEventListener('play', emitProgress);
    next.addEventListener('pause', emitProgress);
    next.addEventListener('loadedmetadata', emitProgress);
    next.play().catch(() => { /* autoplay diblokir browser, menunggu interaksi pengguna */ });
    fade(next, muted ? 0 : volume, 500);

    current = next;
    currentTitle = title;
    emitProgress();
    if (old) setTimeout(() => old.pause(), 420);
}

/** togglePlay() — jeda/lanjutkan track yang sedang aktif untuk halaman ini. */
export function togglePlay() {
    if (!current) return false;
    if (current.paused) { current.play().catch(() => {}); }
    else { current.pause(); }
    emitProgress();
    return !current.paused;
}

export function stop() {
    if (current) { fade(current, 0, 300); setTimeout(() => current?.pause(), 320); }
    current = null;
    currentTitle = '';
    emitProgress();
}
