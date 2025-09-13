'use client';

import dynamic from 'next/dynamic';

// Dynamically import the form to prevent SSR issues
const RegisterForm = dynamic(
  () => import('./components/RegisterForm').then(mod => ({ default: mod.RegisterForm })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
);

export default function RegisterPage() {
  return <RegisterForm />;
}
