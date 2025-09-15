'use client';

import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { Building, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RegisterFormData } from '@/validations/auth.schema';

interface OptionalFieldsProps {
  form: UseFormReturn<RegisterFormData>;
}

export function OptionalFields({ form }: OptionalFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Organization Field */}
      <div className="space-y-2">
        <Label htmlFor="organization">{t('auth.register.organization')}</Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="organization"
            type="text"
            placeholder={t('auth.register.organization')}
            className="pl-9"
            {...form.register('organization')}
          />
        </div>
        {form.formState.errors.organization && (
          <p className="text-sm text-destructive">
            {t(form.formState.errors.organization.message || 'auth.validation.organizationRequired')}
          </p>
        )}
      </div>

      {/* Objective Field */}
      <div className="space-y-2">
        <Label htmlFor="objective">{t('auth.register.objective')}</Label>
        <div className="relative">
          <Target className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Select
            value={form.watch('objective') || ''}
            onValueChange={(value) => form.setValue('objective', value as 'automation' | 'analytics' | 'collaboration' | 'growth')}
          >
            <SelectTrigger className="pl-9">
              <SelectValue placeholder={t('auth.register.selectObjective')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automation">{t('auth.register.objectives.automation')}</SelectItem>
              <SelectItem value="analytics">{t('auth.register.objectives.analytics')}</SelectItem>
              <SelectItem value="collaboration">{t('auth.register.objectives.collaboration')}</SelectItem>
              <SelectItem value="growth">{t('auth.register.objectives.growth')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {form.formState.errors.objective && (
          <p className="text-sm text-destructive">
            {t(form.formState.errors.objective.message || 'auth.validation.objectiveRequired')}
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
            <SelectValue placeholder={t('auth.register.selectLanguage')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="es">{t('auth.register.languages.spanish')}</SelectItem>
            <SelectItem value="en">{t('auth.register.languages.english')}</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.language && (
          <p className="text-sm text-destructive">
            {t(form.formState.errors.language.message || 'auth.validation.languageRequired')}
          </p>
        )}
      </div>
    </>
  );
}