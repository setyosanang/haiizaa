
// ===========================================================
// NAVIGATOR — node yang bisa diklik. Tidak ada tombol
// Next/Previous, tidak ada counter "Tahap 1 dari 10".
// ===========================================================

import { qs, el } from './utils.js';
import { State } from './state.js';

let onNodeClick = null;

export function renderNavigator(total, currentIndex, clickable) {
    const wrap = qs('#navigator');
    if (!wrap) return;
    wrap.innerHTML = '';
    wrap.classList.toggle('clickable', clickable);

    // ===== TAMBAHAN: tombol sebelumnya =====
    const prev = el('button', 'nav-arrow');
    prev.type = 'button';
    prev.textContent = '‹';
    prev.disabled = !clickable || currentIndex === 0;
    prev.addEventListener('click', () => {
        if (onNodeClick) onNodeClick(currentIndex - 1);
    });
    wrap.appendChild(prev);

    // ===== Titik-titik =====
    for (let i = 0; i < total; i++) {
        const dot = el('button', 'node-dot');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Halaman ${i + 1}`);
        if (State.isVisited(i)) dot.classList.add('visited');
        if (i === currentIndex) dot.classList.add('current');

        if (clickable) {
            dot.addEventListener('click', () => onNodeClick && onNodeClick(i));
        } else {
            dot.disabled = true;
        }

        wrap.appendChild(dot);
    }

    // ===== TAMBAHAN: tombol berikutnya =====
    const next = el('button', 'nav-arrow');
    next.type = 'button';
    next.textContent = '›';
    next.disabled = !clickable || currentIndex === total - 1;
    next.addEventListener('click', () => {
        if (onNodeClick) onNodeClick(currentIndex + 1);
    });
    wrap.appendChild(next);

}

export function onNavigate(handler) {
onNodeClick = handler;
}