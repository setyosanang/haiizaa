// ===========================================================
// WORKFLOW-LOADER — satu-satunya modul yang membaca workflow.json.
// Workflow hanya berisi ISI CERITA, tidak boleh berisi logika.
// ===========================================================

import { fetchJSON } from './utils.js';

let workflow = null;

export async function loadWorkflow() {
    if (workflow) return workflow;
    workflow = await fetchJSON('workflow.json');
    return workflow;
}

export function getNodes() {
    return workflow ? workflow.nodes : [];
}

export function getNodeByIndex(index) {
    const nodes = getNodes();
    return nodes[index] || null;
}

export function getNodeById(id) {
    return getNodes().find((n) => n.id === Number(id)) || null;
}

export function indexOfId(id) {
    return getNodes().findIndex((n) => n.id === Number(id));
}

export function totalNodes() {
    return getNodes().length;
}
