/**
 * EMERGENCY FIX - Manual Role Assignment
 * 
 * Script temporal para asignar rol 'admin' al usuario actual
 * Ejecutar UNA SOLA VEZ antes de desplegar Cloud Functions
 */

// INSTRUCCIONES:
// 1. Ir a Firebase Console: https://console.firebase.google.com
// 2. Seleccionar proyecto "zadia-os-885k8"
// 3. Authentication > Users
// 4. Click en tu usuario
// 5. Scroll down a "Custom claims"
// 6. Click "Edit"
// 7. Pegar esto:

{
  "role": "admin"
}

// 8. Click "Save"
// 9. IMPORTANTE: Cerrar sesión y volver a entrar en la app
// 10. El error desaparecerá

// ALTERNATIVA (Si tienes Firebase Admin SDK instalado):
// Ejecutar este script Node.js:

/*
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function assignAdminRole() {
  const email = 'TU_EMAIL_AQUI@example.com'; // ← CAMBIAR
  
  try {
    const user = await admin.auth().getUserByEmail(email);
    
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'admin'
    });
    
    console.log('✅ Admin role assigned to:', email);
    console.log('⚠️ User must sign out and sign in again for changes to take effect');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

assignAdminRole();
*/

// Después de hacer esto, desplegar las Cloud Functions:
// firebase deploy --only functions
