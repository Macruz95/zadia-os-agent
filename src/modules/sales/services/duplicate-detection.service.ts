/**
 * ZADIA OS - Duplicate Detection Service
 * 
 * Detects potential duplicate clients before conversion
 * Following ZADIA Rule 1: Real data from Firebase
 * Following ZADIA Rule 5: Max 200 lines per file
 */

import { 
  collection, 
  query, 
  where, 
  getDocs,
  or,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { 
  DuplicateSearchInput, 
  DuplicateClient,
  duplicateClientSchema 
} from '../validations/lead-conversion.schema';

const CLIENTS_COLLECTION = 'clients';

/**
 * Calculate similarity score between strings (0-100)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 100;
  
  // Levenshtein distance simplified
  const longer = s1.length > s2.length ? s1 : s2;
  
  if (longer.length === 0) return 100;
  
  const editDistance = levenshteinDistance(s1, s2);
  return Math.round(((longer.length - editDistance) / longer.length) * 100);
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

export class DuplicateDetectionService {
  /**
   * Search for potential duplicate clients
   */
  static async findDuplicates(
    searchData: DuplicateSearchInput
  ): Promise<DuplicateClient[]> {
    try {
      logger.info('Searching for duplicate clients');

      const clientsRef = collection(db, CLIENTS_COLLECTION);
      
      // Build query to find exact matches
      const q = query(
        clientsRef,
        or(
          where('email', '==', searchData.email),
          where('phone', '==', searchData.phone)
        )
      );

      const snapshot = await getDocs(q);
      const duplicates: DuplicateClient[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        let matchScore = 0;
        const matchReasons: string[] = [];

        // Email exact match
        if (data.email === searchData.email) {
          matchScore += 50;
          matchReasons.push('Email coincide exactamente');
        }

        // Phone exact match
        if (data.phone === searchData.phone) {
          matchScore += 50;
          matchReasons.push('Teléfono coincide exactamente');
        }

        // Name similarity (if provided)
        if (searchData.fullName && data.name) {
          const nameSimilarity = calculateSimilarity(searchData.fullName, data.name);
          if (nameSimilarity > 80) {
            matchScore = Math.max(matchScore, 70);
            matchReasons.push(`Nombre similar (${nameSimilarity}%)`);
          }
        }

        // Entity name similarity (if provided)
        if (searchData.entityName && data.name) {
          const entitySimilarity = calculateSimilarity(searchData.entityName, data.name);
          if (entitySimilarity > 80) {
            matchScore = Math.max(matchScore, 70);
            matchReasons.push(`Razón social similar (${entitySimilarity}%)`);
          }
        }

        if (matchScore > 0) {
          const duplicate = duplicateClientSchema.parse({
            id: doc.id,
            name: data.name,
            email: data.email || '',
            phone: data.phone || '',
            clientType: data.clientType,
            status: data.status,
            createdAt: data.createdAt?.toDate() || new Date(),
            matchScore,
            matchReason: matchReasons.join(', '),
          });

          duplicates.push(duplicate);
        }
      });

      // Sort by match score descending
      duplicates.sort((a, b) => b.matchScore - a.matchScore);

      logger.info('Duplicate search completed');

      return duplicates;

    } catch (error) {
      logger.error('Error searching for duplicates', error as Error);
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    try {
      const clientsRef = collection(db, CLIENTS_COLLECTION);
      const q = query(clientsRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      logger.error('Error checking email existence', error as Error);
      return false;
    }
  }

  /**
   * Check if phone exists
   */
  static async phoneExists(phone: string): Promise<boolean> {
    try {
      const clientsRef = collection(db, CLIENTS_COLLECTION);
      const q = query(clientsRef, where('phone', '==', phone));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      logger.error('Error checking phone existence', error as Error);
      return false;
    }
  }
}
