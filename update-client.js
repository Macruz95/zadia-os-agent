// Script to update existing client with lastInteractionDate
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyB3ulWXG5UYUiJpwTFbKwG4q-Jm_ugDSQM",
  authDomain: "zadia-os-885k8.firebaseapp.com", 
  projectId: "zadia-os-885k8",
  storageBucket: "zadia-os-885k8.firebasestorage.app",
  messagingSenderId: "677100620689",
  appId: "1:677100620689:web:690609baac5a300606a830"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateClient() {
  try {
    const clientId = 'sfsVq5EqnAa8TyLoxq3N';
    const clientRef = doc(db, 'clients', clientId);
    
    await updateDoc(clientRef, {
      lastInteractionDate: Timestamp.now()
    });
    
    console.log('Client updated successfully with lastInteractionDate!');
  } catch (error) {
    console.error('Error updating client:', error);
  }
}

updateClient();