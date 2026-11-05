// Prefix public/ paths with the GitHub Pages base path (empty locally).
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const asset = (p: string) => `${BASE}${p.startsWith('/') ? p : `/${p}`}`;
