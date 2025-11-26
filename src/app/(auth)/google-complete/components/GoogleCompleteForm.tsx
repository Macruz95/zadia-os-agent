'use client';

import { useTranslation } from 'react-i18next';
import { Building, Target, Globe, ArrowRight, Sparkles, Bot, BarChart3, Users, TrendingUp } from 'lucide-react';
import { useGoogleCompleteForm } from '@/hooks/use-auth-forms';
import {
  AuthCard,
  AuthCardHeader,
  AuthCardContent,
  AuthInput,
  AuthButton
} from '@/components/auth';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

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

export function GoogleCompleteForm() {
  const { t } = useTranslation();
  const { form, onSubmit, isLoading } = useGoogleCompleteForm();
  const selectedObjective = form.watch('objective');
  const selectedLanguage = form.watch('language');

  return (
    <AuthCard>
      <AuthCardHeader
        title={t('auth.googleComplete.title')}
        subtitle={t('auth.googleComplete.subtitle')}
        icon={<Sparkles className="h-7 w-7 text-cyan-400" />}
      />

      <AuthCardContent>
        {/* Welcome Message */}
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-sm text-emerald-300/80 leading-relaxed">
            ¡Casi listo! Solo necesitamos algunos datos más para personalizar tu experiencia en ZADIA OS.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Language Field - Custom Pills with Lucide Icons */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Globe className="h-4 w-4 text-gray-500" />
              {t('auth.googleComplete.language')}
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
          </div>

          {/* Organization Field */}
          <AuthInput
            label={t('auth.googleComplete.organization')}
            type="text"
            placeholder="Nombre de tu empresa (opcional)"
            icon={<Building className="h-5 w-5" />}
            {...form.register('organization')}
          />

          {/* Objective Field - Custom Pills with Lucide Icons */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Target className="h-4 w-4 text-gray-500" />
              {t('auth.googleComplete.objective')}
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
                    <span>{t(`auth.objectives.${obj.value}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <AuthButton
            type="submit"
            isLoading={isLoading}
            loadingText={t('common.loading')}
            icon={<ArrowRight className="h-5 w-5" />}
          >
            {t('auth.googleComplete.submitButton')}
          </AuthButton>
        </form>
      </AuthCardContent>
    </AuthCard>
  );
}
