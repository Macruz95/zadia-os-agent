/**
 * Document ID formatting utilities for client module
 */

/**
 * Format DUI (Documento Único de Identidad) for display
 * @param documentId - Document ID string
 * @returns Formatted document ID
 */
export const formatDocumentId = (documentId: string): string => {
  if (!documentId || typeof documentId !== 'string') {
    return documentId || '';
  }

  // Format 9-digit DUI (Dominican Republic format)
  if (documentId.length === 9) {
    return `${documentId.slice(0, 8)}-${documentId.slice(8)}`;
  }

  return documentId;
};

/**
 * Validate DUI format
 * @param dui - DUI string to validate
 * @returns True if DUI is valid
 */
export const isValidDUI = (dui: string): boolean => {
  if (!dui || typeof dui !== 'string') {
    return false;
  }

  const cleaned = dui.replace(/\D/g, '');
  return cleaned.length === 9;
};