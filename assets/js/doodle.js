// ===========================================================
// DOODLE ENGINE — workflow TIDAK memilih SVG. Sepasang doodle
// dipilih otomatis setiap config.animation_group node, lalu
// diletakkan mengambang lembut di layer dekorasi.
// ===========================================================

import { qs, el } from './utils.js';

const PAIRS = [
    ['smiley', 'flower'],
    ['cloud', 'ribbon'],
    ['butterfly', 'heart'],
    ['moon', 'sparkle'],
    ['tulip', 'rainbow']
];

const ALL_ICONS = ['smiley', 'flower', 'cloud', 'ribbon', 'butterfly', 'heart', 'moon', 'sparkle', 'tulip', 'rainbow'];

const POSITIONS = [
    { top: '8%', left: '6%' },
    { bottom: '10%', right: '8%' }
];

const cache = new Map();

async function loadSVG(name) {
    if (cache.has(name)) return cache.get(name);
    const res = await fetch(`data/svg/${name}.svg`);
    const text = res.ok ? await res.text() : '';
    cache.set(name, text);
    return text;
}

export function resolvePair(index, groupSize = 2) {
    const size = Math.max(1, groupSize);
    const cycle = Math.floor(index / size) % PAIRS.length;
    return PAIRS[cycle];
}

export async function applyDoodles(layerEl, index, groupSize = 2, mode = 'auto') {
    if (!layerEl) return;
    layerEl.innerHTML = '';
    if (mode === 'off') return;

    const pair = resolvePair(index, groupSize);
    for (let i = 0; i < pair.length; i++) {
        const svgText = await loadSVG(pair[i]);
        if (!svgText) continue;
        const wrap = el('div', 'doodle');
        Object.assign(wrap.style, POSITIONS[i] || {});
        wrap.style.animationDelay = `${i * 0.4}s`;
        wrap.innerHTML = svgText;
        layerEl.appendChild(wrap);
    }
}

/**
 * applyCardDoodles — dekorasi kecil DI DALAM kartu teks supaya ruang
 * kosong tidak terasa sepi. Berbeda dari applyDoodles (background),
 * ikon di sini berganti setiap SATU node (bergantian tiap halaman),
 * tidak mengikuti animation_group — animation_group tetap hanya
 * mengatur paket animasi (lihat animation.js).
 */
export async function applyCardDoodles(layerEl, index, mode = 'auto') {
    if (!layerEl) return;
    layerEl.innerHTML = '';
    if (mode === 'off') return;

    const n = ALL_ICONS.length;
    const slots = [
        ['slot-a', ALL_ICONS[index % n]],
        ['slot-b', ALL_ICONS[(index + 3) % n]],
        ['slot-c', ALL_ICONS[(index + 5) % n]],
        ['slot-d', ALL_ICONS[(index + 8) % n]]
    ];

    for (const [slotClass, name] of slots) {
        const svgText = await loadSVG(name);
        if (!svgText) continue;
        const wrap = el('div', `card-doodle ${slotClass}`);
        wrap.innerHTML = svgText;
        layerEl.appendChild(wrap);
    }
}
