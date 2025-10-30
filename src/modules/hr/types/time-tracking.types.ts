/**
 * ZADIA OS - Time Tracking Types
 * 
 * Types for employee time tracking and work sessions
 * REGLA #3: Zod validation (schemas en validations/)
 * REGLA #5: <200 líneas
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Work session status
 */
export type WorkSessionStatus = 'active' | 'paused' | 'completed';

/**
 * Work session - represents a single time tracking entry
 */
export interface WorkSession {
  id: string;
  
  // Employee info
  employeeId: string;
  employeeName: string;
  
  // Related entities (optional)
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  workOrderId?: string;
  
  // Time tracking
  startTime: Timestamp;
  endTime?: Timestamp;
  pausedDuration: number;      // Seconds paused
  durationSeconds: number;     // Total active seconds
  
  // Financial
  hourlyRate: number;          // Snapshot of employee hourly rate
  laborCost: number;           // Auto-calculated: (durationSeconds / 3600) * hourlyRate
  
  // Details
  status: WorkSessionStatus;
  activity: string;            // What they were working on
  notes?: string;
  isBillable: boolean;
  
  // Metadata
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Time entry form data
 */
export interface TimeEntryFormData {
  employeeId: string;
  projectId?: string;
  taskId?: string;
  workOrderId?: string;
  startTime: Date;
  endTime?: Date;
  activity: string;
  notes?: string;
  isBillable: boolean;
}

/**
 * Time tracking statistics
 */
export interface TimeTrackingStats {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalCost: number;
  activeSessions: number;
}

/**
 * Work session filters
 */
export interface WorkSessionFilters {
  employeeId?: string;
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: WorkSessionStatus;
  isBillable?: boolean;
}

/**
 * Firestore document structure
 */
export interface WorkSessionDoc {
  employeeId: string;
  employeeName: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  workOrderId?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  pausedDuration: number;
  durationSeconds: number;
  hourlyRate: number;
  laborCost: number;
  status: WorkSessionStatus;
  activity: string;
  notes?: string;
  isBillable: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
