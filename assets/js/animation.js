// ===========================================================
// ANIMATION ENGINE — workflow TIDAK memilih animasi. Paket A-E
// dipilih otomatis dari urutan node, berganti setiap
// config.animation_group node.
// ===========================================================

const PACKAGES = ['a', 'b', 'c', 'd', 'e'];

/**
 * resolvePackage(index, groupSize) — index = posisi node (0-based).
 * Setiap `groupSize` node, paket berikutnya dipakai, lalu berulang.
 */
export function resolvePackage(index, groupSize = 2) {
    const size = Math.max(1, groupSize);
    const cycle = Math.floor(index / size) % PACKAGES.length;
    return PACKAGES[cycle];
}

export function packageClass(index, groupSize, mode = 'auto') {
    if (mode === 'off') return '';
    return `pkg-${resolvePackage(index, groupSize)}`;
}
