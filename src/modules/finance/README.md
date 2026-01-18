# Módulo de Finanzas

## Descripción
El módulo de Finanzas gestiona facturas, pagos, gastos y reportes financieros. Incluye funcionalidades para envío de correos electrónicos y generación de PDFs.

## Estructura

```
finance/
├── components/         # Componentes de UI
│   ├── InvoiceCard.tsx
│   ├── InvoiceForm.tsx
│   ├── InvoiceList.tsx
│   ├── PaymentForm.tsx
│   ├── ExpenseForm.tsx
│   └── ...
├── hooks/              # Hooks de React
│   ├── use-invoices.ts
│   ├── use-payments.ts
│   ├── use-expenses.ts
│   └── ...
├── services/           # Servicios de Firebase
│   ├── invoices.service.ts
│   ├── payments.service.ts
│   ├── expenses.service.ts
│   └── email/
│       └── email-template-builder.service.ts
├── types/              # Tipos TypeScript
│   └── finance.types.ts
├── utils/              # Utilidades
│   └── finance.utils.ts
└── validations/        # Esquemas Zod
    └── finance.schema.ts
```

## Características

### Facturación
- Crear, editar y eliminar facturas
- Líneas de productos/servicios
- Cálculo automático de totales e impuestos
- Estados: `draft`, `sent`, `paid`, `partial`, `overdue`, `cancelled`
- Numeración secuencial automática

### Pagos
- Registrar pagos contra facturas
- Métodos de pago múltiples
- Pagos parciales
- Historial de transacciones

### Gastos
- Registrar gastos empresariales
- Categorización de gastos
- Asociación a proyectos
- Reportes de gastos

### Plantillas de Email
- Recordatorios de pago
- Notificaciones de factura
- Plantillas personalizables

## Uso

```typescript
import { useInvoices } from '@/modules/finance/hooks/use-invoices';
import { InvoicesService } from '@/modules/finance/services/invoices.service';
import { PaymentsService } from '@/modules/finance/services/payments.service';

// En un componente
function InvoicesPage() {
  const { invoices, loading, createInvoice } = useInvoices();
  // ...
}

// Crear factura
const invoice = await InvoicesService.createInvoice(data, userId, tenantId);

// Registrar pago
const payment = await PaymentsService.createPayment({
  invoiceId: invoice.id,
  amount: 1000,
  method: 'transfer',
  tenantId,
});
```

## Colecciones de Firebase
- `invoices` - Facturas
- `payments` - Pagos
- `expenses` - Gastos

## Validaciones de Firestore
Las reglas de Firestore incluyen validación de datos:
```javascript
function isValidInvoiceData() {
  return isValidString(data.tenantId) &&
    isValidAmount(data.get('total', 0)) &&
    isValidAmount(data.get('subtotal', 0));
}
```

## Integración con Otros Módulos
- **Clientes**: Las facturas se asocian a clientes
- **Proyectos**: Los gastos pueden asociarse a proyectos
- **HR**: Costos laborales afectan reportes financieros

## Notas de Implementación
- Totales y subtotales deben ser números positivos
- Todas las operaciones requieren `tenantId`
- Los pagos parciales actualizan el estado de la factura
