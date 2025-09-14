'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegisterForm } from '@/hooks/use-auth-forms';
import { GoogleAuthButton } from '../../components/GoogleAuthButton';
import { BasicFields } from './BasicFields';
import { OptionalFields } from './OptionalFields';
import { SubmitSection } from './SubmitSection';

export function RegisterForm() {
  const { t } = useTranslation();
  const { form, onSubmit, isLoading } = useRegisterForm();

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          {t('auth.register.title')}
        </CardTitle>
        <CardDescription>
          {t('auth.register.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <BasicFields form={form} />
          <OptionalFields form={form} />
          <SubmitSection form={form} isLoading={isLoading} />
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t('auth.or')}
            </span>
          </div>
        </div>

        <GoogleAuthButton />

        <div className="text-center text-sm">
          {t('auth.register.haveAccount')}{' '}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            {t('auth.register.loginLink')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
