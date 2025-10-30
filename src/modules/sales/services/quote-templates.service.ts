import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { QuoteTemplate, QuoteTemplateFormData } from '../types/quote-template.types';

const COLLECTION_NAME = 'quote-templates';

export const QuoteTemplatesService = {
  /**
   * Get all quote templates
   */
  async getTemplates(): Promise<QuoteTemplate[]> {
    try {
      const templatesRef = collection(db, COLLECTION_NAME);
      const q = query(
        templatesRef,
        where('isActive', '==', true),
        orderBy('usageCount', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuoteTemplate[];
    } catch (error) {
      logger.error('Error fetching quote templates', error as Error, {
        component: 'QuoteTemplatesService'
      });
      throw error;
    }
  },

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string): Promise<QuoteTemplate | null> {
    try {
      const templateRef = doc(db, COLLECTION_NAME, templateId);
      const templateDoc = await getDoc(templateRef);
      
      if (!templateDoc.exists()) {
        return null;
      }
      
      return {
        id: templateDoc.id,
        ...templateDoc.data()
      } as QuoteTemplate;
    } catch (error) {
      logger.error('Error fetching template', error as Error, {
        component: 'QuoteTemplatesService'
      });
      throw error;
    }
  },

  /**
   * Create new template
   */
  async createTemplate(
    data: QuoteTemplateFormData,
    userId: string
  ): Promise<string> {
    try {
      const templatesRef = collection(db, COLLECTION_NAME);
      
      const templateData = {
        ...data,
        createdBy: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        usageCount: 0,
        isActive: true
      };
      
      const docRef = await addDoc(templatesRef, templateData);
      
      logger.info('Quote template created', {
        component: 'QuoteTemplatesService',
        userId
      });
      
      return docRef.id;
    } catch (error) {
      logger.error('Error creating template', error as Error, {
        component: 'QuoteTemplatesService'
      });
      throw error;
    }
  },

  /**
   * Update existing template
   */
  async updateTemplate(
    templateId: string,
    data: Partial<QuoteTemplateFormData>
  ): Promise<void> {
    try {
      const templateRef = doc(db, COLLECTION_NAME, templateId);
      
      await updateDoc(templateRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      
      logger.info('Quote template updated', {
        component: 'QuoteTemplatesService'
      });
    } catch (error) {
      logger.error('Error updating template', error as Error, {
        component: 'QuoteTemplatesService'
      });
      throw error;
    }
  },

  /**
   * Delete template (soft delete)
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const templateRef = doc(db, COLLECTION_NAME, templateId);
      
      await updateDoc(templateRef, {
        isActive: false,
        updatedAt: Timestamp.now()
      });
      
      logger.info('Quote template deleted', {
        component: 'QuoteTemplatesService'
      });
    } catch (error) {
      logger.error('Error deleting template', error as Error, {
        component: 'QuoteTemplatesService'
      });
      throw error;
    }
  },

  /**
   * Increment template usage count
   */
  async incrementUsageCount(templateId: string): Promise<void> {
    try {
      const templateRef = doc(db, COLLECTION_NAME, templateId);
      
      await updateDoc(templateRef, {
        usageCount: increment(1)
      });
      
      logger.info('Template usage count incremented', {
        component: 'QuoteTemplatesService'
      });
    } catch (error) {
      logger.error('Error incrementing usage count', error as Error, {
        component: 'QuoteTemplatesService'
      });
      throw error;
    }
  }
};
