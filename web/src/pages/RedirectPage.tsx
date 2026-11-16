import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Brand from '../components/Brand'
import { api } from '../lib/api'
import NotFoundPage from './NotFoundPage'

export default function RedirectPage() {
  const { shortUrl = '' } = useParams()
  const [originalUrl, setOriginalUrl] = useState('')
  const [failed, setFailed] = useState(false)
  const requestRef = useRef<{ shortUrl: string; request: ReturnType<typeof api.resolveLink> } | null>(null)

  useEffect(() => {
    let active = true
    if (requestRef.current?.shortUrl !== shortUrl) requestRef.current = { shortUrl, request: api.resolveLink(shortUrl) }
    requestRef.current.request.then(({ originalUrl: url }) => {
      if (!active) return
      setOriginalUrl(url)
      window.setTimeout(() => window.location.assign(url), 900)
    }).catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [shortUrl])

  if (failed) return <NotFoundPage />
  return <main className="page message-page"><section className="message-card"><Brand iconOnly /><h1>Redirecionando...</h1><p>O link será aberto automaticamente em alguns instantes.</p>{originalUrl && <a href={originalUrl}>Não foi redirecionado? Acesse aqui</a>}</section></main>
}
