// Manual test to check client loading
import { db } from './lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function testClientLoad() {
  try {
    console.log('Manual test: Starting client load...');
    const clientsCollection = collection(db, 'clients');
    const snapshot = await getDocs(clientsCollection);
    
    console.log('Manual test: Found', snapshot.size, 'documents');
    
    const clients = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const client = {
        id: doc.id,
        ...data,
        birthDate: data.birthDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        lastInteractionDate: data.lastInteractionDate?.toDate(),
      };
      clients.push(client);
      console.log('Manual test: Client loaded:', client);
    });
    
    return clients;
  } catch (error) {
    console.error('Manual test: Error loading clients:', error);
    throw error;
  }
}