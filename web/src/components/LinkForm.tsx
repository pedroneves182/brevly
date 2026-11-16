import type { FormEvent } from 'react'
import type { NewLinkErrors, NewLinkInput } from '../schemas/link'

type Props = {
  values: NewLinkInput
  errors: NewLinkErrors
  isSaving: boolean
  onChange: (field: keyof NewLinkInput, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function LinkForm({ values, errors, isSaving, onChange, onSubmit }: Props) {
  return (
    <section className="card new-link-card" aria-labelledby="new-link-title">
      <h1 id="new-link-title">Novo link</h1>
      <form onSubmit={onSubmit} noValidate>
        <label className={`input-group ${errors.originalUrl ? 'has-error' : ''}`}>
          <span>Link original</span>
          <div className="input-wrap"><input value={values.originalUrl} placeholder="https://exemplo.com" onChange={(event) => onChange('originalUrl', event.target.value)} aria-invalid={Boolean(errors.originalUrl)} /></div>
          {errors.originalUrl && <small>{errors.originalUrl}</small>}
        </label>
        <label className={`input-group ${errors.shortUrl ? 'has-error' : ''}`}>
          <span>Link encurtado</span>
          <div className="input-wrap"><span className="input-prefix">brev.ly/</span><input value={values.shortUrl} placeholder="meu-link" onChange={(event) => onChange('shortUrl', event.target.value)} aria-invalid={Boolean(errors.shortUrl)} /></div>
          {errors.shortUrl && <small>{errors.shortUrl}</small>}
        </label>
        <button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar link'}</button>
      </form>
    </section>
  )
}
