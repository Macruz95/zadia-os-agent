/**
 * ZADIA OS - Phone Codes CRUD Service
 * Handles create, read, update, delete operations
 */

import { collection, doc, getDoc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { PhoneCode, phoneCodeSchema } from '../../types/phone-codes.types';

const COLLECTION = 'phoneCodes';

/**
 * Get phone code by ID
 */
export async function getPhoneCodeById(id: string): Promise<PhoneCode | null> {
  try {
    const phoneCodeRef = doc(db, COLLECTION, id);
    const phoneCodeSnap = await getDoc(phoneCodeRef);

    if (!phoneCodeSnap.exists()) {
      return null;
    }

    const data = phoneCodeSnap.data();
    const phoneCode = {
      id: phoneCodeSnap.id,
      ...data
    };

    return phoneCodeSchema.parse(phoneCode);
  } catch (error) {
    logger.error('Error fetching phone code from Firestore', error as Error, {
      component: 'PhoneCodeCRUD',
      action: 'getPhoneCodeById',
      metadata: { phoneCodeId: id }
    });
    throw new Error(`Error al obtener código telefónico ${id}`);
  }
}

/**
 * Create new phone code
 */
export async function createPhoneCode(phoneCodeData: Omit<PhoneCode, 'id'>): Promise<string> {
  try {
    const validatedData = phoneCodeSchema.omit({ id: true }).parse(phoneCodeData);

    const phoneCodesRef = collection(db, COLLECTION);
    const docRef = await addDoc(phoneCodesRef, {
      ...validatedData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    logger.info('Phone code created successfully', {
      component: 'PhoneCodeCRUD',
      action: 'createPhoneCode',
      metadata: { phoneCodeId: docRef.id }
    });

    return docRef.id;
  } catch (error) {
    logger.error('Error creating phone code', error as Error, {
      component: 'PhoneCodeCRUD',
      action: 'createPhoneCode'
    });
    throw new Error(`Error creating phone code: ${error}`);
  }
}

/**
 * Update phone code
 */
export async function updatePhoneCode(id: string, updates: Partial<Omit<PhoneCode, 'id'>>): Promise<void> {
  try {
    const phoneCodeRef = doc(db, COLLECTION, id);
    await updateDoc(phoneCodeRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });

    logger.info('Phone code updated successfully', {
      component: 'PhoneCodeCRUD',
      action: 'updatePhoneCode',
      metadata: { phoneCodeId: id }
    });
  } catch (error) {
    logger.error('Error updating phone code', error as Error, {
      component: 'PhoneCodeCRUD',
      action: 'updatePhoneCode',
      metadata: { phoneCodeId: id }
    });
    throw new Error(`Error updating phone code: ${error}`);
  }
}

/**
 * Delete phone code (soft delete)
 */
export async function deletePhoneCode(id: string): Promise<void> {
  try {
    const phoneCodeRef = doc(db, COLLECTION, id);
    await updateDoc(phoneCodeRef, {
      isActive: false,
      updatedAt: Timestamp.now()
    });

    logger.info('Phone code deleted successfully', {
      component: 'PhoneCodeCRUD',
      action: 'deletePhoneCode',
      metadata: { phoneCodeId: id }
    });
  } catch (error) {
    logger.error('Error deleting phone code', error as Error, {
      component: 'PhoneCodeCRUD',
      action: 'deletePhoneCode',
      metadata: { phoneCodeId: id }
    });
    throw new Error(`Error deleting phone code: ${error}`);
  }
}
