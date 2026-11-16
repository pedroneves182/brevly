import notFoundImage from '../assets/not-found.svg'

export default function NotFoundPage() {
  return <main className="page message-page"><section className="message-card not-found-card"><img className="not-found-image" src={notFoundImage} alt="Erro 404" /><h1>Link não encontrado</h1><p>O link que você está tentando acessar não existe, foi removido ou é uma URL inválida. Saiba mais em brev.ly.</p></section></main>
}
