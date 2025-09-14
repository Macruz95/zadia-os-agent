'use client';

import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePasswordVisibility } from '@/hooks/use-password-visibility';

interface BasicFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}

export function BasicFields({ form }: BasicFieldsProps) {
  const { t } = useTranslation();
  const passwordVisibility = usePasswordVisibility();
  const confirmPasswordVisibility = usePasswordVisibility();

  return (
    <>
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">{t('auth.register.name')}</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder={t('auth.register.name')}
            className="pl-9"
            {...form.register('name')}
          />
        </div>
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {t(form.formState.errors.name.message || 'auth.validation.nameRequired')}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">{t('auth.register.email')}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder={t('auth.register.email')}
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
        <Label htmlFor="password">{t('auth.register.password')}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={passwordVisibility.type}
            placeholder={t('auth.register.password')}
            className="pl-9 pr-9"
            {...form.register('password')}
          />
          <button
            type="button"
            onClick={passwordVisibility.toggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {passwordVisibility.isVisible ? (
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

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={confirmPasswordVisibility.type}
            placeholder={t('auth.register.confirmPassword')}
            className="pl-9 pr-9"
            {...form.register('confirmPassword')}
          />
          <button
            type="button"
            onClick={confirmPasswordVisibility.toggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {confirmPasswordVisibility.isVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {t(form.formState.errors.confirmPassword.message || 'auth.validation.passwordsNoMatch')}
          </p>
        )}
      </div>
    </>
  );
}