import { FirebaseError } from 'firebase/app';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger';

/**
 * User Service Utilities
 * Common error handling and utility functions with comprehensive error mapping
 */

/**
 * Maps Firebase error codes to i18n translation keys
 */
const FIREBASE_ERROR_MAP: Record<string, string> = {
  'permission-denied': 'errors.user.permissionDenied',
  'not-found': 'errors.user.notFound',
  'already-exists': 'errors.user.alreadyExists',
  'resource-exhausted': 'errors.user.resourceExhausted',
  'failed-precondition': 'errors.user.failedPrecondition',
  'aborted': 'errors.user.operationAborted',
  'out-of-range': 'errors.user.outOfRange',
  'unimplemented': 'errors.user.unimplemented',
  'internal': 'errors.user.internalError',
  'unavailable': 'errors.user.serviceUnavailable',
  'data-loss': 'errors.user.dataLoss',
  'unauthenticated': 'errors.user.unauthenticated'
};

/**
 * Maps Zod error types to i18n translation keys
 */
const ZOD_ERROR_MAP: Record<string, string> = {
  'invalid_type': 'errors.validation.invalidType',
  'invalid_literal': 'errors.validation.invalidLiteral',
  'unrecognized_keys': 'errors.validation.unrecognizedKeys',
  'invalid_union': 'errors.validation.invalidUnion',
  'invalid_union_discriminator': 'errors.validation.invalidUnionDiscriminator',
  'invalid_enum_value': 'errors.validation.invalidEnumValue',
  'invalid_arguments': 'errors.validation.invalidArguments',
  'invalid_return_type': 'errors.validation.invalidReturnType',
  'invalid_date': 'errors.validation.invalidDate',
  'invalid_string': 'errors.validation.invalidString',
  'too_small': 'errors.validation.tooSmall',
  'too_big': 'errors.validation.tooBig',
  'invalid_intersection_types': 'errors.validation.invalidIntersectionTypes',
  'not_multiple_of': 'errors.validation.notMultipleOf',
  'not_finite': 'errors.validation.notFinite'
};

/**
 * Handle Firestore errors and convert to user-friendly messages with i18n keys
 */
export function handleUserError(error: unknown): Error {
  logger.error('User service error occurred', error as Error, {
    component: 'UserService',
    action: 'handleUserError'
  });

  // Handle Firebase errors
  if (error instanceof FirebaseError) {
    const translationKey = FIREBASE_ERROR_MAP[error.code] || 'errors.user.firebaseGeneric';
    const errorMessage = new Error(translationKey);
    errorMessage.name = 'UserServiceError';
    return errorMessage;
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    const translationKey = ZOD_ERROR_MAP[firstIssue.code] || 'errors.validation.generic';
    const errorMessage = new Error(translationKey);
    errorMessage.name = 'ValidationError';
    return errorMessage;
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    const errorMessage = new Error('errors.network.connectionFailed');
    errorMessage.name = 'NetworkError';
    return errorMessage;
  }

  // Handle generic errors with known patterns
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('validation')) {
      return new Error('errors.validation.generic');
    }
    
    if (error.message.includes('network')) {
      return new Error('errors.network.generic');
    }
    
    if (error.message.includes('timeout')) {
      return new Error('errors.network.timeout');
    }
    
    // Log unexpected errors for debugging
    logger.error('Unexpected error pattern', error, {
      component: 'UserService',
      action: 'handleUserError',
      metadata: { errorType: 'unexpected' }
    });
  }
  
  // Default fallback error
  const fallbackError = new Error('errors.user.generic');
  fallbackError.name = 'UserServiceError';
  return fallbackError;
}

/**
 * Validates if a user ID format is correct
 */
export function isValidUserId(uid: string): boolean {
  if (!uid || typeof uid !== 'string') {
    return false;
  }
  
  // Firebase Auth UIDs are typically 28 characters long and alphanumeric
  const uidRegex = /^[a-zA-Z0-9]{20,}$/;
  return uidRegex.test(uid);
}

/**
 * Sanitizes user input to prevent XSS and other injection attacks
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}