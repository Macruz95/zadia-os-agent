'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Github, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

export function LandingFooter() {
  const { t } = useTranslation();

  const socialLinks = [
    { icon: <Github className="h-5 w-5" />, href: '#', label: 'GitHub' },
    { icon: <Twitter className="h-5 w-5" />, href: '#', label: 'Twitter' },
    { icon: <Linkedin className="h-5 w-5" />, href: '#', label: 'LinkedIn' },
  ];

  const footerLinks = [
    {
      title: t('landing.footer.product.title'),
      links: [
        { label: t('landing.footer.product.features'), href: '/features' },
        { label: t('landing.footer.product.pricing'), href: '/pricing' },
        { label: t('landing.footer.product.documentation'), href: '/docs' },
      ],
    },
    {
      title: t('landing.footer.company.title'),
      links: [
        { label: t('landing.footer.company.about'), href: '/about' },
        { label: t('landing.footer.company.blog'), href: '/blog' },
        { label: t('landing.footer.company.careers'), href: '/careers' },
      ],
    },
    {
      title: t('landing.footer.support.title'),
      links: [
        { label: t('landing.footer.support.help'), href: '/help' },
        { label: t('landing.footer.support.contact'), href: '/contact' },
        { label: t('landing.footer.support.status'), href: '/status' },
      ],
    },
    {
      title: t('landing.footer.legal.title'),
      links: [
        { label: t('landing.footer.legal.privacy'), href: '/privacy' },
        { label: t('landing.footer.legal.terms'), href: '/terms' },
        { label: t('landing.footer.legal.cookies'), href: '/cookies' },
      ],
    },
  ];

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Zadia OS Agent</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('landing.footer.description')}
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social, index) => (
                <Button key={index} variant="ghost" size="sm" asChild>
                  <Link href={social.href} aria-label={social.label}>
                    {social.icon}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Zadia OS Agent. {t('landing.footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}