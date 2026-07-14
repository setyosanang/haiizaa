// ===========================================================
// CONFIG-LOADER — satu-satunya modul yang membaca config.json.
// Config hanya berisi ATURAN, tidak boleh berisi isi cerita.
// ===========================================================

import { fetchJSON } from './utils.js';

let config = null;

export async function loadConfig() {
    if (config) return config;
    config = await fetchJSON('config.json');
    injectThemeStylesheet(config.theme || 'cute');
    applyCSSVariables(config);
    return config;
}

function injectThemeStylesheet(theme) {
    const allowed = ['cute', 'paper', 'dark'];
    const chosen = allowed.includes(theme) ? theme : 'cute';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `assets/css/theme-${chosen}.css`;
    link.id = 'theme-stylesheet';
    document.head.appendChild(link);
    document.documentElement.dataset.theme = chosen;
}

export function getConfig() {
    if (!config) throw new Error('Config belum dimuat. Panggil loadConfig() dulu.');
    return config;
}

/**
 * resolveMusic(key) — workflow.json hanya menulis KUNCI musik
 * (mis. "musik": "contoh"). Fungsi ini menerjemahkan kunci itu jadi
 * { src, title } lewat config.json → music_library. Kunci kosong atau
 * tidak ditemukan mengembalikan null (berarti tidak ada musik).
 */
export function resolveMusic(key) {
    if (!key || !config) return null;
    const lib = config.music_library || {};
    const entry = lib[key];
    if (!entry || !entry.file) return null;
    return { src: entry.file, title: entry.title || key };
}

function applyCSSVariables(cfg) {
    const root = document.documentElement.style;
    if (cfg.font?.display) root.setProperty('--font-display', `'${cfg.font.display}', serif`);
    if (cfg.font?.body) root.setProperty('--font-body', `'${cfg.font.body}', sans-serif`);
    if (cfg.transition_speed) root.setProperty('--transition-speed', `${cfg.transition_speed}ms`);
    if (cfg.web_title) document.title = cfg.web_title;

    const headerTitle = document.querySelector('#header-title');
    if (headerTitle && cfg.project_name) headerTitle.textContent = cfg.project_name;
}
