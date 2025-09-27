# Estandarización de Modales - ZADIA OS

## 📋 Resumen de Modales Estandarizados

### ✅ Modales Principales
| Modal | Archivo | Tamaño | Estado |
|-------|---------|---------|---------|
| **Registro de Movimientos** | `MovementForm.tsx` | `sm:max-w-lg` | ✅ Estandarizado |
| **Envío de Email** | `SendEmailDialog.tsx` | `sm:max-w-2xl` | ✅ Estandarizado |
| **Editar Cliente** | `EditClientDialog.tsx` | `sm:max-w-2xl` | ✅ Estandarizado |
| **Eliminar Cliente** | `DeleteClientDialog.tsx` | Base AlertDialog | ✅ Sin cambios (correcto) |

### 🎯 Estándar de Clases Aplicado
```tsx
className="sm:max-w-[tamaño] w-full max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] mx-4 [overflow-specific]"
```

### 📐 Especificaciones Técnicas

#### **Posicionamiento Vertical**
- **Método**: Centrado nativo de Radix UI Dialog
- **Clases base**: `top-[50%] translate-y-[-50%]` (del componente DialogContent)
- **Resultado**: Centrado perfecto en todas las pantallas

#### **Constraintos Horizontales**
- **Margen lateral**: `mx-4` (1rem cada lado)
- **Ancho máximo móvil**: `max-w-[calc(100vw-2rem)]` 
- **Ancho máximo desktop**: `sm:max-w-[lg|2xl]` según contenido

#### **Constraintos Verticales**
- **Altura máxima**: `max-h-[calc(100vh-4rem)]`
- **Espacio libre**: 2rem arriba + 2rem abajo = 4rem total

### 🔄 Overflow Handling
- **MovementForm**: `overflow-y-auto` (scroll vertical)
- **SendEmailDialog**: `overflow-hidden flex flex-col` (control manual)
- **EditClientDialog**: `overflow-y-auto` (scroll vertical)

### 📱 Comportamiento Responsivo
- **Mobile**: Márgenes mínimos, ancho casi completo
- **Desktop**: Ancho fijo según tamaño definido
- **Todas**: Altura dinámica con límites de viewport

### ✨ Beneficios Alcanzados
1. **Centrado Perfecto**: Equilibrio automático arriba/abajo
2. **Consistencia Visual**: Todos los modales siguen el mismo patrón
3. **Responsividad**: Funciona en todos los tamaños de pantalla
4. **Mantenibilidad**: Estándar claro para futuros modales
5. **UX Mejorada**: Sin modales pegados a bordes

---
*Última actualización: 26 de septiembre, 2025*