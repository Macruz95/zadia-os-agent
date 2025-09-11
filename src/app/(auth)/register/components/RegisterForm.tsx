'use client';

import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegisterForm } from '@/hooks/use-auth-forms';
import { usePasswordVisibility } from '@/hooks/use-password-visibility';
import { GoogleAuthButton } from '../../components/GoogleAuthButton';

export function RegisterForm() {
  const { t } = useTranslation();
  const { form, onSubmit, isLoading } = useRegisterForm();
  const passwordVisibility = usePasswordVisibility();
  const confirmPasswordVisibility = usePasswordVisibility();

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

          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="role">{t('auth.register.role')}</Label>
            <Select
              value={form.watch('role')}
              onValueChange={(value) => form.setValue('role', value as 'admin' | 'manager' | 'user')}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('auth.register.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{t('auth.roles.user')}</SelectItem>
                <SelectItem value="manager">{t('auth.roles.manager')}</SelectItem>
                <SelectItem value="admin">{t('auth.roles.admin')}</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">
                {t(form.formState.errors.role.message || 'auth.validation.roleRequired')}
              </p>
            )}
          </div>

          {/* Language Field */}
          <div className="space-y-2">
            <Label htmlFor="language">{t('auth.register.language')}</Label>
            <Select
              value={form.watch('language')}
              onValueChange={(value) => form.setValue('language', value as 'es' | 'en')}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('auth.register.language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Organization Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="organization">{t('auth.register.organization')}</Label>
            <Input
              id="organization"
              type="text"
              placeholder={t('auth.register.organization')}
              {...form.register('organization')}
            />
          </div>

          {/* Objective Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="objective">{t('auth.register.objective')}</Label>
            <Select
              value={form.watch('objective') || ''}
              onValueChange={(value) => form.setValue('objective', value as 'automation' | 'analytics' | 'collaboration' | 'growth' | undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('auth.register.objective')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automation">{t('auth.objectives.automation')}</SelectItem>
                <SelectItem value="analytics">{t('auth.objectives.analytics')}</SelectItem>
                <SelectItem value="collaboration">{t('auth.objectives.collaboration')}</SelectItem>
                <SelectItem value="growth">{t('auth.objectives.growth')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('common.loading') : t('auth.register.submitButton')}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {t('auth.register.orContinueWith')}
            </span>
          </div>
        </div>

        {/* Google Auth Button */}
        <GoogleAuthButton />

        {/* Sign In Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">{t('auth.register.hasAccount')} </span>
          <Link href="/login" className="text-primary hover:underline">
            {t('auth.register.signIn')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
