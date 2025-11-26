import { z } from 'zod';

// ============================================
// ZADIA OS - Authentication Validation Schemas
// ============================================

// Language validation
export const languageSchema = z.enum(['es', 'en']);

// User objective validation
export const userObjectiveSchema = z.enum(['automation', 'analytics', 'collaboration', 'growth']);

// Email validation with sanitization
const emailSchema = z
  .string()
  .min(1, 'auth.validation.emailRequired')
  .email('auth.validation.emailInvalid')
  .max(255, 'auth.validation.emailTooLong')
  .transform(val => val.toLowerCase().trim());

// Password validation with strong requirements
const passwordSchema = z
  .string()
  .min(1, 'auth.validation.passwordRequired')
  .min(8, 'auth.validation.passwordMinLength')
  .max(128, 'auth.validation.passwordTooLong')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'auth.validation.passwordComplexity'
  );

// Name validation with sanitization
const nameSchema = z
  .string()
  .min(1, 'auth.validation.nameRequired')
  .min(2, 'auth.validation.nameMinLength')
  .max(100, 'auth.validation.nameMaxLength')
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'auth.validation.nameInvalidChars')
  .transform(val => val.trim());

// Organization name validation
const organizationSchema = z
  .string()
  .max(200, 'auth.validation.organizationTooLong')
  .optional()
  .transform(val => val?.trim() || undefined);

// ============================================
// Login Form Schema
// ============================================
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'auth.validation.passwordRequired')
    .min(8, 'auth.validation.passwordMinLength')
});

// ============================================
// Register Form Schema
// ============================================
export const registerFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z
    .string()
    .min(1, 'auth.validation.confirmPasswordRequired'),
  language: languageSchema,
  organization: organizationSchema,
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

// ============================================
// Forgot Password Schema
// ============================================
export const forgotPasswordFormSchema = z.object({
  email: emailSchema
});

// ============================================
// Google Profile Completion Schema
// ============================================
export const googleCompleteFormSchema = z.object({
  language: languageSchema,
  organization: organizationSchema,
  objective: userObjectiveSchema.optional()
});

// ============================================
// User Profile Schema (Firestore Document)
// ============================================
export const userProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  role: z.string().optional(),
  language: languageSchema,
  organization: z.string().optional(),
  objective: userObjectiveSchema.optional(),
  photoURL: z.string().url().optional(),
  createdAt: z.date(),
  lastLogin: z.date(),
  isActive: z.boolean(),
  // Security metadata
  loginAttempts: z.number().optional(),
  lastFailedLogin: z.date().optional(),
  lockedUntil: z.date().optional()
});

// ============================================
// Password Reset Schema
// ============================================
export const passwordResetSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'auth.validation.confirmPasswordRequired')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'auth.validation.passwordsNoMatch',
  path: ['confirmPassword']
});

// ============================================
// Change Password Schema (for authenticated users)
// ============================================
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'auth.validation.currentPasswordRequired'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'auth.validation.confirmPasswordRequired')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'auth.validation.passwordsNoMatch',
  path: ['confirmNewPassword']
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'auth.validation.passwordMustBeDifferent',
  path: ['newPassword']
});

// ============================================
// Export Types
// ============================================
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.input<typeof registerFormSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;
export type GoogleCompleteFormData = z.infer<typeof googleCompleteFormSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
