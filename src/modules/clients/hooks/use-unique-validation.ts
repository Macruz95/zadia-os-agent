'use client';

import { useState, useCallback } from 'react';
import { ClientValidationService } from '../services/validation/client-validation.service';

interface UseUniqueValidationProps {
  excludeClientId?: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const useUniqueValidation = ({ excludeClientId }: UseUniqueValidationProps = {}) => {
  const [validating, setValidating] = useState(false);

  /**
   * Validate email uniqueness
   */
  const validateEmail = useCallback(
    async (email: string): Promise<ValidationResult> => {
      if (!email) {
        return { isValid: true };
      }

      setValidating(true);
      try {
        const result = await ClientValidationService.isEmailUnique(email, excludeClientId);
        
        if (!result.isUnique) {
          return {
            isValid: false,
            error: `Este email ya está registrado en ${result.existingClientName}`,
          };
        }

        return { isValid: true };
      } catch (error) {
        void error;
        // On error, allow (fail open)
        return { isValid: true };
      } finally {
        setValidating(false);
      }
    },
    [excludeClientId]
  );

  /**
   * Validate phone uniqueness
   */
  const validatePhone = useCallback(
    async (phone: string, countryCode?: string): Promise<ValidationResult> => {
      if (!phone) {
        return { isValid: true };
      }

      setValidating(true);
      try {
        const result = await ClientValidationService.isPhoneUnique(
          phone,
          countryCode,
          excludeClientId
        );

        if (!result.isUnique) {
          return {
            isValid: false,
            error: `Este teléfono ya está registrado en ${result.existingClientName}`,
          };
        }

        return { isValid: true };
      } catch (error) {
        void error;
        return { isValid: true };
      } finally {
        setValidating(false);
      }
    },
    [excludeClientId]
  );

  /**
   * Validate document ID uniqueness
   */
  const validateDocumentId = useCallback(
    async (documentId: string): Promise<ValidationResult> => {
      if (!documentId) {
        return { isValid: true };
      }

      setValidating(true);
      try {
        const result = await ClientValidationService.isDocumentIdUnique(
          documentId,
          excludeClientId
        );

        if (!result.isUnique) {
          return {
            isValid: false,
            error: `Este documento ya está registrado en ${result.existingClientName}`,
          };
        }

        return { isValid: true };
      } catch (error) {
        void error;
        return { isValid: true };
      } finally {
        setValidating(false);
      }
    },
    [excludeClientId]
  );

  /**
   * Validate all unique fields at once
   */
  const validateAll = useCallback(
    async (data: {
      email?: string;
      phone?: string;
      phoneCountryCode?: string;
      documentId?: string;
    }): Promise<{
      isValid: boolean;
      errors: {
        email?: string;
        phone?: string;
        documentId?: string;
      };
    }> => {
      setValidating(true);
      try {
        const results = await ClientValidationService.validateUniqueFields({
          ...data,
          excludeClientId,
        });

        const errors: {
          email?: string;
          phone?: string;
          documentId?: string;
        } = {};

        let isValid = true;

        if (results.email && !results.email.isUnique) {
          errors.email = `Este email ya está registrado en ${results.email.existingClientName}`;
          isValid = false;
        }

        if (results.phone && !results.phone.isUnique) {
          errors.phone = `Este teléfono ya está registrado en ${results.phone.existingClientName}`;
          isValid = false;
        }

        if (results.documentId && !results.documentId.isUnique) {
          errors.documentId = `Este documento ya está registrado en ${results.documentId.existingClientName}`;
          isValid = false;
        }

        return { isValid, errors };
      } catch (error) {
        void error;
        return { isValid: true, errors: {} };
      } finally {
        setValidating(false);
      }
    },
    [excludeClientId]
  );

  return {
    validating,
    validateEmail,
    validatePhone,
    validateDocumentId,
    validateAll,
  };
};
