import copyIcon from '../assets/copy.svg'
import divider from '../assets/divider.svg'
import downloadIcon from '../assets/download.svg'
import linkIcon from '../assets/link.svg'
import trashIcon from '../assets/trash.svg'
import { publicLink } from '../lib/links'
import type { ShortLink } from '../types'

type Props = {
  links: ShortLink[]
  isLoading: boolean
  isExporting: boolean
  removingId: string | null
  copiedId: string | null
  onExport: () => void
  onCopy: (link: ShortLink) => void
  onDelete: (id: string) => void
}

export default function LinksPanel({ links, isLoading, isExporting, removingId, copiedId, onExport, onCopy, onDelete }: Props) {
  return (
    <section className="card links-card" aria-labelledby="my-links-title">
      <div className="card-heading"><h2 id="my-links-title">Meus links</h2><button className="export-button" type="button" onClick={onExport} disabled={isExporting || isLoading}><img src={downloadIcon} alt="" />{isExporting ? 'Baixando...' : 'Baixar CSV'}</button></div>
      {isLoading ? <div className="loading-state" aria-live="polite"><span className="spinner" /> Carregando links...</div> : links.length === 0 ? <div className="empty-state"><img src={linkIcon} alt="" /><p>Ainda não existem links cadastrados.</p></div> : (
        <div className="links-list">{links.map((link) => <article className="link-row" key={link.id}>
          <img className="row-divider" src={divider} alt="" />
          <div className="link-information"><a href={publicLink(link.shortUrl)} target="_blank" rel="noreferrer">{publicLink(link.shortUrl)}</a><span>{link.originalUrl}</span></div>
          <span className="access-count">{link.accessCount} {link.accessCount === 1 ? 'acesso' : 'acessos'}</span>
          <div className="row-actions"><button type="button" aria-label="Copiar link" onClick={() => onCopy(link)}><img src={copyIcon} alt="" /></button><button type="button" aria-label="Excluir link" disabled={removingId === link.id} onClick={() => onDelete(link.id)}><img src={trashIcon} alt="" /></button></div>
          {copiedId === link.id && <span className="copy-feedback">Copiado!</span>}
        </article>)}</div>
      )}
    </section>
  )
}
