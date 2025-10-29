/**
 * ZADIA OS - RRHH Validations
 * 
 * Zod schemas for Human Resources forms
 * REGLA 3: Zod validation
 * REGLA 5: <300 líneas
 */

import { z } from 'zod';

/**
 * Employee Form Schema
 */
export const employeeFormSchema = z.object({
  // Personal Info
  firstName: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  lastName: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(8, 'Teléfono inválido').max(20),
  phoneCountryId: z.string().optional(),
  address: z.string().min(5, 'Dirección inválida'),
  birthDate: z.date({
    message: 'Fecha de nacimiento requerida',
  }),
  
  // Identification - Opcional para empleados temporales de otros países
  nationalId: z.string().optional(),
  taxId: z.string().optional(),
  socialSecurityNumber: z.string().optional(),
  
  // Employment Info
  position: z.enum([
    'carpenter',
    'assistant',
    'designer',
    'installer',
    'supervisor',
    'manager',
    'sales',
    'admin',
    'other',
  ]),
  department: z.string().min(2, 'Departamento requerido'),
  status: z.enum(['active', 'inactive', 'suspended', 'vacation']),
  contractType: z.enum(['permanent', 'temporary', 'contractor', 'part-time']),
  
  // Dates
  hireDate: z.date({
    message: 'Fecha de contratación requerida',
  }),
  terminationDate: z.date().optional(),
  
  // Compensation
  salary: z.number().positive('Salario debe ser positivo'),
  currency: z.string().default('USD'),
  paymentFrequency: z.enum(['hourly', 'daily', 'weekly', 'biweekly', 'monthly']),
  
  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactPhoneCountryId: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

/**
 * Shift Form Schema
 */
export const shiftFormSchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  type: z.enum(['morning', 'afternoon', 'night', 'full-day']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:mm'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:mm'),
  daysOfWeek: z.array(z.number().min(0).max(6)).min(1, 'Seleccione al menos un día'),
  startDate: z.date(),
  endDate: z.date().optional(),
}).refine(
  (data) => {
    const start = data.startTime.split(':').map(Number);
    const end = data.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return endMinutes > startMinutes;
  },
  {
    message: 'Hora de fin debe ser mayor que hora de inicio',
    path: ['endTime'],
  }
);

export type ShiftFormData = z.infer<typeof shiftFormSchema>;

/**
 * Attendance Form Schema
 */
export const attendanceFormSchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  date: z.date(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  scheduledHours: z.number().min(0).max(24),
  workedHours: z.number().min(0).max(24),
  overtimeHours: z.number().min(0).max(12),
  status: z.enum(['present', 'absent', 'late', 'half-day', 'overtime']),
  notes: z.string().optional(),
});

export type AttendanceFormData = z.infer<typeof attendanceFormSchema>;

/**
 * Payroll Form Schema
 */
export const payrollFormSchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  periodStart: z.date(),
  periodEnd: z.date(),
  paymentDate: z.date(),
  baseSalary: z.number().positive('Salario base debe ser positivo'),
  overtimePay: z.number().min(0).default(0),
  bonuses: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  currency: z.string().default('USD'),
  regularHours: z.number().min(0),
  overtimeHours: z.number().min(0).default(0),
  paymentMethod: z.enum(['cash', 'bank-transfer', 'check']),
  reference: z.string().optional(),
}).refine(
  (data) => data.periodEnd > data.periodStart,
  {
    message: 'Fecha fin debe ser mayor que fecha inicio',
    path: ['periodEnd'],
  }
);

export type PayrollFormData = z.infer<typeof payrollFormSchema>;

/**
 * Leave Request Form Schema
 */
export const leaveRequestFormSchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  type: z.enum(['vacation', 'sick', 'personal', 'unpaid']),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().min(10, 'Razón debe tener al menos 10 caracteres'),
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'Fecha fin debe ser mayor o igual que fecha inicio',
    path: ['endDate'],
  }
);

export type LeaveRequestFormData = z.infer<typeof leaveRequestFormSchema>;

/**
 * Employee Filters Schema
 */
export const employeeFiltersSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended', 'vacation', 'all']).optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  search: z.string().optional(),
});

export type EmployeeFiltersData = z.infer<typeof employeeFiltersSchema>;
