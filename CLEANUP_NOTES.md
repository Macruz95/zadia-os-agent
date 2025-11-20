# ZADIA OS - Limpieza de Código

## Console.error encontrados (10 archivos)

### Archivos a corregir:
1. src/modules/sales/components/opportunities/OpportunityCard.tsx:61
2. src/modules/projects/components/AddExpenseDialog.tsx:107
3. src/modules/dashboard/hooks/useDashboardMetrics.ts:84
4. src/actions/payment-actions.ts:157
5. src/actions/opportunity-actions.ts:153
6. src/actions/inventory-actions.ts:186
7. src/actions/inventory-actions.ts:271
8. src/actions/expense-actions.ts:97

### Archivos OK (parte del logger):
- src/lib/logger.ts (correcto, es parte del sistema de logging)
- src/lib/firebase-admin.ts (correcto, es configuración)

## Plan de Limpieza Automatizada

1. Crear script de reemplazo automático
2. Reemplazar todos los console.error por logger.error
3. Verificar imports de logger
4. Ejecutar build
5. Commit cambios
