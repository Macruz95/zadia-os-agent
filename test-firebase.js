// Test script to verify Firebase connection
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    const clientsCollection = collection(db, 'clients');
    const snapshot = await getDocs(clientsCollection);
    
    console.log('Connected successfully!');
    console.log('Number of documents in clients collection:', snapshot.size);
    
    snapshot.forEach((doc) => {
      console.log('Document ID:', doc.id);
      console.log('Document data:', doc.data());
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error connecting to Firebase:', error);
  }
}

testFirebaseConnection();