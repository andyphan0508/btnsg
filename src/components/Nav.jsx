import { site, nav } from '../data/content.js'

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-in">
        <a className="brand" href="#top">
          <span className="brand-mark">TN</span>
          {site.brand}
          <span className="brand-city">&nbsp;{site.brandCity}</span>
        </a>
        <div className="nav-links">
          {nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
