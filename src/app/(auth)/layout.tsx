import type { Metadata } from "next";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
