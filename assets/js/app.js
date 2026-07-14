// ===========================================================
// APP — entry point. Hanya memanggil engine, tidak berisi logika.
// ===========================================================

import { init } from './engine.js';

init().catch((err) => {
    console.error('[app.js] Gagal memuat Buat Iza:', err);
    const desc = document.querySelector('#story-desc');
    if (desc) desc.textContent = 'Terjadi kendala saat memuat halaman. Coba muat ulang.';
});
