'use client';

import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForgotPasswordForm } from '@/hooks/use-auth-forms';

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const { form, onSubmit, isLoading } = useForgotPasswordForm();

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          {t('auth.forgotPassword.title')}
        </CardTitle>
        <CardDescription>
          {t('auth.forgotPassword.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.forgotPassword.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t('auth.forgotPassword.email')}
                className="pl-9"
                {...form.register('email')}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {t(form.formState.errors.email.message || 'auth.validation.emailRequired')}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('common.loading') : t('auth.forgotPassword.submitButton')}
          </Button>
        </form>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
