import { getSlug } from './links'
import type { ShortLink } from '../types'
const baseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3333').replace(/\/$/, '')
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}
async function request(path: string, options?: RequestInit) { const response = await fetch(`${baseUrl}${path}`, options); if (!response.ok) { const body = await response.json().catch(() => null) as { message?: string } | null; throw new ApiError(body?.message || 'A requisição não pôde ser concluída.', response.status) } return response }
export const api = {
  async listLinks() { const response = await request('/urls'); return await response.json() as ShortLink[] },
  async createLink(link: Pick<ShortLink, 'originalUrl' | 'shortUrl'>) { const response = await request('/urls', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(link) }); return await response.json() as ShortLink },
  async deleteLink(id: string) { await request(`/urls/${id}`, { method: 'DELETE' }) },
  async resolveLink(shortUrl: string) { const response = await request(`/urls/${encodeURIComponent(getSlug(shortUrl))}`); return await response.json() as Pick<ShortLink, 'originalUrl'> },
  async exportCsv() {
    const response = await request('/urls/export')
    const fileName = decodeURIComponent(new URL(response.url).pathname.split('/').pop() || '')
    if (!fileName) throw new ApiError('Não foi possível identificar o arquivo CSV.')
    return { blob: await response.blob(), fileName }
  },
}
