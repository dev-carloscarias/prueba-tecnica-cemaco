import {
  FaCommentDots,
  FaEnvelope,
  FaFacebookF,
  FaHeadset,
  FaInstagram,
  FaPinterestP,
  FaStore,
  FaWhatsapp,
  FaYoutube,
} from 'react-icons/fa'
import { FaTiktok, FaXTwitter } from 'react-icons/fa6'

const footerColumns = [
  {
    title: 'Servicios',
    links: [
      'Instalaciones',
      'Blog',
      'Tiendas',
      'Privilegio',
      'Servicio a empresas',
      'Bodas',
      'Actividades',
    ],
  },
  {
    title: 'Nuestros valores',
    links: ['Sostenibilidad', 'Garantía total', 'Sistema B'],
  },
  {
    title: 'Venta en línea',
    links: [
      'Retirar en tienda',
      'Métodos de pago',
      'Preguntas frecuentes',
      'Instalar CEMACO.com',
    ],
  },
  {
    title: 'Grupo Cemaco',
    links: [
      'Únete a nuestro equipo',
      'Sobre nosotros',
      'Deseas ser proveedor',
      'Juguetón',
      'Bebé Juguetón',
    ],
  },
]

const socialLinks = [
  { href: '#top', label: 'TikTok', Icon: FaTiktok },
  { href: '#top', label: 'Facebook', Icon: FaFacebookF },
  { href: '#top', label: 'Instagram', Icon: FaInstagram },
  { href: '#top', label: 'X', Icon: FaXTwitter },
  { href: '#top', label: 'YouTube', Icon: FaYoutube },
  { href: '#top', label: 'Pinterest', Icon: FaPinterestP },
]

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <section className="footer-contact-bar" aria-label="Contacto">
        <div className="footer-contact-inner">
          <a href="#top" className="footer-contact-item">
            <FaStore aria-hidden />
            <span>Tiendas</span>
          </a>
          <a href="mailto:tusamigos@cemaco.com" className="footer-contact-item">
            <FaEnvelope aria-hidden />
            <span>tusamigos@cemaco.com</span>
          </a>
          <a href="#top" className="footer-contact-item">
            <FaWhatsapp aria-hidden />
            <span>Compra por WhatsApp</span>
          </a>
          <a href="tel:+50224999990" className="footer-contact-item">
            <FaHeadset aria-hidden />
            <span>(502) 2499-9990</span>
          </a>
          <a href="#top" className="footer-contact-item">
            <FaCommentDots aria-hidden />
            <span>Chat en línea</span>
          </a>
        </div>
      </section>

      <section className="footer-main-grid">
        <div className="footer-main-inner">
          {footerColumns.map((col) => (
            <div key={col.title} className="footer-col">
              <h3 className="footer-col-title">{col.title}</h3>
              <ul className="footer-col-list">
                {col.links.map((label) => (
                  <li key={label}>
                    <a href="#top" className="footer-col-link">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer-col footer-col--aside">
            <div className="footer-subscribe-block">
              <h3 className="footer-col-title">Suscríbete</h3>
              <p className="footer-subscribe-lead">Recibe ofertas, beneficios y noticias</p>
              <form
                className="footer-subscribe-form"
                onSubmit={(e) => {
                  e.preventDefault()
                }}
              >
                <input type="email" placeholder="Tu correo" aria-label="Correo para suscripción" />
                <button type="submit">SUSCRIBIRME</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="footer-legal-bar">
        <div className="footer-legal-inner">
          <div className="footer-legal-links">
            <a href="#top">Privacidad</a>
            <a href="#top">Términos y condiciones</a>
          </div>
          <div className="footer-social">
            {socialLinks.map(({ href, label, Icon }) => (
              <a key={label} href={href} className="footer-social-btn" aria-label={label}>
                <Icon aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </section>

      <button type="button" className="footer-fab" aria-label="Asistente" title="Asistente">
        ✦
      </button>
    </footer>
  )
}
