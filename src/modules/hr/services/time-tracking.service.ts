/**
 * ZADIA OS - Time Tracking Service
 * 
 * Service for managing work sessions and time tracking
 * REGLA #1: Datos reales - Todo conectado a Firebase
 * REGLA #4: Arquitectura modular
 * REGLA #5: <200 líneas
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  DocumentSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { WorkSession, WorkSessionDoc, WorkSessionFilters, TimeTrackingStats } from '../types/time-tracking.types';
import { CreateWorkSessionSchema } from '../validations/time-tracking.validation';
import { logger } from '@/lib/logger';

const COLLECTION = 'workSessions';

/**
 * Convert Firestore document to WorkSession
 */
function docToWorkSession(docSnap: DocumentSnapshot): WorkSession {
  const data = docSnap.data() as WorkSessionDoc;
  return {
    id: docSnap.id,
    ...data,
  };
}

/**
 * Calculate labor cost from duration and hourly rate
 */
function calculateLaborCost(durationSeconds: number, hourlyRate: number): number {
  const hours = durationSeconds / 3600;
  return Number((hours * hourlyRate).toFixed(2));
}

export const TimeTrackingService = {
  /**
   * Start a new work session
   */
  async startSession(data: {
    employeeId: string;
    employeeName: string;
    hourlyRate: number;
    projectId?: string;
    projectName?: string;
    taskId?: string;
    taskName?: string;
    workOrderId?: string;
    activity: string;
    notes?: string;
    isBillable?: boolean;
    userId: string;
  }): Promise<string> {
    try {
      // Validate with Zod (REGLA #3)
      const validated = CreateWorkSessionSchema.parse(data);

      const sessionData: Partial<WorkSessionDoc> = {
        employeeId: validated.employeeId,
        employeeName: validated.employeeName,
        projectId: validated.projectId,
        projectName: validated.projectName,
        taskId: validated.taskId,
        taskName: validated.taskName,
        workOrderId: validated.workOrderId,
        startTime: Timestamp.now(),
        pausedDuration: 0,
        durationSeconds: 0,
        hourlyRate: validated.hourlyRate,
        laborCost: 0,
        status: 'active',
        activity: validated.activity,
        notes: validated.notes,
        isBillable: validated.isBillable ?? true,
        createdBy: data.userId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(db, COLLECTION), sessionData);
      logger.info('Work session started');
      return docRef.id;
    } catch (error) {
      logger.error('Error starting work session', error as Error);
      throw error;
    }
  },

  /**
   * Stop/Complete a work session
   */
  async stopSession(sessionId: string): Promise<void> {
    try {
      const sessionRef = doc(db, COLLECTION, sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        throw new Error('Session not found');
      }

      const session = sessionSnap.data() as WorkSessionDoc;
      const endTime = Timestamp.now();
      const durationSeconds = endTime.seconds - session.startTime.seconds - session.pausedDuration;
      const laborCost = calculateLaborCost(durationSeconds, session.hourlyRate);

      await updateDoc(sessionRef, {
        endTime,
        durationSeconds,
        laborCost,
        status: 'completed',
        updatedAt: serverTimestamp(),
      });

      logger.info('Work session stopped');
    } catch (error) {
      logger.error('Error stopping work session', error as Error);
      throw error;
    }
  },

  /**
   * Get work sessions with filters
   */
  async getSessions(filters: WorkSessionFilters = {}): Promise<WorkSession[]> {
    try {
      // Build query with where clauses first, then orderBy
      const constraints: QueryConstraint[] = [];

      if (filters.employeeId) {
        constraints.push(where('employeeId', '==', filters.employeeId));
      }
      if (filters.projectId) {
        constraints.push(where('projectId', '==', filters.projectId));
      }
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.isBillable !== undefined) {
        constraints.push(where('isBillable', '==', filters.isBillable));
      }

      // Add orderBy at the end
      constraints.push(orderBy('startTime', 'desc'));

      const q = query(collection(db, COLLECTION), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docToWorkSession);
    } catch (error) {
      logger.error('Error fetching work sessions', error as Error);
      throw error;
    }
  },

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: string): Promise<WorkSession | null> {
    try {
      const docSnap = await getDoc(doc(db, COLLECTION, sessionId));
      return docSnap.exists() ? docToWorkSession(docSnap) : null;
    } catch (error) {
      logger.error('Error fetching session', error as Error);
      throw error;
    }
  },

  /**
   * Calculate time tracking statistics
   */
  async getStats(filters: WorkSessionFilters = {}): Promise<TimeTrackingStats> {
    try {
      const sessions = await this.getSessions(filters);

      const stats: TimeTrackingStats = {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        totalCost: 0,
        activeSessions: 0,
      };

      sessions.forEach(session => {
        const hours = session.durationSeconds / 3600;

        stats.totalHours += hours;
        stats.totalCost += session.laborCost;

        if (session.status === 'active') {
          stats.activeSessions++;
        }

        if (session.isBillable) {
          stats.billableHours += hours;
        } else {
          stats.nonBillableHours += hours;
        }
      });

      return stats;
    } catch (error) {
      logger.error('Error calculating stats', error as Error);
      throw error;
    }
  },

  /**
   * Delete a work session (admin only)
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, sessionId));
      logger.info('Work session deleted');
    } catch (error) {
      logger.error('Error deleting work session', error as Error);
      throw error;
    }
  },
};
