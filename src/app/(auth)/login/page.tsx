'use client';

import dynamic from 'next/dynamic';

// Dynamically import the form to prevent SSR issues
const LoginForm = dynamic(
  () => import('./components/LoginForm').then(mod => ({ default: mod.LoginForm })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
);

export default function LoginPage() {
  return <LoginForm />;
}
