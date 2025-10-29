/**
 * ZADIA OS - RRHH Types
 * 
 * Type definitions for Human Resources module
 * REGLA 5: <300 líneas
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Employee Position Types
 */
export type EmployeePosition =
  | 'carpenter'          // Carpintero
  | 'assistant'          // Ayudante
  | 'designer'           // Diseñador
  | 'installer'          // Instalador
  | 'supervisor'         // Supervisor
  | 'manager'            // Gerente
  | 'sales'              // Ventas
  | 'admin'              // Administrativo
  | 'other';             // Otro

/**
 * Employee Status
 */
export type EmployeeStatus =
  | 'active'             // Activo
  | 'inactive'           // Inactivo
  | 'suspended'          // Suspendido
  | 'vacation';          // De vacaciones

/**
 * Contract Type
 */
export type ContractType =
  | 'permanent'          // Indefinido
  | 'temporary'          // Temporal
  | 'contractor'         // Por contrato
  | 'part-time';         // Medio tiempo

/**
 * Shift Type
 */
export type ShiftType =
  | 'morning'            // Mañana
  | 'afternoon'          // Tarde
  | 'night'              // Noche
  | 'full-day';          // Día completo

/**
 * Employee Entity
 */
export interface Employee {
  id: string;
  
  // Personal Info
  firstName: string;
  lastName: string;
  email?: string;              // Opcional para empleados temporales
  phone: string;
  phoneCountryId?: string;     // Código de país para el teléfono (SV, NI, etc.)
  address: string;
  birthDate: Timestamp;
  
  // Identification - Opcional para empleados extranjeros temporales
  nationalId?: string;          // DUI (SV), Cédula (NI), etc.
  taxId?: string;               // NIT
  socialSecurityNumber?: string;
  
  // Employment Info
  position: EmployeePosition;
  department: string;
  status: EmployeeStatus;
  contractType: ContractType;
  
  // Dates
  hireDate: Timestamp;
  terminationDate?: Timestamp;
  
  // Compensation
  salary: number;
  currency: string;
  paymentFrequency: 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactPhoneCountryId?: string;
  emergencyContactRelation?: string;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

/**
 * Shift Configuration
 */
export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  
  // Shift Details
  type: ShiftType;
  startTime: string;           // HH:mm format
  endTime: string;             // HH:mm format
  daysOfWeek: number[];        // 0=Sunday, 6=Saturday
  
  // Active period
  startDate: Timestamp;
  endDate?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Attendance Record
 */
export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  
  // Attendance Details
  date: Timestamp;
  checkIn?: Timestamp;
  checkOut?: Timestamp;
  
  // Hours
  scheduledHours: number;
  workedHours: number;
  overtimeHours: number;
  
  // Status
  status: 'present' | 'absent' | 'late' | 'half-day' | 'overtime';
  notes?: string;
  
  // Metadata
  recordedAt: Timestamp;
  recordedBy: string;
}

/**
 * Payroll Record
 */
export interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  
  // Period
  periodStart: Timestamp;
  periodEnd: Timestamp;
  paymentDate: Timestamp;
  
  // Salary
  baseSalary: number;
  overtimePay: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  currency: string;
  
  // Hours
  regularHours: number;
  overtimeHours: number;
  
  // Status
  status: 'pending' | 'approved' | 'paid';
  approvedBy?: string;
  approvedAt?: Timestamp;
  paidAt?: Timestamp;
  
  // Payment Method
  paymentMethod: 'cash' | 'bank-transfer' | 'check';
  reference?: string;
  
  // Metadata
  createdAt: Timestamp;
  createdBy: string;
}

/**
 * Leave Request (Vacations, Permits)
 */
export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  
  // Request Details
  type: 'vacation' | 'sick' | 'personal' | 'unpaid';
  startDate: Timestamp;
  endDate: Timestamp;
  days: number;
  
  // Status
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  
  // Approval
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  
  // Metadata
  requestedAt: Timestamp;
}

/**
 * Employee Stats
 */
export interface EmployeeStats {
  totalActive: number;
  totalInactive: number;
  totalOnVacation: number;
  totalSuspended: number;
  byPosition: Record<EmployeePosition, number>;
  byDepartment: Record<string, number>;
}

/**
 * Config objects for UI
 */
export const POSITION_CONFIG: Record<EmployeePosition, { label: string; icon: string }> = {
  carpenter: { label: 'Carpintero', icon: '🔨' },
  assistant: { label: 'Ayudante', icon: '🤝' },
  designer: { label: 'Diseñador', icon: '✏️' },
  installer: { label: 'Instalador', icon: '🔧' },
  supervisor: { label: 'Supervisor', icon: '👔' },
  manager: { label: 'Gerente', icon: '💼' },
  sales: { label: 'Ventas', icon: '💰' },
  admin: { label: 'Administrativo', icon: '📋' },
  other: { label: 'Otro', icon: '👤' },
};

export const STATUS_CONFIG: Record<EmployeeStatus, { 
  label: string; 
  variant: 'default' | 'secondary' | 'destructive' | 'outline' 
}> = {
  active: { label: 'Activo', variant: 'default' },
  inactive: { label: 'Inactivo', variant: 'secondary' },
  suspended: { label: 'Suspendido', variant: 'destructive' },
  vacation: { label: 'De Vacaciones', variant: 'outline' },
};

export const CONTRACT_TYPE_CONFIG: Record<ContractType, string> = {
  permanent: 'Indefinido',
  temporary: 'Temporal',
  contractor: 'Por Contrato',
  'part-time': 'Medio Tiempo',
};

export const SHIFT_TYPE_CONFIG: Record<ShiftType, { label: string; icon: string }> = {
  morning: { label: 'Mañana', icon: '🌅' },
  afternoon: { label: 'Tarde', icon: '☀️' },
  night: { label: 'Noche', icon: '🌙' },
  'full-day': { label: 'Día Completo', icon: '⏰' },
};
