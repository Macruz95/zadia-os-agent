import { db } from '../../../lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentSnapshot,
  Query,
} from 'firebase/firestore';
import {
  Client,
  Contact,
  Interaction,
  Transaction,
  Project,
  Quote,
  Meeting,
  Task,
  ClientSearchParams,
} from '../types/clients.types';
import {
  ClientSchema,
  ContactSchema,
  InteractionSchema,
  TransactionSchema,
  ProjectSchema,
  QuoteSchema,
  MeetingSchema,
  TaskSchema,
} from '../validations/clients.schema';

// Collections
const CLIENTS_COLLECTION = 'clients';
const CONTACTS_COLLECTION = 'contacts';
const INTERACTIONS_COLLECTION = 'interactions';
const TRANSACTIONS_COLLECTION = 'transactions';
const PROJECTS_COLLECTION = 'projects';
const QUOTES_COLLECTION = 'quotes';
const MEETINGS_COLLECTION = 'meetings';
const TASKS_COLLECTION = 'tasks';

// Utility functions
const docToClient = (doc: DocumentSnapshot): Client => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    birthDate: data?.birthDate?.toDate(),
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
    lastInteractionDate: data?.lastInteractionDate?.toDate(),
  } as Client;
};

const docToContact = (doc: DocumentSnapshot): Contact => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  } as Contact;
};

const docToInteraction = (doc: DocumentSnapshot): Interaction => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    date: data?.date?.toDate(),
    createdAt: data?.createdAt?.toDate(),
  } as Interaction;
};

const docToTransaction = (doc: DocumentSnapshot): Transaction => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    dueDate: data?.dueDate?.toDate(),
    createdAt: data?.createdAt?.toDate(),
  } as Transaction;
};

const docToProject = (doc: DocumentSnapshot): Project => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    startDate: data?.startDate?.toDate(),
    endDate: data?.endDate?.toDate(),
    createdAt: data?.createdAt?.toDate(),
  } as Project;
};

const docToQuote = (doc: DocumentSnapshot): Quote => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    date: data?.date?.toDate(),
    createdAt: data?.createdAt?.toDate(),
  } as Quote;
};

const docToMeeting = (doc: DocumentSnapshot): Meeting => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    date: data?.date?.toDate(),
    createdAt: data?.createdAt?.toDate(),
  } as Meeting;
};

const docToTask = (doc: DocumentSnapshot): Task => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    dueDate: data?.dueDate?.toDate(),
    createdAt: data?.createdAt?.toDate(),
  } as Task;
};

// Client Services
export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const validatedData = ClientSchema.parse(clientData);
  const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), {
    ...validatedData,
    birthDate: validatedData.birthDate ? Timestamp.fromDate(validatedData.birthDate) : null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getClient = async (clientId: string): Promise<Client | null> => {
  const docRef = doc(db, CLIENTS_COLLECTION, clientId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docToClient(docSnap);
  }
  return null;
};

export const updateClient = async (clientId: string, updates: Partial<Client>): Promise<void> => {
  const docRef = doc(db, CLIENTS_COLLECTION, clientId);
  await updateDoc(docRef, {
    ...updates,
    birthDate: updates.birthDate ? Timestamp.fromDate(updates.birthDate) : undefined,
    updatedAt: Timestamp.now(),
  });
};

export const deleteClient = async (clientId: string): Promise<void> => {
  const docRef = doc(db, CLIENTS_COLLECTION, clientId);
  await deleteDoc(docRef);
};

export const searchClients = async (params: ClientSearchParams): Promise<{ clients: Client[]; totalCount: number; hasMore: boolean }> => {
  let q: Query = collection(db, CLIENTS_COLLECTION);

  // Apply filters
  if (params.filters) {
    const { clientType, status, tags, source } = params.filters;
    if (clientType) q = query(q, where('clientType', '==', clientType));
    if (status) q = query(q, where('status', '==', status));
    if (source) q = query(q, where('source', '==', source));
    if (tags && tags.length > 0) q = query(q, where('tags', 'array-contains-any', tags));
  }

  // Apply sorting
  const sortBy = params.sortBy || 'lastInteractionDate';
  const sortOrder = params.sortOrder || 'desc';
  q = query(q, orderBy(sortBy, sortOrder));

  // Apply pagination
  const pageSize = params.pageSize || 20;
  q = query(q, limit(pageSize + 1)); // +1 to check if there's more

  if (params.page && params.page > 1) {
    // For pagination, we'd need to implement cursor-based pagination
    // This is a simplified version
  }

  const querySnapshot = await getDocs(q);
  const clients = querySnapshot.docs.slice(0, pageSize).map(docToClient);
  const hasMore = querySnapshot.docs.length > pageSize;

  // For total count, we'd need a separate query or maintain a counter
  // This is a simplified version
  const totalCount = clients.length;

  return { clients, totalCount, hasMore };
};

// Contact Services
export const createContact = async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const validatedData = ContactSchema.parse(contactData);
  const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), {
    ...validatedData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getContactsByClient = async (clientId: string): Promise<Contact[]> => {
  const q = query(collection(db, CONTACTS_COLLECTION), where('clientId', '==', clientId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToContact);
};

export const updateContact = async (contactId: string, updates: Partial<Contact>): Promise<void> => {
  const docRef = doc(db, CONTACTS_COLLECTION, contactId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const deleteContact = async (contactId: string): Promise<void> => {
  const docRef = doc(db, CONTACTS_COLLECTION, contactId);
  await deleteDoc(docRef);
};

// Interaction Services
export const createInteraction = async (interactionData: Omit<Interaction, 'id' | 'createdAt'>): Promise<string> => {
  const validatedData = InteractionSchema.parse(interactionData);
  const docRef = await addDoc(collection(db, INTERACTIONS_COLLECTION), {
    ...validatedData,
    date: Timestamp.fromDate(validatedData.date),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getInteractionsByClient = async (clientId: string): Promise<Interaction[]> => {
  const q = query(collection(db, INTERACTIONS_COLLECTION), where('clientId', '==', clientId), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToInteraction);
};

// Transaction Services
export const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> => {
  const validatedData = TransactionSchema.parse(transactionData);
  const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    ...validatedData,
    dueDate: validatedData.dueDate ? Timestamp.fromDate(validatedData.dueDate) : null,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getTransactionsByClient = async (clientId: string): Promise<Transaction[]> => {
  const q = query(collection(db, TRANSACTIONS_COLLECTION), where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToTransaction);
};

// Project Services
export const createProject = async (projectData: Omit<Project, 'id' | 'createdAt'>): Promise<string> => {
  const validatedData = ProjectSchema.parse(projectData);
  const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
    ...validatedData,
    startDate: Timestamp.fromDate(validatedData.startDate),
    endDate: validatedData.endDate ? Timestamp.fromDate(validatedData.endDate) : null,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getProjectsByClient = async (clientId: string): Promise<Project[]> => {
  const q = query(collection(db, PROJECTS_COLLECTION), where('clientId', '==', clientId), orderBy('startDate', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToProject);
};

// Quote Services
export const createQuote = async (quoteData: Omit<Quote, 'id' | 'createdAt'>): Promise<string> => {
  const validatedData = QuoteSchema.parse(quoteData);
  const docRef = await addDoc(collection(db, QUOTES_COLLECTION), {
    ...validatedData,
    date: Timestamp.fromDate(validatedData.date),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getQuotesByClient = async (clientId: string): Promise<Quote[]> => {
  const q = query(collection(db, QUOTES_COLLECTION), where('clientId', '==', clientId), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToQuote);
};

// Meeting Services
export const createMeeting = async (meetingData: Omit<Meeting, 'id' | 'createdAt'>): Promise<string> => {
  const validatedData = MeetingSchema.parse(meetingData);
  const docRef = await addDoc(collection(db, MEETINGS_COLLECTION), {
    ...validatedData,
    date: Timestamp.fromDate(validatedData.date),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getMeetingsByClient = async (clientId: string): Promise<Meeting[]> => {
  const q = query(collection(db, MEETINGS_COLLECTION), where('clientId', '==', clientId), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToMeeting);
};

// Task Services
export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<string> => {
  const validatedData = TaskSchema.parse(taskData);
  const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
    ...validatedData,
    dueDate: validatedData.dueDate ? Timestamp.fromDate(validatedData.dueDate) : null,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getTasksByClient = async (clientId: string): Promise<Task[]> => {
  const q = query(collection(db, TASKS_COLLECTION), where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToTask);
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  const docRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(docRef, {
    ...updates,
    dueDate: updates.dueDate ? Timestamp.fromDate(updates.dueDate) : undefined,
    updatedAt: Timestamp.now(),
  });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const docRef = doc(db, TASKS_COLLECTION, taskId);
  await deleteDoc(docRef);
};