'use client';

import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, Send, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useForgotPasswordForm } from '@/hooks/use-auth-forms';
import {
  AuthCard,
  AuthCardHeader,
  AuthCardContent,
  AuthCardFooter,
  AuthInput,
  AuthButton
} from '@/components/auth';

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const { form, onSubmit, isLoading } = useForgotPasswordForm();

  return (
    <AuthCard>
      <AuthCardHeader
        title={t('auth.forgotPassword.title')}
        subtitle={t('auth.forgotPassword.subtitle')}
        icon={<KeyRound className="h-7 w-7 text-cyan-400" />}
      />

      <AuthCardContent>
        {/* Info Message */}
        <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <p className="text-sm text-cyan-300/80 leading-relaxed">
            Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Email Field */}
          <AuthInput
            label={t('auth.forgotPassword.email')}
            type="email"
            placeholder="tu@email.com"
            icon={<Mail className="h-5 w-5" />}
            error={form.formState.errors.email && t(form.formState.errors.email.message || '')}
            {...form.register('email')}
          />

          {/* Submit Button */}
          <AuthButton
            type="submit"
            isLoading={isLoading}
            loadingText="Enviando..."
            icon={<Send className="h-5 w-5" />}
          >
            {t('auth.forgotPassword.submitButton')}
          </AuthButton>
        </form>
      </AuthCardContent>

      <AuthCardFooter>
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('auth.forgotPassword.backToLogin')}
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
