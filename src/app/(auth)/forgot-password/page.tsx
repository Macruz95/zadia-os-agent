'use client';

import dynamic from 'next/dynamic';

// Dynamically import the form to prevent SSR issues
const ForgotPasswordForm = dynamic(
  () => import('./components/ForgotPasswordForm').then(mod => ({ default: mod.ForgotPasswordForm })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
);

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
