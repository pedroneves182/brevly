import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Brand from '../components/Brand'
import LinkForm from '../components/LinkForm'
import LinksPanel from '../components/LinksPanel'
import { api, ApiError } from '../lib/api'
import { publicLink } from '../lib/links'
import { newLinkSchema } from '../schemas/link'
import type { NewLinkErrors, NewLinkInput } from '../schemas/link'
import type { ShortLink } from '../types'

export default function HomePage() {
  const [links, setLinks] = useState<ShortLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [errors, setErrors] = useState<NewLinkErrors>({})
  const [form, setForm] = useState<NewLinkInput>({ originalUrl: '', shortUrl: '' })

  useEffect(() => {
    api.listLinks().then(setLinks).catch((error: unknown) => setPageError(readError(error, 'Não foi possível carregar os links.'))).finally(() => setIsLoading(false))
  }, [])

  function updateForm(field: keyof NewLinkInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = newLinkSchema.safeParse(form)
    if (!parsed.success) {
      const nextErrors: NewLinkErrors = {}
      parsed.error.issues.forEach((issue) => { nextErrors[issue.path[0] as keyof NewLinkInput] = issue.message })
      setErrors(nextErrors)
      return
    }
    setIsSaving(true)
    setPageError('')
    try {
      const created = await api.createLink(parsed.data)
      setLinks((current) => [created, ...current])
      setForm({ originalUrl: '', shortUrl: '' })
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) setErrors((current) => ({ ...current, shortUrl: error.message }))
      else setPageError(readError(error, 'Não foi possível salvar o link.'))
    } finally { setIsSaving(false) }
  }

  async function handleDelete(id: string) {
    setRemovingId(id)
    setPageError('')
    try { await api.deleteLink(id); setLinks((current) => current.filter((link) => link.id !== id)) }
    catch (error) { setPageError(readError(error, 'Não foi possível excluir o link.')) }
    finally { setRemovingId(null) }
  }

  async function handleCopy(link: ShortLink) {
    try { await navigator.clipboard.writeText(publicLink(link.shortUrl)); setCopiedId(link.id); window.setTimeout(() => setCopiedId(null), 1600) }
    catch { setPageError('Não foi possível copiar o link.') }
  }

  async function handleExport() {
    setIsExporting(true)
    setPageError('')
    try {
      const { blob, fileName } = await api.exportCsv()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = fileName
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) { setPageError(readError(error, 'Não foi possível baixar o CSV.')) }
    finally { setIsExporting(false) }
  }

  return <main className="page home-page">
    <header className="home-header"><Brand /></header>
    <div className="home-layout">
      <LinkForm values={form} errors={errors} isSaving={isSaving} onChange={updateForm} onSubmit={handleSubmit} />
      <div>{pageError && <p className="page-error" role="alert">{pageError}</p>}<LinksPanel links={links} isLoading={isLoading} isExporting={isExporting} removingId={removingId} copiedId={copiedId} onExport={handleExport} onCopy={handleCopy} onDelete={handleDelete} /></div>
    </div>
  </main>
}

function readError(error: unknown, fallback: string) { return error instanceof ApiError ? error.message : fallback }
