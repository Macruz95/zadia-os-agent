'use client';

import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { Mail, Lock, User } from 'lucide-react';
import { AuthInput, PasswordStrengthIndicator } from '@/components/auth';
import { RegisterFormData } from '@/validations/auth.schema';

interface BasicFieldsProps {
  form: UseFormReturn<RegisterFormData>;
}

export function BasicFields({ form }: BasicFieldsProps) {
  const { t } = useTranslation();
  const passwordValue = form.watch('password');

  return (
    <div className="space-y-5">
      {/* Name Field */}
      <AuthInput
        label={t('auth.register.name')}
        type="text"
        placeholder="Tu nombre completo"
        icon={<User className="h-5 w-5" />}
        error={form.formState.errors.name && t(form.formState.errors.name.message || '')}
        {...form.register('name')}
      />

      {/* Email Field */}
      <AuthInput
        label={t('auth.register.email')}
        type="email"
        placeholder="tu@email.com"
        icon={<Mail className="h-5 w-5" />}
        error={form.formState.errors.email && t(form.formState.errors.email.message || '')}
        {...form.register('email')}
      />

      {/* Password Field */}
      <div className="space-y-3">
        <AuthInput
          label={t('auth.register.password')}
          type="password"
          placeholder="••••••••"
          icon={<Lock className="h-5 w-5" />}
          showPasswordToggle
          error={form.formState.errors.password && t(form.formState.errors.password.message || '')}
          {...form.register('password')}
        />
        
        {/* Password Strength Indicator */}
        <PasswordStrengthIndicator password={passwordValue || ''} />
      </div>

      {/* Confirm Password Field */}
      <AuthInput
        label={t('auth.register.confirmPassword')}
        type="password"
        placeholder="••••••••"
        icon={<Lock className="h-5 w-5" />}
        showPasswordToggle
        error={form.formState.errors.confirmPassword && t(form.formState.errors.confirmPassword.message || '')}
        {...form.register('confirmPassword')}
      />
    </div>
  );
}
