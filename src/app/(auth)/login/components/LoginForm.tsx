'use client';

import { useTranslation } from 'react-i18next';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLoginForm } from '@/hooks/use-auth-forms';
import {
  AuthCard,
  AuthCardHeader,
  AuthCardContent,
  AuthCardFooter,
  AuthInput,
  AuthButton,
  AuthDivider,
  GoogleButton
} from '@/components/auth';

export function LoginForm() {
  const { t } = useTranslation();
  const { form, onSubmit, isLoading } = useLoginForm();

  return (
    <AuthCard>
      <AuthCardHeader
        title={t('auth.login.title')}
        subtitle={t('auth.login.subtitle')}
        icon={<LogIn className="h-7 w-7 text-cyan-400" />}
      />

      <AuthCardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Email Field */}
          <AuthInput
            label={t('auth.login.email')}
            type="email"
            placeholder="tu@email.com"
            icon={<Mail className="h-5 w-5" />}
            error={form.formState.errors.email && t(form.formState.errors.email.message || '')}
            {...form.register('email')}
          />

          {/* Password Field */}
          <AuthInput
            label={t('auth.login.password')}
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-5 w-5" />}
            showPasswordToggle
            error={form.formState.errors.password && t(form.formState.errors.password.message || '')}
            {...form.register('password')}
          />

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </div>

          {/* Submit Button */}
          <AuthButton
            type="submit"
            isLoading={isLoading}
            loadingText={t('common.loading')}
            icon={<ArrowRight className="h-5 w-5" />}
          >
            {t('auth.login.submitButton')}
          </AuthButton>
        </form>

        <AuthDivider text={t('auth.login.orContinueWith')} />

        {/* Google Auth Button */}
        <GoogleButton />
      </AuthCardContent>

      <AuthCardFooter>
        <p className="text-center text-sm text-gray-400">
          {t('auth.login.noAccount')}{' '}
          <Link
            href="/register"
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            {t('auth.login.createAccount')}
          </Link>
        </p>
      </AuthCardFooter>
    </AuthCard>
  );
}
