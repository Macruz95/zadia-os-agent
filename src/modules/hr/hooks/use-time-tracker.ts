/**
 * ZADIA OS - Time Tracker Hook
 * 
 * Hook for managing timer state and work sessions
 * REGLA #4: Arquitectura modular - Separar lógica del componente
 * REGLA #5: <200 líneas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { TimeTrackingService } from '../services/time-tracking.service';
import { logger } from '@/lib/logger';

interface UseTimeTrackerProps {
  employeeId: string;
  employeeName: string;
  hourlyRate: number;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
}

export function useTimeTracker(props: UseTimeTrackerProps) {
  const { user } = useAuthState();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activity, setActivity] = useState('');
  const [loading, setLoading] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start timer
   */
  const start = useCallback(async (activityDescription: string) => {
    if (!user) {
      logger.error('User not authenticated');
      return;
    }

    try {
      setLoading(true);

      const sessionId = await TimeTrackingService.startSession({
        employeeId: props.employeeId,
        employeeName: props.employeeName,
        hourlyRate: props.hourlyRate,
        projectId: props.projectId,
        projectName: props.projectName,
        taskId: props.taskId,
        taskName: props.taskName,
        activity: activityDescription,
        isBillable: true,
        userId: user.uid,
      });

      setCurrentSessionId(sessionId);
      setActivity(activityDescription);
      setIsRunning(true);
      setElapsedSeconds(0);
    } catch (error) {
      logger.error('Error starting timer', error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, props]);

  /**
   * Stop timer
   */
  const stop = useCallback(async () => {
    if (!currentSessionId) {
      return;
    }

    try {
      setLoading(true);
      await TimeTrackingService.stopSession(currentSessionId);

      setIsRunning(false);
      setCurrentSessionId(null);
      setActivity('');
      setElapsedSeconds(0);
    } catch (error) {
      logger.error('Error stopping timer', error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentSessionId]);

  /**
   * Timer interval effect
   */
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  /**
   * Format elapsed time as HH:MM:SS
   */
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hours, minutes, secs]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  }, []);

  /**
   * Calculate current cost
   */
  const calculateCurrentCost = useCallback((): number => {
    const hours = elapsedSeconds / 3600;
    return Number((hours * props.hourlyRate).toFixed(2));
  }, [elapsedSeconds, props.hourlyRate]);

  return {
    isRunning,
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    currentCost: calculateCurrentCost(),
    activity,
    loading,
    start,
    stop,
  };
}
