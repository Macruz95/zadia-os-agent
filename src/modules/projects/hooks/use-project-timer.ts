/**
 * ZADIA OS - Project Timer Hook
 * 
 * Maneja toda la lógica del timer de proyectos:
 * - Control de timer (start/pause)
 * - Escucha de sesiones de trabajo en tiempo real
 * - CRUD de sesiones
 * - Cálculos de tiempo y costos
 * 
 * Rule #1: TypeScript strict
 * Rule #5: Single responsibility
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

// Types
interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
}

export interface WorkSession {
  id: string;
  startTime: FirestoreTimestamp | Date | null;
  endTime: FirestoreTimestamp | Date | null;
  durationSeconds: number;
  cost: number;
}

interface ProjectTimerConfig {
  projectId: string;
  hourlyRate: number;
  hasStarted: boolean;
}

interface UseProjectTimerReturn {
  // Timer state
  isTimerActive: boolean;
  elapsedTime: number;
  // Sessions data
  workSessions: WorkSession[];
  totalHours: number;
  totalCost: number;
  // Actions
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  // Utilities
  formatTime: (ms: number) => string;
  formatDate: (date: FirestoreTimestamp | Date | null | undefined) => string;
}

/**
 * Hook para manejar el timer y sesiones de trabajo de un proyecto
 */
export function useProjectTimer(config: ProjectTimerConfig): UseProjectTimerReturn {
  const { projectId, hourlyRate, hasStarted } = config;
  
  // Timer state
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Sessions data
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);

  // ============ LISTENERS ============

  // Listen to work sessions in real-time
  useEffect(() => {
    const sessionsRef = collection(db, 'projects', projectId, 'workSessions');
    const q = query(sessionsRef, orderBy('startTime', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const sessions = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as WorkSession));
        setWorkSessions(sessions);
      },
      (error) => {
        logger.error('Error listening to work sessions', error);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  // Timer interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerActive) {
      const start = timerStartTime || Date.now() - elapsedTime;
      if (!timerStartTime) setTimerStartTime(start);
      
      interval = setInterval(() => {
        setElapsedTime(Date.now() - start);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timerStartTime, elapsedTime]);

  // ============ ACTIONS ============

  const startTimer = useCallback(async () => {
    // If project hasn't started, mark it as started
    if (!hasStarted) {
      try {
        await updateDoc(doc(db, 'projects', projectId), {
          startDate: new Date(),
          status: 'in-progress'
        });
        toast.success('¡Proyecto iniciado!');
      } catch (error) {
        logger.error('Error starting project', error as Error);
        toast.error('Error al iniciar el proyecto');
        return;
      }
    }
    setIsTimerActive(true);
  }, [projectId, hasStarted]);

  const pauseTimer = useCallback(async () => {
    setIsTimerActive(false);
    const endTime = new Date();
    const durationSeconds = Math.round(elapsedTime / 1000);

    // Don't save very short sessions
    if (durationSeconds < 1) {
      toast.info('Sesión muy corta, no se guardará');
      setElapsedTime(0);
      setTimerStartTime(null);
      return;
    }

    // Calculate cost based on hourly rate
    const rate = hourlyRate || 15; // Default $15/hour
    const sessionCost = (durationSeconds / 3600) * rate;

    try {
      await addDoc(collection(db, 'projects', projectId, 'workSessions'), {
        startTime: new Date(timerStartTime!),
        endTime,
        durationSeconds,
        cost: sessionCost,
        createdAt: new Date()
      });

      toast.success('Sesión de trabajo guardada');
      setElapsedTime(0);
      setTimerStartTime(null);
    } catch (error) {
      logger.error('Error saving work session', error as Error);
      toast.error('Error al guardar la sesión');
    }
  }, [projectId, hourlyRate, elapsedTime, timerStartTime]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId, 'workSessions', sessionId));
      toast.success('Sesión eliminada');
    } catch (error) {
      logger.error('Error deleting session', error as Error);
      toast.error('Error al eliminar la sesión');
    }
  }, [projectId]);

  // ============ UTILITIES ============

  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const formatDate = useCallback((date: FirestoreTimestamp | Date | null | undefined): string => {
    if (!date) return 'N/A';
    if (typeof date === 'object' && 'seconds' in date) {
      return new Date(date.seconds * 1000).toLocaleDateString('es-MX');
    }
    if (date instanceof Date) {
      return date.toLocaleDateString('es-MX');
    }
    return 'N/A';
  }, []);

  // ============ COMPUTED VALUES ============

  const totalHours = workSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600;
  const totalCost = workSessions.reduce((sum, s) => sum + s.cost, 0);

  return {
    // Timer state
    isTimerActive,
    elapsedTime,
    // Sessions data
    workSessions,
    totalHours,
    totalCost,
    // Actions
    startTimer,
    pauseTimer,
    deleteSession,
    // Utilities
    formatTime,
    formatDate
  };
}
