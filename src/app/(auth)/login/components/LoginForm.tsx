'use client';

import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoginForm } from '@/hooks/use-auth-forms';
import { usePasswordVisibility } from '@/hooks/use-password-visibility';
import { GoogleAuthButton } from '../../components/GoogleAuthButton';

export function LoginForm() {
  const { t } = useTranslation();
  const { form, onSubmit, isLoading } = useLoginForm();
  const { isVisible, toggle, type } = usePasswordVisibility();

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          {t('auth.login.title')}
        </CardTitle>
        <CardDescription>
          {t('auth.login.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.login.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t('auth.login.email')}
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

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.login.password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={type}
                placeholder={t('auth.login.password')}
                className="pl-9 pr-9"
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={toggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {isVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {t(form.formState.errors.password.message || 'auth.validation.passwordRequired')}
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link 
              href="/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('common.loading') : t('auth.login.submitButton')}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {t('auth.login.orContinueWith')}
            </span>
          </div>
        </div>

        {/* Google Auth Button */}
        <GoogleAuthButton />

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">{t('auth.login.noAccount')} </span>
          <Link href="/register" className="text-primary hover:underline">
            {t('auth.login.createAccount')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
