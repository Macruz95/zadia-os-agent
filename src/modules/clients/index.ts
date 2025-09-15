// Types
export * from './types/clients.types';

// Validations - export specific schemas
export {
  ClientSchema,
  ContactSchema,
  InteractionSchema,
  TransactionSchema,
  ProjectSchema,
  QuoteSchema,
  MeetingSchema,
  TaskSchema,
  ClientFormSchema,
  ContactFormSchema,
  ClientFiltersSchema,
  ClientSearchParamsSchema,
} from './validations/clients.schema';

// Services
export * from './services/clients.service';

// Hooks
export * from './hooks/use-clients';
export * from './hooks/use-client-profile';
export * from './hooks/use-client-form';

// Utils
export * from './utils/clients.utils';

// Components
export { ClientDirectory } from './components/ClientDirectory';
export { ClientCreationForm } from './components/ClientCreationForm';
export { ClientProfilePage } from './components/ClientProfilePage';