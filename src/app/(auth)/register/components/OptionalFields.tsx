'use client';

import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { Building, Target, Globe, Bot, BarChart3, Users, TrendingUp } from 'lucide-react';
import { AuthInput } from '@/components/auth';
import { RegisterFormData } from '@/validations/auth.schema';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface OptionalFieldsProps {
  form: UseFormReturn<RegisterFormData>;
}

const objectives: { value: 'automation' | 'analytics' | 'collaboration' | 'growth'; icon: LucideIcon }[] = [
  { value: 'automation', icon: Bot },
  { value: 'analytics', icon: BarChart3 },
  { value: 'collaboration', icon: Users },
  { value: 'growth', icon: TrendingUp },
];

const languages = [
  { value: 'es' as const, label: 'Español' },
  { value: 'en' as const, label: 'English' },
];

export function OptionalFields({ form }: OptionalFieldsProps) {
  const { t } = useTranslation();
  const selectedObjective = form.watch('objective');
  const selectedLanguage = form.watch('language');

  return (
    <div className="space-y-5 pt-2">
      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-700/50" />
        <span className="text-xs text-gray-500 uppercase tracking-wider">Opcional</span>
        <div className="flex-1 h-px bg-gray-700/50" />
      </div>

      {/* Organization Field */}
      <AuthInput
        label={t('auth.register.organization')}
        type="text"
        placeholder="Nombre de tu empresa"
        icon={<Building className="h-5 w-5" />}
        error={form.formState.errors.organization && t(form.formState.errors.organization.message || '')}
        {...form.register('organization')}
      />

      {/* Objective Field - Custom Pills with Lucide Icons */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Target className="h-4 w-4 text-gray-500" />
          {t('auth.register.objective')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {objectives.map((obj) => {
            const Icon = obj.icon;
            return (
              <button
                key={obj.value}
                type="button"
                onClick={() => form.setValue('objective', obj.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200",
                  "text-sm font-medium",
                  selectedObjective === obj.value
                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                    : "bg-gray-800/30 border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  selectedObjective === obj.value ? "text-cyan-400" : "text-gray-500"
                )} />
                <span>{t(`auth.register.objectives.${obj.value}`)}</span>
              </button>
            );
          })}
        </div>
        {form.formState.errors.objective && (
          <p className="text-sm text-red-400">
            {t(form.formState.errors.objective.message || '')}
          </p>
        )}
      </div>

      {/* Language Field - Custom Pills */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Globe className="h-4 w-4 text-gray-500" />
          {t('auth.register.language')}
        </label>
        <div className="flex gap-2">
          {languages.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => form.setValue('language', lang.value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200",
                "text-sm font-medium",
                selectedLanguage === lang.value
                  ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                  : "bg-gray-800/30 border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-gray-300"
              )}
            >
              <Globe className={cn(
                "h-4 w-4",
                selectedLanguage === lang.value ? "text-cyan-400" : "text-gray-500"
              )} />
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
        {form.formState.errors.language && (
          <p className="text-sm text-red-400">
            {t(form.formState.errors.language.message || '')}
          </p>
        )}
      </div>
    </div>
  );
}
