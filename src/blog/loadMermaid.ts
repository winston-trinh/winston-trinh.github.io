/** Loaded on demand so Mermaid's code only downloads on pages with diagrams. */
export const loadMermaid = () => import('mermaid').then((m) => m.default)
