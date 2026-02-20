/**
 * ZADIA OS - Purchase History Service
 * 
 * Maneja el historial de compras de materias primas
 */

import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { PurchaseHistory } from '../types/inventory-extended.types';

const COLLECTION_NAME = 'purchase-history';

export class PurchaseHistoryService {

    /**
     * Crear registro de compra
     */
    static async createPurchaseRecord(
        data: {
            rawMaterialId: string;
            rawMaterialName: string;
            rawMaterialSku: string;
            supplier: string;
            quantity: number;
            unitOfMeasure: string;
            unitCost: number;
            invoiceNumber?: string;
            referenceDocument?: string;
            notes?: string;
        },
        createdBy: string,
        tenantId: string
    ): Promise<PurchaseHistory> {
        try {
            const now = new Date();
            const totalCost = data.quantity * data.unitCost;

            const purchaseData = {
                tenantId,
                rawMaterialId: data.rawMaterialId,
                rawMaterialName: data.rawMaterialName,
                rawMaterialSku: data.rawMaterialSku,
                supplier: data.supplier,
                quantity: data.quantity,
                unitOfMeasure: data.unitOfMeasure,
                unitCost: data.unitCost,
                totalCost,
                purchaseDate: Timestamp.fromDate(now),
                invoiceNumber: data.invoiceNumber || null,
                referenceDocument: data.referenceDocument || null,
                notes: data.notes || null,
                createdBy,
                createdAt: Timestamp.fromDate(now),
            };

            const docRef = await addDoc(collection(db, COLLECTION_NAME), purchaseData);

            logger.info(`Purchase history created for ${data.rawMaterialName} from ${data.supplier}`, {
                metadata: { tenantId, rawMaterialId: data.rawMaterialId }
            });

            return {
                id: docRef.id,
                ...purchaseData,
                purchaseDate: now,
                createdAt: now,
            } as PurchaseHistory;

        } catch (error) {
            logger.error('Error creating purchase history:', error as Error);
            throw new Error('Error al registrar historial de compra');
        }
    }

    /**
     * Obtener historial de compras de un material
     */
    static async getPurchaseHistory(
        rawMaterialId: string,
        tenantId: string,
        limitCount: number = 50
    ): Promise<PurchaseHistory[]> {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where('tenantId', '==', tenantId),
                where('rawMaterialId', '==', rawMaterialId),
                orderBy('purchaseDate', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                purchaseDate: doc.data().purchaseDate?.toDate(),
                createdAt: doc.data().createdAt?.toDate(),
            })) as PurchaseHistory[];

        } catch (error) {
            logger.error('Error fetching purchase history:', error as Error);
            return [];
        }
    }

    /**
     * Obtener compras recientes (todas las materias)
     */
    static async getRecentPurchases(
        tenantId: string,
        limitCount: number = 20
    ): Promise<PurchaseHistory[]> {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where('tenantId', '==', tenantId),
                orderBy('purchaseDate', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                purchaseDate: doc.data().purchaseDate?.toDate(),
                createdAt: doc.data().createdAt?.toDate(),
            })) as PurchaseHistory[];

        } catch (error) {
            logger.error('Error fetching recent purchases:', error as Error);
            return [];
        }
    }
}
