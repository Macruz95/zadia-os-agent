'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
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
 * Wait for auth session cookie to be set before redirecting
 */
async function waitForSession(maxWaitMs = 3000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    try {
      const user = auth.currentUser;
      if (user) {
        // Get fresh token and set cookie
        const token = await user.getIdToken(true);
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        
        if (response.ok) {
          // Verify cookie was set
          const verifyResponse = await fetch('/api/auth/session', { method: 'GET' });
          if (verifyResponse.ok) {
            const data = await verifyResponse.json();
            if (data.authenticated) {
              return true;
            }
          }
        }
      }
    } catch {
      // Ignore errors and retry
    }
    
    // Wait 100ms before retrying
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
}

/**
 * Hook for login form management
 */
export function useLoginForm() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();
  
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
      
      // Wait for session cookie to be set before redirecting
      const sessionReady = await waitForSession();
      if (sessionReady) {
        router.push('/dashboard');
      } else {
        // Fallback: try redirect anyway (cookie might work on next request)
        router.push('/dashboard');
      }
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
  const router = useRouter();
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      language: 'es' as const,
      organization: '',
      objective: undefined,
      acceptTerms: false,
      acceptPrivacy: false
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data);
      showToast.success(t('auth.success.accountCreated'));
      
      // Wait for session cookie to be set before redirecting
      const sessionReady = await waitForSession();
      if (sessionReady) {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
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
  const router = useRouter();
  
  const form = useForm({
    resolver: zodResolver(googleCompleteFormSchema),
    defaultValues: {
      language: 'es' as const,
      organization: '',
      objective: undefined
    }
  });

  const onSubmit = async (data: GoogleCompleteFormData) => {
    try {
      await completeGoogleProfile(data);
      showToast.success(t('auth.success.accountCreated'));
      
      // Wait for session cookie to be set before redirecting
      const sessionReady = await waitForSession();
      if (sessionReady) {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
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
