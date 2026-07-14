// ===========================================================
// RENDERER — hanya menggambar. Tidak tahu Supabase, tidak tahu
// dari mana index datang, tidak memilih paket sendiri.
// ===========================================================

import { qs, escapeHTML } from './utils.js';

const PKG_CLASSES = ['pkg-a', 'pkg-b', 'pkg-c', 'pkg-d', 'pkg-e'];

export function renderNode(node, { pkgClass }) {
    const card = qs('#story-card');
    if (!card || !node) return;

    card.classList.remove(...PKG_CLASSES);
    // force reflow supaya animasi CSS terpicu ulang meski class sempat sama
    void card.offsetWidth;
    if (pkgClass) card.classList.add(pkgClass);

    const img = qs('#story-image');
    if (node.image) {
        img.src = node.image;
        img.hidden = false;
        img.onerror = () => { img.hidden = true; };
    } else {
        img.hidden = true;
    }

    qs('#story-subtitle').textContent = node.subtitle || '';
    qs('#story-title').textContent = node.title || '';
    qs('#story-desc').innerHTML = node.description || '';
}

export function renderEmpty(emptyState) {
    qs('#story-subtitle').textContent = '';
    qs('#story-title').textContent = emptyState?.title || 'Belum Ada Halaman';
    qs('#story-desc').textContent = emptyState?.description || '';
    qs('#story-image').hidden = true;
}
