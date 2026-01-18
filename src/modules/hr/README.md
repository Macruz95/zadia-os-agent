# Módulo de Recursos Humanos (HR)

## Descripción
El módulo de Recursos Humanos gestiona empleados, períodos de trabajo, préstamos, bonificaciones, seguimiento de tiempo y cálculos de costos laborales.

## Estructura

```
hr/
├── components/         # Componentes de UI
│   ├── EmployeeCard.tsx
│   ├── EmployeeForm.tsx
│   ├── EmployeeList.tsx
│   ├── LoanForm.tsx
│   ├── BonusForm.tsx
│   ├── WorkPeriodSelector.tsx
│   └── ...
├── hooks/              # Hooks de React
│   ├── use-employees.ts
│   ├── use-work-periods.ts
│   ├── use-loans.ts
│   ├── use-bonuses.ts
│   └── ...
├── services/           # Servicios de Firebase
│   ├── employees.service.ts
│   ├── work-periods.service.ts
│   ├── loans.service.ts
│   ├── bonuses.service.ts
│   ├── loan-payments.service.ts
│   ├── time-tracking.service.ts
│   └── labor-cost.service.ts
├── types/              # Tipos TypeScript
│   └── hr.types.ts
└── validations/        # Esquemas Zod
    └── hr.schema.ts
```

## Características

### Gestión de Empleados
- Crear, editar y eliminar empleados
- Información personal y de contacto
- Salario y tipo de contrato
- Estados: `active`, `inactive`, `terminated`

### Períodos de Trabajo
- Definir períodos de nómina (semanal, quincenal, mensual)
- Calcular fechas de pago
- Asociar transacciones a períodos

### Préstamos (Loans)
- Registrar préstamos a empleados
- Seguimiento de saldos pendientes
- Pagos parciales (abonos)
- Estados: `pending`, `partial`, `paid`

### Abonos a Préstamos (Loan Payments)
- Registrar pagos contra préstamos
- Actualizar saldo automáticamente
- Historial de transacciones

### Bonificaciones
- Registrar bonificaciones por período
- Tipos: `performance`, `attendance`, `holiday`, `other`

### Seguimiento de Tiempo
- Registrar entradas y salidas
- Calcular horas trabajadas
- Generar reportes de asistencia

### Costos Laborales
- Calcular costo total por empleado
- Reportes de nómina
- Análisis de gastos de personal

## Uso

```typescript
import { useEmployees } from '@/modules/hr/hooks/use-employees';
import { LoansService } from '@/modules/hr/services/loans.service';
import { LoanPaymentsService } from '@/modules/hr/services/loan-payments.service';

// En un componente
function EmployeesPage() {
  const { employees, loading, createEmployee } = useEmployees();
  // ...
}

// Agregar abono a préstamo
const payment = await LoanPaymentsService.addPayment(
  loanId,
  employeeId,
  workPeriodId,
  amount,
  'manual',
  userId,
  'Abono parcial',
  tenantId
);
```

## Colecciones de Firebase
- `employees` - Datos de empleados
- `workPeriods` - Períodos de trabajo/nómina
- `loans` - Préstamos a empleados
- `loanPayments` - Pagos/abonos a préstamos
- `bonuses` - Bonificaciones

## Transacciones
El servicio de `LoanPaymentsService` utiliza transacciones de Firebase para garantizar consistencia al actualizar el préstamo y crear el registro de pago simultáneamente.

## Notas de Implementación
- Todos los registros requieren `tenantId` para aislamiento
- Los préstamos pueden usar `workPeriodId` como alternativa para acceso
- Las validaciones de Zod aseguran datos válidos antes de guardar
