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

// Services (Entity-specific services - clients.service.ts exports class)
export { ClientsService } from './services/clients.service';
export { ContactsService } from './services/entities/contacts-entity.service';
export { InteractionsService } from './services/entities/interactions-entity.service';

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