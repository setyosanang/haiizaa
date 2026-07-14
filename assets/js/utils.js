// ===========================================================
// UTILS — helper murni, tidak tahu apa-apa soal engine lain.
// ===========================================================

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

export async function fetchJSON(path) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Gagal memuat ${path} (${res.status})`);
    return res.json();
}

export function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
}

export function escapeHTML(str = '') {
    return str.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

export function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

/** id acak untuk sesi presence/analytics, disimpan di sessionStorage. */
export function sessionId() {
    let id = sessionStorage.getItem('bi_session_id');
    if (!id) {
        id = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('bi_session_id', id);
    }
    return id;
}
