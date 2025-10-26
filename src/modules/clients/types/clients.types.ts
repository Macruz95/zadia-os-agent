import { z } from 'zod';

// Enums
export const ClientTypeEnum = z.enum(['PersonaNatural', 'Organización', 'Empresa']);
export type ClientType = z.infer<typeof ClientTypeEnum>;

export const ClientStatusEnum = z.enum(['Prospecto', 'Activo', 'Inactivo']);
export type ClientStatus = z.infer<typeof ClientStatusEnum>;

export const GenderEnum = z.enum(['Masculino', 'Femenino', 'Otro']);
export type Gender = z.infer<typeof GenderEnum>;

export const InteractionTypeEnum = z.enum(['Llamada', 'Email', 'Reunión', 'Visita', 'Otro']);
export type InteractionType = z.infer<typeof InteractionTypeEnum>;

export const TransactionTypeEnum = z.enum(['Factura', 'Pago']);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

export const TransactionStatusEnum = z.enum(['Pendiente', 'Pagada', 'Vencida']);
export type TransactionStatus = z.infer<typeof TransactionStatusEnum>;

export const ProjectStatusEnum = z.enum(['Planificación', 'EnProgreso', 'Completado', 'Cancelado']);
export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;

export const QuoteStatusEnum = z.enum(['Borrador', 'Enviada', 'Aceptada', 'Rechazada']);
export type QuoteStatus = z.infer<typeof QuoteStatusEnum>;

export const MeetingStatusEnum = z.enum(['Programada', 'Realizada', 'Cancelada']);
export type MeetingStatus = z.infer<typeof MeetingStatusEnum>;

export const TaskStatusEnum = z.enum(['Pendiente', 'EnProgreso', 'Completada', 'Cancelada']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const TaskPriorityEnum = z.enum(['Baja', 'Media', 'Alta', 'Urgente']);
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;

// Interfaces
export interface Address {
  country: string;
  state: string;
  city: string;
  district?: string;
  street: string;
  postalCode?: string;
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  role?: string;
  email?: string;
  phone: string;
  phoneCountryId?: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  documentId: string;
  clientType: ClientType;
  
  // Datos adicionales para empresas/organizaciones
  legalName?: string; // Razón social
  taxId?: string; // NIT, RUC, RFC (Registro fiscal)
  
  // Datos para personas naturales
  birthDate?: Date;
  gender?: Gender;
  
  // Información de contacto principal
  email?: string;
  phone?: string;
  phoneCountryId?: string;
  
  status: ClientStatus;
  tags: string[];
  source?: string;
  owner?: string; // Vendedor/Usuario asignado
  communicationOptIn: boolean;
  address: Address;
  createdAt: Date;
  updatedAt: Date;
  lastInteractionDate?: Date;
  activeProjectsCount?: number; // Contador de proyectos activos
}

export interface Interaction {
  id: string;
  clientId: string;
  type: InteractionType;
  date: Date;
  notes: string;
  createdBy: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  clientId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  dueDate?: Date;
  createdAt: Date;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  status: ProjectStatus;
  progress: number; // 0-100
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

export interface Quote {
  id: string;
  clientId: string;
  number: string;
  date: Date;
  estimatedAmount: number;
  status: QuoteStatus;
  createdAt: Date;
}

export interface Meeting {
  id: string;
  clientId: string;
  date: Date;
  attendees: string[];
  duration: number; // in minutes
  status: MeetingStatus;
  notes?: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  clientId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assignedTo?: string;
  createdAt: Date;
}

// Filter and Search Types
export interface ClientFilters {
  clientType?: ClientType;
  status?: ClientStatus;
  tags?: string[];
  source?: string;
}

export interface ClientSearchParams {
  query?: string;
  filters?: ClientFilters;
  sortBy?: 'name' | 'documentId' | 'lastInteractionDate' | 'birthDate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Form Types
export interface ClientFormData {
  name: string;
  documentId: string;
  clientType: ClientType;
  birthDate?: Date;
  gender?: Gender;
  status: ClientStatus;
  tags: string[];
  source?: string;
  owner?: string;
  communicationOptIn: boolean;
  address: Address;
  contacts: Omit<Contact, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>[];
}

export interface ContactFormData {
  name: string;
  role?: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

// UI State Types
export interface ClientDirectoryState {
  clients: Client[];
  loading: boolean;
  error?: string;
  searchParams: ClientSearchParams;
  totalCount: number;
}

export interface ClientProfileState {
  client?: Client;
  contacts: Contact[];
  interactions: Interaction[];
  transactions: Transaction[];
  projects: Project[];
  quotes: Quote[];
  meetings: Meeting[];
  tasks: Task[];
  loading: boolean;
  error?: string;
}