import { z } from 'zod';

// Re-export enums from types
export { ClientTypeEnum, ClientStatusEnum, GenderEnum, InteractionTypeEnum, TransactionTypeEnum, TransactionStatusEnum, ProjectStatusEnum, QuoteStatusEnum, MeetingStatusEnum, TaskStatusEnum, TaskPriorityEnum } from '../types/clients.types';

// Address Schema
export const AddressSchema = z.object({
  country: z.string().min(1, 'País es requerido'),
  state: z.string().min(1, 'Estado/Departamento es requerido'),
  city: z.string().min(1, 'Ciudad/Municipio es requerido'),
  district: z.string().optional(), // Solo para El Salvador
  street: z.string().min(1, 'Dirección es requerida'),
  postalCode: z.string().optional(), // Opcional - usuarios pueden no conocerlo
});

// Contact Schema
export const ContactSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(1, 'Teléfono es requerido'),
  phoneCountryId: z.string().optional(),
  isPrimary: z.boolean(),
});

// Client Schema
export const ClientSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  documentId: z.string().regex(/^[0-9]{8}-[0-9]$/, 'Formato de DUI inválido (########-#)'),
  clientType: z.enum(['PersonaNatural', 'Organización', 'Empresa']),
  birthDate: z.date().optional(),
  gender: z.enum(['Masculino', 'Femenino', 'Otro']).optional(),
  status: z.enum(['Potencial', 'Activo', 'Inactivo']),
  tags: z.array(z.string()),
  source: z.string().optional(),
  communicationOptIn: z.boolean(),
  address: AddressSchema,
}).refine((data) => {
  if (data.clientType === 'PersonaNatural' && !data.birthDate) {
    return false;
  }
  return true;
}, {
  message: 'Fecha de nacimiento es requerida para personas naturales',
  path: ['birthDate'],
}).refine((data) => {
  if (data.clientType === 'PersonaNatural' && data.birthDate) {
    const age = new Date().getFullYear() - data.birthDate.getFullYear();
    return age >= 18;
  }
  return true;
}, {
  message: 'Cliente debe ser mayor de 18 años',
  path: ['birthDate'],
});

// Interaction Schema
export const InteractionSchema = z.object({
  type: z.enum(['Llamada', 'Email', 'Reunión', 'Visita', 'Otro']),
  date: z.date(),
  notes: z.string().min(1, 'Notas son requeridas'),
});

// Transaction Schema
export const TransactionSchema = z.object({
  type: z.enum(['Factura', 'Pago']),
  amount: z.number().positive('Monto debe ser positivo'),
  status: z.enum(['Pendiente', 'Pagada', 'Vencida']),
  dueDate: z.date().optional(),
});

// Project Schema
export const ProjectSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  status: z.enum(['Planificación', 'EnProgreso', 'Completado', 'Cancelado']),
  progress: z.number().min(0).max(100),
  startDate: z.date(),
  endDate: z.date().optional(),
});

// Quote Schema
export const QuoteSchema = z.object({
  number: z.string().min(1, 'Número es requerido'),
  date: z.date(),
  estimatedAmount: z.number().positive('Monto estimado debe ser positivo'),
  status: z.enum(['Borrador', 'Enviada', 'Aceptada', 'Rechazada']),
});

// Meeting Schema
export const MeetingSchema = z.object({
  date: z.date(),
  attendees: z.array(z.string()).min(1, 'Al menos un asistente es requerido'),
  duration: z.number().positive('Duración debe ser positiva'),
  status: z.enum(['Programada', 'Realizada', 'Cancelada']),
  notes: z.string().optional(),
});

// Task Schema
export const TaskSchema = z.object({
  title: z.string().min(1, 'Título es requerido'),
  status: z.enum(['Pendiente', 'EnProgreso', 'Completada', 'Cancelada']),
  priority: z.enum(['Baja', 'Media', 'Alta', 'Urgente']),
  dueDate: z.date().optional(),
  assignedTo: z.string().optional(),
});

// Form Schemas
export const ClientFormSchema = ClientSchema.merge(z.object({
  contacts: z.array(ContactSchema).min(1, 'Al menos un contacto es requerido'),
}));

export const ContactFormSchema = ContactSchema.omit({ isPrimary: true });

// Filter Schemas
export const ClientFiltersSchema = z.object({
  clientType: z.enum(['PersonaNatural', 'Organización', 'Empresa']).optional(),
  status: z.enum(['Potencial', 'Activo', 'Inactivo']).optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
});

export const ClientSearchParamsSchema = z.object({
  query: z.string().optional(),
  filters: ClientFiltersSchema.optional(),
  sortBy: z.enum(['name', 'documentId', 'lastInteractionDate', 'birthDate']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
});

// Type exports
export type Address = z.infer<typeof AddressSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type Interaction = z.infer<typeof InteractionSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
export type Meeting = z.infer<typeof MeetingSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type ClientFormData = z.infer<typeof ClientFormSchema>;
export type ContactFormData = z.infer<typeof ContactFormSchema>;
export type ClientFilters = z.infer<typeof ClientFiltersSchema>;
export type ClientSearchParams = z.infer<typeof ClientSearchParamsSchema>;