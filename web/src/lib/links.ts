export function getSlug(shortUrl: string) { try { return new URL(shortUrl).pathname.replace(/^\//, '') } catch { return shortUrl.replace(/^\//, '') } }
export function publicLink(shortUrl: string) { const baseUrl = (import.meta.env.VITE_FRONTEND_URL || 'https://brev.ly').replace(/\/$/, ''); const slug = getSlug(shortUrl); return slug ? `${baseUrl}/${slug}` : `${baseUrl}/` }
