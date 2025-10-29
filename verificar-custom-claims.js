/**
 * SCRIPT DE VERIFICACIÓN
 * 
 * Ejecutar en la consola del navegador para verificar custom claims
 */

// Paso 1: Verificar si el usuario tiene custom claims
const auth = firebase.auth();
const user = auth.currentUser;

if (!user) {
  console.error('❌ No hay usuario autenticado');
} else {
  console.log('✅ Usuario autenticado:', user.email);
  
  // Paso 2: Obtener el token y ver los claims
  user.getIdTokenResult().then(tokenResult => {
    console.log('📋 Custom Claims:', tokenResult.claims);
    
    if (tokenResult.claims.role) {
      console.log('✅ Rol asignado:', tokenResult.claims.role);
    } else {
      console.error('❌ NO HAY ROL ASIGNADO');
      console.log('📝 Ve a Firebase Console y asigna: {"role":"admin"}');
    }
  });
}

// Paso 3: Si el rol está asignado pero aún hay error, refrescar token
// Ejecutar este código DESPUÉS de asignar el rol en Firebase Console:
/*
user.getIdToken(true).then(() => {
  console.log('✅ Token actualizado. Recargando página...');
  window.location.reload();
});
*/
