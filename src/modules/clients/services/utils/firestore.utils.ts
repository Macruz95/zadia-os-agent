import { DocumentSnapshot } from 'firebase/firestore';
import {
  Client,
  Contact,
  Interaction,
  Transaction,
  Project,
  Quote,
  Meeting,
  Task,
} from '../../types/clients.types';

// Collections
export const CLIENTS_COLLECTION = 'clients';
export const CONTACTS_COLLECTION = 'contacts';
export const INTERACTIONS_COLLECTION = 'interactions';
export const TRANSACTIONS_COLLECTION = 'transactions';
export const PROJECTS_COLLECTION = 'projects';
export const QUOTES_COLLECTION = 'quotes';
export const MEETINGS_COLLECTION = 'meetings';
export const TASKS_COLLECTION = 'tasks';

// Document converters
export const docToClient = (doc: DocumentSnapshot): Client => {
  const data = doc.data();
  console.log('docToClient: Converting document:', doc.id, data);
  const client = {
    id: doc.id,
    ...data,
    birthDate: data?.birthDate?.toDate(),
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
    lastInteractionDate: data?.lastInteractionDate?.toDate(),
  } as Client;
  console.log('docToClient: Converted client:', client);
  return client;
};

export const docToContact = (doc: DocumentSnapshot): Contact => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  } as Contact;
};

export const docToInteraction = (doc: DocumentSnapshot): Interaction => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    date: data?.date?.toDate(),
    createdAt: data?.createdAt?.toDate(),
  } as Interaction;
};

export const docToTransaction = (doc: DocumentSnapshot): Transaction => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    dueDate: data?.dueDate?.toDate(),
    createdAt: data?.createdAt?.toDate(),
  } as Transaction;
};

export const docToProject = (doc: DocumentSnapshot): Project => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    startDate: data?.startDate?.toDate(),
    endDate: data?.endDate?.toDate(),
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  } as Project;
};

export const docToQuote = (doc: DocumentSnapshot): Quote => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    validUntil: data?.validUntil?.toDate(),
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  } as Quote;
};

export const docToMeeting = (doc: DocumentSnapshot): Meeting => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    date: data?.date?.toDate(),
    createdAt: data?.createdAt?.toDate(),
  } as Meeting;
};

export const docToTask = (doc: DocumentSnapshot): Task => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    dueDate: data?.dueDate?.toDate(),
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  } as Task;
};