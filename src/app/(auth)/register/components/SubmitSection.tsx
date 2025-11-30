'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { ArrowRight, FileText, Shield } from 'lucide-react';
import Link from 'next/link';
import { AuthButton, AuthCheckbox } from '@/components/auth';
import { RegisterFormData } from '@/validations/auth.schema';

interface SubmitSectionProps {
  form: UseFormReturn<RegisterFormData>;
  isLoading: boolean;
}

export function SubmitSection({ form, isLoading }: SubmitSectionProps) {
  const { t } = useTranslation();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const handleTermsChange = (checked: boolean) => {
    setAcceptTerms(checked);
    form.setValue('acceptTerms', checked);
  };

  const handlePrivacyChange = (checked: boolean) => {
    setAcceptPrivacy(checked);
    form.setValue('acceptPrivacy', checked);
  };

  return (
    <div className="space-y-5 pt-2">
      {/* Legal Section */}
      <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/30 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Shield className="h-4 w-4 text-cyan-400" />
          <span>Términos Legales</span>
        </div>

        <AuthCheckbox
          id="terms"
          checked={acceptTerms}
          onCheckedChange={handleTermsChange}
          label={
            <span>
              {t('auth.register.acceptTermsPrefix', { defaultValue: 'Acepto los' })}{' '}
              <Link 
                href="#" 
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                target="_blank"
              >
                <FileText className="inline h-3 w-3 mr-1" />
                {t('auth.register.termsLink', { defaultValue: 'Términos de Servicio' })}
              </Link>
            </span>
          }
          error={form.formState.errors.acceptTerms && t(form.formState.errors.acceptTerms.message || '')}
        />

        <AuthCheckbox
          id="privacy"
          checked={acceptPrivacy}
          onCheckedChange={handlePrivacyChange}
          label={
            <span>
              {t('auth.register.acceptPrivacyPrefix', { defaultValue: 'Acepto la' })}{' '}
              <Link 
                href="#" 
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                target="_blank"
              >
                <Shield className="inline h-3 w-3 mr-1" />
                {t('auth.register.privacyLink', { defaultValue: 'Política de Privacidad' })}
              </Link>
            </span>
          }
          error={form.formState.errors.acceptPrivacy && t(form.formState.errors.acceptPrivacy.message || '')}
        />
      </div>

      {/* Submit Button */}
      <AuthButton
        type="submit"
        isLoading={isLoading}
        loadingText={t('auth.register.registering')}
        icon={<ArrowRight className="h-5 w-5" />}
      >
        {t('auth.register.submit')}
      </AuthButton>
    </div>
  );
}
