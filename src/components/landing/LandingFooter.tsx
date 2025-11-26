/**
 * ZADIA OS - Landing Footer
 * Footer profesional con estética de centro de comando
 */

'use client';

import Link from 'next/link';
import { 
  Sparkles,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
} from 'lucide-react';

const footerLinks = {
  producto: [
    { name: 'Características', href: '#features' },
    { name: 'Precios', href: '#pricing' },
    { name: 'Casos de Uso', href: '#showcase' },
    { name: 'Integraciones', href: '#integrations' },
    { name: 'API', href: '/docs/api' },
  ],
  empresa: [
    { name: 'Sobre Nosotros', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Carreras', href: '/careers' },
    { name: 'Contacto', href: '/contact' },
    { name: 'Partners', href: '/partners' },
  ],
  recursos: [
    { name: 'Documentación', href: '/docs' },
    { name: 'Centro de Ayuda', href: '/help' },
    { name: 'Comunidad', href: '/community' },
    { name: 'Webinars', href: '/webinars' },
    { name: 'Status', href: '/status' },
  ],
  legal: [
    { name: 'Privacidad', href: '/privacy' },
    { name: 'Términos', href: '/terms' },
    { name: 'Cookies', href: '/cookies' },
    { name: 'Seguridad', href: '/security' },
  ],
};

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/zadiaos' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/zadiaos' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@zadiaos' },
  { name: 'Email', icon: Mail, href: 'mailto:hello@zadia.io' },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-[hsl(230_15%_18%)] bg-[hsl(230_25%_6%)]">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(250_95%_60%)] to-[hsl(280_90%_55%)] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">ZADIA</span>
                <span className="text-xl font-light text-[hsl(230_10%_60%)]"> OS</span>
              </div>
            </Link>

            <p className="text-[hsl(230_10%_55%)] mb-6 max-w-xs leading-relaxed">
              El Sistema Operativo Empresarial Agéntico. 
              Orquestamos tu negocio con inteligencia autónoma.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-[hsl(230_20%_12%)] border border-[hsl(230_15%_20%)] flex items-center justify-center text-[hsl(230_10%_55%)] hover:text-white hover:border-[hsl(250_95%_60%/0.5)] hover:bg-[hsl(230_20%_15%)] transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Producto */}
          <div>
            <h4 className="font-semibold text-white mb-4">Producto</h4>
            <ul className="space-y-3">
              {footerLinks.producto.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-[hsl(230_10%_55%)] hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-[hsl(230_10%_55%)] hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-semibold text-white mb-4">Recursos</h4>
            <ul className="space-y-3">
              {footerLinks.recursos.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-[hsl(230_10%_55%)] hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-[hsl(230_10%_55%)] hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-[hsl(230_15%_15%)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[hsl(230_10%_45%)]">
            © {new Date().getFullYear()} ZADIA OS. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(145_80%_45%)] animate-pulse" />
              <span className="text-xs text-[hsl(230_10%_50%)]">Todos los sistemas operativos</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
