// ===========================================================
// BACKGROUND ENGINE — workflow TIDAK memilih background. Tema
// scenery berganti otomatis setiap config.animation_group node,
// mengikuti warna tema aktif lewat CSS custom properties.
// ===========================================================

const PRESETS = {
    'paper':         'linear-gradient(160deg, var(--cream) 0%, var(--bg) 100%)',
    'pink-gradient': 'radial-gradient(circle at 30% 20%, var(--primary) 0%, var(--bg) 65%)',
    'cute-blob':     'radial-gradient(circle at 70% 75%, var(--mint) 0%, var(--bg) 60%)',
    'cloud':         'linear-gradient(200deg, var(--card) 0%, var(--bg) 70%)',
    'soft-cream':    'linear-gradient(120deg, var(--cream) 0%, var(--card) 100%)'
};

const ORDER = ['paper', 'pink-gradient', 'cute-blob', 'cloud', 'soft-cream'];

export function resolveBackground(index, groupSize = 2, fallback = 'paper') {
    if (!ORDER.length) return fallback;
    const size = Math.max(1, groupSize);
    const cycle = Math.floor(index / size) % ORDER.length;
    return ORDER[cycle];
}

export function applyBackground(layerEl, key, mode = 'auto') {
    if (!layerEl) return;
    if (mode === 'off') { layerEl.style.background = 'var(--bg-layer-default)'; return; }
    layerEl.style.background = PRESETS[key] || 'var(--bg-layer-default)';
}
