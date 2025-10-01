import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkClientsInFirebase() {
  try {
    console.log('[SEARCH] Verificando clientes en Firebase...\n');

    // Get all clients
    const clientsRef = collection(db, 'clients');
    const clientsSnapshot = await getDocs(clientsRef);

    console.log(`[CHART] Total de clientes encontrados: ${clientsSnapshot.size}\n`);

    if (clientsSnapshot.empty) {
      console.log('[ERROR] No se encontraron clientes en la base de datos.');
      return;
    }

    // Display each client
    clientsSnapshot.forEach((doc) => {
      const clientData = doc.data();
      console.log(`[ID] Cliente ID: ${doc.id}`);
      console.log(`[USER] Nombre: ${clientData.firstName || 'N/A'} ${clientData.lastName || 'N/A'}`);
      console.log(`[BUILDING] Tipo: ${clientData.clientType || 'N/A'}`);
      console.log(`[MAIL] Email: ${clientData.email || 'N/A'}`);
      console.log(`[PHONE] Teléfono: ${clientData.phone || 'N/A'}`);
      console.log(`[LOCATION] País: ${clientData.address?.country || 'N/A'}`);
      console.log(`[STATE] Estado: ${clientData.address?.state || 'N/A'}`);
      console.log(`[CITY] Ciudad: ${clientData.address?.city || 'N/A'}`);
      console.log(`[HOME] Dirección: ${clientData.address?.street || 'N/A'}`);
      console.log(`[POSTAL] Código Postal: ${clientData.address?.postalCode || 'N/A'}`);
      console.log(`[CALENDAR] Fecha de creación: ${clientData.createdAt?.toDate?.() || clientData.createdAt || 'N/A'}`);
      console.log(`[REFRESH] Última actualización: ${clientData.updatedAt?.toDate?.() || clientData.updatedAt || 'N/A'}`);
      console.log('─'.repeat(50));
    });

  } catch (error) {
    console.error('[ERROR] Error al verificar clientes:', error);
  }
}

// Run the check
checkClientsInFirebase();