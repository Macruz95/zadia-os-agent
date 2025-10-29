# 🔧 SOLUCIÓN INMEDIATA - Limpiar Cache de Firebase

## El problema
Las reglas de Firestore se desplegaron correctamente, pero el navegador tiene cacheado un token antiguo con las reglas viejas.

## Solución 1: Limpiar Storage del Navegador (MÁS RÁPIDA)

1. Abre las **DevTools** (F12)
2. Ve a la pestaña **Application** (o Aplicación)
3. En el menú izquierdo, busca **Storage** → **Clear site data**
4. Marca todas las opciones
5. Click en **Clear site data**
6. **Recarga la página** (F5)
7. **Vuelve a iniciar sesión**

## Solución 2: Ejecutar en la Consola del Navegador

1. Abre las **DevTools** (F12)
2. Ve a la pestaña **Console**
3. Pega este código y presiona Enter:

```javascript
// Limpiar todo el almacenamiento local
localStorage.clear();
sessionStorage.clear();

// Limpiar cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Limpiar IndexedDB de Firebase
indexedDB.databases().then(dbs => {
  dbs.forEach(db => {
    if (db.name.includes('firebase')) {
      indexedDB.deleteDatabase(db.name);
    }
  });
});

console.log('✅ Cache limpiado. Recarga la página (F5) y vuelve a iniciar sesión');
```

4. **Recarga la página** (F5)
5. **Inicia sesión nuevamente**

## Solución 3: Modo Incógnito (TEMPORAL)

1. Abre una ventana de **Incógnito/Privada** (Ctrl+Shift+N)
2. Ve a `http://localhost:3000`
3. Inicia sesión
4. Prueba el módulo de empleados

Esto te permitirá probar sin cache mientras aplicas la Solución 1 o 2 en la ventana normal.

## ✅ Una vez que funcione

El sistema debería funcionar perfectamente con las reglas simplificadas que permiten acceso total a usuarios autenticados.
