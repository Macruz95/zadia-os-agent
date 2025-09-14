/**
 * User Service Utilities
 * Common error handling and utility functions
 */

/**
 * Handle Firestore errors and convert to user-friendly messages
 */
export function handleUserError(error: unknown): Error {
  console.error('UserService error:', error);
  
  if (error instanceof Error) {
    // If it's a Zod validation error, return specific message
    if (error.message.includes('validation')) {
      return new Error('Invalid user data format');
    }
  }
  
  return new Error('Failed to process user data');
}