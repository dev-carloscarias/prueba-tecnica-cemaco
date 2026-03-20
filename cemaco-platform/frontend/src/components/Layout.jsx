import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function Layout({ children }) {
  return (
    <div className="layout site-shell" id="top">
      <SiteHeader />
      <main className="main main-content">{children}</main>
      <SiteFooter />
    </div>
  )
}
