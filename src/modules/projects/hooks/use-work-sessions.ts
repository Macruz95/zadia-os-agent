/**
 * ZADIA OS - Use Work Sessions Hook
 * Hook para gestionar sesiones de trabajo
 * Rule #4: Modular React hooks
 * Rule #5: Max 200 lines per file
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { WorkSession } from '../types/projects.types';
import {
  startWorkSession,
  endWorkSession,
  deleteWorkSession,
} from '../services/helpers/project-work-sessions.service';
import type { StartWorkSessionInput } from '../validations/project-extensions.validation';

interface UseWorkSessionsReturn {
  sessions: WorkSession[];
  activeSession: WorkSession | null;
  loading: boolean;
  error: string | null;
  startSession: (userId: string, userName: string, hourlyRate: number, notes?: string) => Promise<void>;
  stopSession: (sessionId: string, notes?: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  totalHours: number;
  totalCost: number;
}

/**
 * Hook para gestionar sesiones de trabajo de un proyecto
 */
export function useWorkSessions(projectId: string): UseWorkSessionsReturn {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener para sesiones del proyecto
  useEffect(() => {
    if (!projectId) return;

    const q = query(
      collection(db, 'workSessions'),
      where('projectId', '==', projectId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sessionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as WorkSession[];

        // Ordenar por fecha más reciente
        sessionsData.sort((a, b) => 
          b.startTime.toMillis() - a.startTime.toMillis()
        );

        setSessions(sessionsData);

        // Buscar sesión activa (sin endTime)
        const active = sessionsData.find(s => !s.endTime);
        setActiveSession(active || null);

        setLoading(false);
        setError(null);
      },
      (err) => {
        logger.error('Error listening to work sessions', err);
        setError('Error al cargar sesiones');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  // Calcular totales
  const totalHours = sessions.reduce(
    (acc, session) => acc + (session.durationSeconds / 3600),
    0
  );

  const totalCost = sessions.reduce(
    (acc, session) => acc + (session.totalCost || 0),
    0
  );

  // Iniciar sesión
  const startSession = useCallback(
    async (userId: string, userName: string, hourlyRate: number, notes?: string) => {
      try {
        const input: StartWorkSessionInput = {
          projectId,
          userId,
          userName,
          hourlyRate,
          notes,
        };

        await startWorkSession(input);
        toast.success('Sesión de trabajo iniciada');
      } catch (err) {
        logger.error('Error starting work session', err as Error);
        toast.error('Error al iniciar sesión');
        throw err;
      }
    },
    [projectId]
  );

  // Detener sesión
  const stopSession = useCallback(
    async (sessionId: string, notes?: string) => {
      try {
        await endWorkSession({ sessionId, notes });
        toast.success('Sesión de trabajo finalizada');
      } catch (err) {
        logger.error('Error stopping work session', err as Error);
        toast.error('Error al finalizar sesión');
        throw err;
      }
    },
    []
  );

  // Eliminar sesión
  const deleteSessionHandler = useCallback(
    async (sessionId: string) => {
      try {
        await deleteWorkSession(sessionId);
        toast.success('Sesión eliminada');
      } catch (err) {
        logger.error('Error deleting work session', err as Error);
        toast.error('Error al eliminar sesión');
        throw err;
      }
    },
    []
  );

  return {
    sessions,
    activeSession,
    loading,
    error,
    startSession,
    stopSession,
    deleteSession: deleteSessionHandler,
    totalHours,
    totalCost,
  };
}

/**
 * Hook para timer de sesión activa
 */
export function useWorkSessionTimer(activeSession: WorkSession | null) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    // Calcular tiempo inicial
    const startTime = activeSession.startTime.toMillis();
    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(elapsed);
    };

    // Actualizar inmediatamente
    updateElapsed();

    // Actualizar cada segundo
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
  };
}
