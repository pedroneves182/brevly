import { z } from 'zod'

function hasCompleteDomain(value: string) {
  try { return new URL(value).hostname.includes('.') } catch { return false }
}

export const newLinkSchema = z.object({
  originalUrl: z.url('Informe uma URL válida.')
    .max(2048, 'A URL deve ter no máximo 2048 caracteres.')
    .refine((value) => /^https?:\/\/[^\\\s]+$/i.test(value), 'Informe uma URL válida com http:// ou https://.')
    .refine(hasCompleteDomain, 'Informe um domínio completo, como google.com.'),
  shortUrl: z.string().trim()
    .min(1, 'Informe um link encurtado.')
    .max(100, 'O link encurtado deve ter no máximo 100 caracteres.')
    .regex(/^[a-zA-Z0-9-]+$/, 'Use apenas letras, números e hífen.'),
})

export type NewLinkInput = z.infer<typeof newLinkSchema>
export type NewLinkErrors = Partial<Record<keyof NewLinkInput, string>>
