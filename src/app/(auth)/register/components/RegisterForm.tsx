'use client';

import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRegisterForm } from '@/hooks/use-auth-forms';
import {
  AuthCard,
  AuthCardHeader,
  AuthCardContent,
  AuthCardFooter,
  AuthDivider,
  GoogleButton
} from '@/components/auth';
import { BasicFields } from './BasicFields';
import { OptionalFields } from './OptionalFields';
import { SubmitSection } from './SubmitSection';

export function RegisterForm() {
  const { t } = useTranslation();
  const { form, onSubmit, isLoading } = useRegisterForm();

  return (
    <AuthCard>
      <AuthCardHeader
        title={t('auth.register.title')}
        subtitle={t('auth.register.subtitle')}
        icon={<UserPlus className="h-7 w-7 text-cyan-400" />}
      />

      <AuthCardContent className="max-h-[60vh] overflow-y-auto custom-scrollbar">
        <form onSubmit={onSubmit} className="space-y-5">
          <BasicFields form={form} />
          <OptionalFields form={form} />
          <SubmitSection form={form} isLoading={isLoading} />
        </form>

        <AuthDivider text={t('auth.or')} />

        <GoogleButton />
      </AuthCardContent>

      <AuthCardFooter>
        <p className="text-center text-sm text-gray-400">
          {t('auth.register.haveAccount')}{' '}
          <Link
            href="/login"
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            {t('auth.register.loginLink')}
          </Link>
        </p>
      </AuthCardFooter>
    </AuthCard>
  );
}
