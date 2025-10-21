import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Service for validating client data uniqueness
 */
export class ClientValidationService {
  private static readonly CLIENTS_COLLECTION = 'clients';
  private static readonly CONTACTS_COLLECTION = 'contacts';

  /**
   * Check if email is already in use
   * @param email Email to validate
   * @param excludeClientId Optional client ID to exclude from check (for updates)
   * @returns true if email is available, false if already in use
   */
  static async isEmailUnique(email: string, excludeClientId?: string): Promise<{
    isUnique: boolean;
    existingClientId?: string;
    existingClientName?: string;
  }> {
    try {
      // Check in contacts collection
      const contactsRef = collection(db, this.CONTACTS_COLLECTION);
      const q = query(contactsRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingContact = querySnapshot.docs[0].data();
        const clientId = existingContact.clientId;

        // If excluding a specific client (for updates), check if it's the same client
        if (excludeClientId && clientId === excludeClientId) {
          return { isUnique: true };
        }

        // Get client name for better error message
        const clientDoc = await this.getClientById(clientId);
        return {
          isUnique: false,
          existingClientId: clientId,
          existingClientName: clientDoc?.name || 'Cliente existente',
        };
      }

      return { isUnique: true };
    } catch (error) {
      // Log error silently, fail open to not block user
      void error;
      return { isUnique: true };
    }
  }

  /**
   * Check if phone number is already in use
   * @param phone Phone number to validate
   * @param countryCode Country code (optional, for more precise matching)
   * @param excludeClientId Optional client ID to exclude from check (for updates)
   * @returns true if phone is available, false if already in use
   */
  static async isPhoneUnique(
    phone: string,
    countryCode?: string,
    excludeClientId?: string
  ): Promise<{
    isUnique: boolean;
    existingClientId?: string;
    existingClientName?: string;
  }> {
    try {
      // Normalize phone (remove spaces, dashes)
      const normalizedPhone = phone.replace(/[\s-]/g, '');

      // Check in contacts collection
      const contactsRef = collection(db, this.CONTACTS_COLLECTION);
      const q = query(contactsRef, where('phone', '==', normalizedPhone));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingContact = querySnapshot.docs[0].data();
        const clientId = existingContact.clientId;

        // If country code provided, check if it matches
        if (countryCode && existingContact.phoneCountryId !== countryCode) {
          // Different country code, consider it unique
          return { isUnique: true };
        }

        // If excluding a specific client (for updates), check if it's the same client
        if (excludeClientId && clientId === excludeClientId) {
          return { isUnique: true };
        }

        // Get client name for better error message
        const clientDoc = await this.getClientById(clientId);
        return {
          isUnique: false,
          existingClientId: clientId,
          existingClientName: clientDoc?.name || 'Cliente existente',
        };
      }

      return { isUnique: true };
    } catch (error) {
      // Log error silently, fail open to not block user
      void error;
      return { isUnique: true };
    }
  }

  /**
   * Check if document ID (NIT, CC, etc.) is already in use
   * @param documentId Document ID to validate
   * @param excludeClientId Optional client ID to exclude from check (for updates)
   * @returns true if document is available, false if already in use
   */
  static async isDocumentIdUnique(
    documentId: string,
    excludeClientId?: string
  ): Promise<{
    isUnique: boolean;
    existingClientId?: string;
    existingClientName?: string;
  }> {
    try {
      const clientsRef = collection(db, this.CLIENTS_COLLECTION);
      const q = query(clientsRef, where('documentId', '==', documentId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingClient = querySnapshot.docs[0];
        const clientId = existingClient.id;

        // If excluding a specific client (for updates), check if it's the same client
        if (excludeClientId && clientId === excludeClientId) {
          return { isUnique: true };
        }

        const clientData = existingClient.data();
        return {
          isUnique: false,
          existingClientId: clientId,
          existingClientName: clientData.name || 'Cliente existente',
        };
      }

      return { isUnique: true };
    } catch (error) {
      // Log error silently, fail open to not block user
      void error;
      return { isUnique: true };
    }
  }

  /**
   * Validate all unique fields at once
   * @param data Data to validate
   * @param excludeClientId Optional client ID to exclude from checks
   * @returns Object with validation results for each field
   */
  static async validateUniqueFields(data: {
    email?: string;
    phone?: string;
    phoneCountryCode?: string;
    documentId?: string;
    excludeClientId?: string;
  }): Promise<{
    email?: { isUnique: boolean; existingClientName?: string };
    phone?: { isUnique: boolean; existingClientName?: string };
    documentId?: { isUnique: boolean; existingClientName?: string };
  }> {
    const results: {
      email?: { isUnique: boolean; existingClientName?: string };
      phone?: { isUnique: boolean; existingClientName?: string };
      documentId?: { isUnique: boolean; existingClientName?: string };
    } = {};

    // Validate email if provided
    if (data.email) {
      const emailResult = await this.isEmailUnique(data.email, data.excludeClientId);
      results.email = {
        isUnique: emailResult.isUnique,
        existingClientName: emailResult.existingClientName,
      };
    }

    // Validate phone if provided
    if (data.phone) {
      const phoneResult = await this.isPhoneUnique(
        data.phone,
        data.phoneCountryCode,
        data.excludeClientId
      );
      results.phone = {
        isUnique: phoneResult.isUnique,
        existingClientName: phoneResult.existingClientName,
      };
    }

    // Validate document ID if provided
    if (data.documentId) {
      const docResult = await this.isDocumentIdUnique(data.documentId, data.excludeClientId);
      results.documentId = {
        isUnique: docResult.isUnique,
        existingClientName: docResult.existingClientName,
      };
    }

    return results;
  }

  /**
   * Helper method to get client by ID
   */
  private static async getClientById(clientId: string) {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const clientRef = doc(db, this.CLIENTS_COLLECTION, clientId);
      const clientSnap = await getDoc(clientRef);
      return clientSnap.exists() ? clientSnap.data() : null;
    } catch {
      return null;
    }
  }
}
