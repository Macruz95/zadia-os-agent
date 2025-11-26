/**
 * ZADIA OS - Landing Header
 * Navegación principal con estética de centro de comando
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Sparkles,
  ArrowRight,
  // ChevronDown removed - not used
} from 'lucide-react';

const navigation = [
  { name: 'Características', href: '#features' },
  { name: 'Casos de Uso', href: '#showcase' },
  { name: 'Testimonios', href: '#testimonials' },
  { name: 'Precios', href: '#pricing' },
];

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[hsl(230_25%_8%/0.95)] backdrop-blur-xl border-b border-[hsl(230_15%_20%)]' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(250_95%_60%)] to-[hsl(280_90%_55%)] flex items-center justify-center shadow-[0_0_20px_hsl(250_100%_60%/0.3)] group-hover:shadow-[0_0_30px_hsl(250_100%_60%/0.4)] transition-shadow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">ZADIA</span>
              <span className="text-xl font-light text-[hsl(230_10%_60%)]"> OS</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-[hsl(230_10%_70%)] hover:text-white transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login">
              <Button 
                variant="ghost" 
                className="text-[hsl(230_10%_70%)] hover:text-white hover:bg-[hsl(230_15%_20%)]"
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                className="bg-gradient-to-r from-[hsl(250_95%_60%)] to-[hsl(280_90%_55%)] hover:from-[hsl(250_95%_65%)] hover:to-[hsl(280_90%_60%)] text-white border-0 shadow-[0_0_15px_hsl(250_100%_60%/0.3)]"
              >
                Comenzar Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[hsl(230_10%_70%)] hover:text-white"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[hsl(230_25%_8%)] border-t border-[hsl(230_15%_20%)]">
          <div className="container mx-auto px-4 py-6 space-y-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-lg font-medium text-[hsl(230_10%_70%)] hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4 border-t border-[hsl(230_15%_20%)] space-y-3">
              <Link href="/login" className="block">
                <Button 
                  variant="outline" 
                  className="w-full border-[hsl(230_15%_25%)] text-white"
                >
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register" className="block">
                <Button 
                  className="w-full bg-gradient-to-r from-[hsl(250_95%_60%)] to-[hsl(280_90%_55%)] text-white border-0"
                >
                  Comenzar Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
