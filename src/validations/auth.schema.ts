import { z } from 'zod';

// User role validation
export const userRoleSchema = z.enum(['admin', 'manager', 'user']);

// Language validation
export const languageSchema = z.enum(['es', 'en']);

// User objective validation
export const userObjectiveSchema = z.enum(['automation', 'analytics', 'collaboration', 'growth']);

// Login form validation schema
export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'auth.validation.emailRequired')
    .email('auth.validation.emailInvalid'),
  password: z
    .string()
    .min(1, 'auth.validation.passwordRequired')
    .min(8, 'auth.validation.passwordMinLength')
});

// Register form validation schema
export const registerFormSchema = z.object({
  name: z
    .string()
    .min(1, 'auth.validation.nameRequired')
    .min(2, 'auth.validation.nameMinLength')
    .max(50, 'auth.validation.nameMaxLength'),
  email: z
    .string()
    .min(1, 'auth.validation.emailRequired')
    .email('auth.validation.emailInvalid'),
  password: z
    .string()
    .min(1, 'auth.validation.passwordRequired')
    .min(8, 'auth.validation.passwordMinLength')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'auth.validation.passwordComplexity'),
  confirmPassword: z
    .string()
    .min(1, 'auth.validation.confirmPasswordRequired'),
  language: languageSchema,
  organization: z
    .string()
    .optional(),
  objective: userObjectiveSchema.optional(),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'auth.validation.termsRequired'),
  acceptPrivacy: z
    .boolean()
    .refine(val => val === true, 'auth.validation.privacyRequired')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'auth.validation.passwordsNoMatch',
  path: ['confirmPassword']
});

// Forgot password validation schema
export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .min(1, 'auth.validation.emailRequired')
    .email('auth.validation.emailInvalid')
});

// Google profile completion validation schema
export const googleCompleteFormSchema = z.object({
  language: languageSchema,
  organization: z
    .string()
    .optional(),
  objective: userObjectiveSchema.optional()
});

// Firestore user profile validation schema
export const userProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  role: userRoleSchema,
  language: languageSchema,
  organization: z.string().optional(),
  objective: userObjectiveSchema.optional(),
  photoURL: z.string().optional(),
  createdAt: z.date(),
  lastLogin: z.date(),
  isActive: z.boolean()
});

// Export types from schemas
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;
export type GoogleCompleteFormData = z.infer<typeof googleCompleteFormSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
