/**
 * ZADIA OS - HR Actions Hook
 * 
 * Integra acciones de recursos humanos con el Event Bus central
 * Cada acción emite eventos que los agentes procesan automáticamente
 */

'use client';

import { useCallback } from 'react';
import { EventBus } from '@/lib/events';
import { logger } from '@/lib/logger';

interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  managerId?: string;
  managerName?: string;
  hireDate?: string;
  salary?: number;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
  [key: string]: unknown;
}

interface TimeOffData {
  id?: string;
  employeeId: string;
  employeeName: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

interface PerformanceData {
  employeeId: string;
  employeeName: string;
  period: string;
  rating: number;
  strengths?: string[];
  improvements?: string[];
  goals?: string[];
  reviewerId?: string;
  reviewerName?: string;
}

export function useHRActions() {
  
  // ═══════════════════════════════════════════════════════════════════════
  // CREAR EMPLEADO
  // ═══════════════════════════════════════════════════════════════════════
  const createEmployee = useCallback(async (data: Omit<EmployeeData, 'id'> & { id?: string }) => {
    const employeeId = data.id || `emp-${Date.now()}`;
    const fullName = `${data.firstName} ${data.lastName}`;
    
    await EventBus.emit('employee:created', {
      employeeId,
      employeeName: fullName,
      email: data.email,
      department: data.department,
      position: data.position,
      managerId: data.managerId,
      managerName: data.managerName,
      hireDate: data.hireDate,
      status: 'active'
    }, { source: 'hr-module' });

    logger.info('✅ Employee created', { employeeId, name: fullName });
    return employeeId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // ACTUALIZAR EMPLEADO
  // ═══════════════════════════════════════════════════════════════════════
  const updateEmployee = useCallback(async (employeeId: string, data: Partial<EmployeeData>) => {
    const fullName = data.firstName && data.lastName 
      ? `${data.firstName} ${data.lastName}` 
      : undefined;
    
    await EventBus.emit('employee:updated', {
      employeeId,
      employeeName: fullName,
      changes: data
    }, { source: 'hr-module' });

    logger.info('✅ Employee updated', { employeeId });
    return employeeId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // PROMOCIÓN
  // ═══════════════════════════════════════════════════════════════════════
  const promoteEmployee = useCallback(async (
    employeeId: string,
    employeeName: string,
    newPosition: string,
    newSalary?: number,
    effectiveDate?: string
  ) => {
    await EventBus.emit('employee:promoted', {
      employeeId,
      employeeName,
      newPosition,
      newSalary,
      effectiveDate: effectiveDate || new Date().toISOString(),
      promotedAt: new Date().toISOString()
    }, { source: 'hr-module' });

    logger.info('🎉 Employee promoted', { employeeId, newPosition });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // CAMBIO DE DEPARTAMENTO
  // ═══════════════════════════════════════════════════════════════════════
  const transferEmployee = useCallback(async (
    employeeId: string,
    employeeName: string,
    fromDepartment: string,
    toDepartment: string,
    reason?: string
  ) => {
    await EventBus.emit('employee:transferred', {
      employeeId,
      employeeName,
      fromDepartment,
      toDepartment,
      reason,
      transferredAt: new Date().toISOString()
    }, { source: 'hr-module' });

    logger.info('🔄 Employee transferred', { employeeId, toDepartment });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // SOLICITUD DE TIEMPO LIBRE
  // ═══════════════════════════════════════════════════════════════════════
  const requestTimeOff = useCallback(async (data: TimeOffData) => {
    const requestId = data.id || `timeoff-${Date.now()}`;
    
    await EventBus.emit('employee:timeoff_requested', {
      requestId,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
      reason: data.reason,
      status: 'pending'
    }, { source: 'hr-module' });

    logger.info('📅 Time off requested', { requestId, employeeId: data.employeeId });
    return requestId;
  }, []);

  const approveTimeOff = useCallback(async (
    requestId: string,
    employeeId: string,
    employeeName: string,
    approverId: string,
    approverName: string
  ) => {
    await EventBus.emit('employee:timeoff_approved', {
      requestId,
      employeeId,
      employeeName,
      approverId,
      approverName,
      status: 'approved',
      approvedAt: new Date().toISOString()
    }, { source: 'hr-module' });

    logger.info('✅ Time off approved', { requestId });
  }, []);

  const rejectTimeOff = useCallback(async (
    requestId: string,
    employeeId: string,
    employeeName: string,
    reason: string
  ) => {
    await EventBus.emit('employee:timeoff_rejected', {
      requestId,
      employeeId,
      employeeName,
      reason,
      status: 'rejected',
      rejectedAt: new Date().toISOString()
    }, { source: 'hr-module' });

    logger.info('❌ Time off rejected', { requestId, reason });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // EVALUACIÓN DE DESEMPEÑO
  // ═══════════════════════════════════════════════════════════════════════
  const submitPerformanceReview = useCallback(async (data: PerformanceData) => {
    const reviewId = `review-${Date.now()}`;
    
    await EventBus.emit('employee:performance_reviewed', {
      reviewId,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      period: data.period,
      rating: data.rating,
      strengths: data.strengths,
      improvements: data.improvements,
      goals: data.goals,
      reviewerId: data.reviewerId,
      reviewerName: data.reviewerName,
      submittedAt: new Date().toISOString()
    }, { source: 'hr-module' });

    logger.info('📊 Performance review submitted', { reviewId, employeeId: data.employeeId });
    return reviewId;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // TERMINACIÓN
  // ═══════════════════════════════════════════════════════════════════════
  const terminateEmployee = useCallback(async (
    employeeId: string,
    employeeName: string,
    reason: string,
    type: 'resignation' | 'termination' | 'retirement' | 'layoff',
    lastDay: string
  ) => {
    await EventBus.emit('employee:terminated', {
      employeeId,
      employeeName,
      reason,
      terminationType: type,
      lastDay,
      status: 'terminated',
      terminatedAt: new Date().toISOString()
    }, { source: 'hr-module' });

    logger.info('👋 Employee terminated', { employeeId, type });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // ONBOARDING
  // ═══════════════════════════════════════════════════════════════════════
  const startOnboarding = useCallback(async (
    employeeId: string,
    employeeName: string,
    startDate: string,
    buddyId?: string,
    buddyName?: string
  ) => {
    await EventBus.emit('employee:onboarding_started', {
      employeeId,
      employeeName,
      startDate,
      buddyId,
      buddyName,
      startedAt: new Date().toISOString()
    }, { source: 'hr-module' });

    logger.info('🚀 Onboarding started', { employeeId });
  }, []);

  const completeOnboarding = useCallback(async (
    employeeId: string,
    employeeName: string
  ) => {
    await EventBus.emit('employee:onboarding_completed', {
      employeeId,
      employeeName,
      completedAt: new Date().toISOString()
    }, { source: 'hr-module' });

    logger.info('✅ Onboarding completed', { employeeId });
  }, []);

  return {
    // CRUD
    createEmployee,
    updateEmployee,
    
    // Carrera
    promoteEmployee,
    transferEmployee,
    
    // Tiempo libre
    requestTimeOff,
    approveTimeOff,
    rejectTimeOff,
    
    // Desempeño
    submitPerformanceReview,
    
    // Terminación
    terminateEmployee,
    
    // Onboarding
    startOnboarding,
    completeOnboarding
  };
}
