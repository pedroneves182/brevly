import logo from '../assets/logo.svg'
import logoIcon from '../assets/logo-icon.svg'

export default function Brand({ iconOnly = false }: { iconOnly?: boolean }) {
  return <img className={iconOnly ? 'brand-icon' : 'brand'} src={iconOnly ? logoIcon : logo} alt="brev.ly" />
}
