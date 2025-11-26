import type { Metadata } from "next";
import { AuthLogo, AuthFeaturePills } from "@/components/auth";

export const metadata: Metadata = {
  title: "Autenticación - ZADIA OS",
  description: "Accede a tu Sistema Operativo Empresarial Agéntico",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0f1a] overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          {/* Gradient Mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
          
          {/* Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
          
          {/* Animated Orbs */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-32 right-20 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-4">
              <div className="relative">
                <AuthLogo />
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 opacity-30 blur-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  ZADIA <span className="text-cyan-400">OS</span>
                </h1>
                <p className="text-sm text-gray-400 font-medium">
                  Agentic Enterprise Operating System
                </p>
              </div>
            </div>
          </div>
          
          {/* Main Message */}
          <div className="text-center max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              El Centro de Mando de tu
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                Empresa Inteligente
              </span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              Orquesta operaciones complejas con IA autónoma. 
              Tu negocio funciona mientras tú lideras.
            </p>
          </div>
          
          {/* Feature Pills - Client Component with Lucide Icons */}
          <AuthFeaturePills />
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">99.9%</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Uptime</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">&lt; 50ms</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Latencia</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">256-bit</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Encriptación</div>
            </div>
          </div>
        </div>
        
        {/* Bottom Decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </div>
      
      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#0d1117] p-6 lg:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
