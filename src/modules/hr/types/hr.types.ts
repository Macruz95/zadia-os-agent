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
  userId?: string;             // Para aislamiento de datos por usuario
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
  carpenter: { label: 'Carpintero', icon: 'Hammer' },
  assistant: { label: 'Ayudante', icon: 'HandHelping' },
  designer: { label: 'Diseñador', icon: 'Pencil' },
  installer: { label: 'Instalador', icon: 'Wrench' },
  supervisor: { label: 'Supervisor', icon: 'UserCheck' },
  manager: { label: 'Gerente', icon: 'Briefcase' },
  sales: { label: 'Ventas', icon: 'DollarSign' },
  admin: { label: 'Administrativo', icon: 'ClipboardList' },
  other: { label: 'Otro', icon: 'User' },
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
  morning: { label: 'Mañana', icon: 'Sunrise' },
  afternoon: { label: 'Tarde', icon: 'Sun' },
  night: { label: 'Noche', icon: 'Moon' },
  'full-day': { label: 'Día Completo', icon: 'Clock' },
};

/**
 * Work Period (Temporada de Trabajo)
 */
export interface WorkPeriod {
  id: string;
  employeeId: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  status: 'active' | 'completed';
  dailyRate: number;
  currency: string; // Always 'USD' per user request

  // Calculated fields
  totalDays: number;
  totalSalary: number;
  totalLoans: number;
  totalBonuses: number;      // NEW: Total de bonificaciones
  carriedDebt: number;       // NEW: Deuda transferida de temporada anterior
  netPayable: number;

  // Debt tracking
  remainingDebt: number;     // NEW: Deuda que queda al finalizar (para transferir)
  previousPeriodId?: string; // NEW: Referencia a la temporada anterior (si heredó deuda)

  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId?: string;           // NEW: Para aislamiento de datos
}

/**
 * Loan (Préstamo/Adelanto)
 */
export interface Loan {
  id: string;
  employeeId: string;
  workPeriodId: string;
  amount: number;
  remainingBalance: number;    // Saldo pendiente
  date: Timestamp;
  reason: string;
  status: 'pending' | 'deducted' | 'paid' | 'partial' | 'carried'; // 'partial' = parcialmente pagado
  approvedBy: string;
  createdAt: Timestamp;
}

/**
 * Loan Payment (Abono a Préstamo)
 */
export interface LoanPayment {
  id: string;
  loanId: string;
  employeeId: string;
  workPeriodId: string;        // Período en que se hizo el abono
  amount: number;              // Monto del abono
  paymentType: 'deduction' | 'cash' | 'transfer'; // Tipo: descuento nómina, efectivo, transferencia
  balanceBefore: number;       // Saldo antes del abono
  balanceAfter: number;        // Saldo después del abono
  notes?: string;
  processedBy: string;
  createdAt: Timestamp;
}

/**
 * Bonus Type (Tipo de Bonificación)
 */
export type BonusType = 
  | 'gratification'    // Gratificación
  | 'christmas'        // Aguinaldo
  | 'performance'      // Bono por desempeño
  | 'overtime'         // Horas extra
  | 'travel'           // Viáticos
  | 'other';           // Otro

/**
 * Bonus (Bonificación/Aguinaldo/Gratificación)
 */
export interface Bonus {
  id: string;
  employeeId: string;
  workPeriodId: string;
  type: BonusType;
  amount: number;
  date: Timestamp;
  description: string;
  approvedBy: string;
  createdAt: Timestamp;
}

/**
 * Bonus Type Config for UI
 */
export const BONUS_TYPE_CONFIG: Record<BonusType, { label: string; icon: string }> = {
  gratification: { label: 'Gratificación', icon: 'Gift' },
  christmas: { label: 'Aguinaldo', icon: 'TreePine' },
  performance: { label: 'Bono Desempeño', icon: 'Award' },
  overtime: { label: 'Horas Extra', icon: 'Clock' },
  travel: { label: 'Viáticos', icon: 'Car' },
  other: { label: 'Otro', icon: 'Plus' },
};
