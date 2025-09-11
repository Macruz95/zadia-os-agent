'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoogleCompleteForm } from '@/hooks/use-auth-forms';

export function GoogleCompleteForm() {
  const { t } = useTranslation();
  const { form, onSubmit, isLoading } = useGoogleCompleteForm();

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          {t('auth.googleComplete.title')}
        </CardTitle>
        <CardDescription>
          {t('auth.googleComplete.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="role">{t('auth.googleComplete.role')}</Label>
            <Select
              value={form.watch('role')}
              onValueChange={(value) => form.setValue('role', value as 'admin' | 'manager' | 'user')}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('auth.googleComplete.role')} />
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
            <Label htmlFor="language">{t('auth.googleComplete.language')}</Label>
            <Select
              value={form.watch('language')}
              onValueChange={(value) => form.setValue('language', value as 'es' | 'en')}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('auth.googleComplete.language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Organization Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="organization">{t('auth.googleComplete.organization')}</Label>
            <Input
              id="organization"
              type="text"
              placeholder={t('auth.googleComplete.organization')}
              {...form.register('organization')}
            />
          </div>

          {/* Objective Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="objective">{t('auth.googleComplete.objective')}</Label>
            <Select
              value={form.watch('objective') || ''}
              onValueChange={(value) => form.setValue('objective', value as 'automation' | 'analytics' | 'collaboration' | 'growth' | undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('auth.googleComplete.objective')} />
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
            {isLoading ? t('common.loading') : t('auth.googleComplete.submitButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
