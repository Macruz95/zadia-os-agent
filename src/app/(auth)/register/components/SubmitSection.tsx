'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
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
    <>
      {/* Terms and Privacy */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={handleTermsChange}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('auth.register.acceptTerms')}
          </label>
        </div>
        {form.formState.errors.acceptTerms && (
          <p className="text-sm text-destructive">
            {t(form.formState.errors.acceptTerms.message || 'auth.validation.termsRequired')}
          </p>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="privacy"
            checked={acceptPrivacy}
            onCheckedChange={handlePrivacyChange}
          />
          <label
            htmlFor="privacy"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('auth.register.acceptPrivacy')}
          </label>
        </div>
        {form.formState.errors.acceptPrivacy && (
          <p className="text-sm text-destructive">
            {t(form.formState.errors.acceptPrivacy.message || 'auth.validation.privacyRequired')}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            {t('auth.register.registering')}
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            {t('auth.register.submit')}
          </>
        )}
      </Button>
    </>
  );
}