'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { 
  loginFormSchema, 
  registerFormSchema, 
  forgotPasswordFormSchema,
  googleCompleteFormSchema,
  LoginFormData, 
  RegisterFormData, 
  ForgotPasswordFormData,
  GoogleCompleteFormData 
} from '@/validations/auth.schema';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';

/**
 * Hook for login form management
 */
export function useLoginForm() {
  const { t } = useTranslation();
  const { login } = useAuth();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      showToast.success(t('auth.success.loginSuccess'));
    } catch (error) {
      const message = error instanceof Error ? t(error.message) : t('auth.errors.generic');
      showToast.error(message);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: form.formState.isSubmitting
  };
}

/**
 * Hook for registration form management
 */
export function useRegisterForm() {
  const { t } = useTranslation();
  const { register } = useAuth();
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user' as const,
      language: 'es' as const,
      organization: undefined,
      objective: undefined
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data);
      showToast.success(t('auth.success.accountCreated'));
    } catch (error) {
      const message = error instanceof Error ? t(error.message) : t('auth.errors.generic');
      showToast.error(message);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: form.formState.isSubmitting
  };
}

/**
 * Hook for forgot password form management
 */
export function useForgotPasswordForm() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await resetPassword(data.email);
      showToast.success(t('auth.success.passwordResetSent'));
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? t(error.message) : t('auth.errors.generic');
      showToast.error(message);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: form.formState.isSubmitting
  };
}

/**
 * Hook for Google profile completion form management
 */
export function useGoogleCompleteForm() {
  const { t } = useTranslation();
  const { completeGoogleProfile } = useAuth();
  
  const form = useForm<GoogleCompleteFormData>({
    resolver: zodResolver(googleCompleteFormSchema),
    defaultValues: {
      role: 'user' as const,
      language: 'es' as const,
      organization: undefined,
      objective: undefined
    }
  });

  const onSubmit = async (data: GoogleCompleteFormData) => {
    try {
      await completeGoogleProfile(data);
      showToast.success(t('auth.success.accountCreated'));
    } catch (error) {
      const message = error instanceof Error ? t(error.message) : t('auth.errors.generic');
      showToast.error(message);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: form.formState.isSubmitting
  };
}

/**
 * Hook for Google OAuth login
 */
export function useGoogleAuth() {
  const { t } = useTranslation();
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = async (): Promise<'complete' | 'redirect'> => {
    try {
      await loginWithGoogle();
      
      // Check if user needs to complete profile (will be handled by AuthContext)
      // Return 'redirect' if user needs to complete profile, 'complete' if done
      return 'complete';
    } catch (error) {
      const message = error instanceof Error ? t(error.message) : t('auth.errors.generic');
      showToast.error(message);
      throw error;
    }
  };

  return {
    handleGoogleLogin
  };
}
