# Módulo Phone-codes

El módulo Phone-codes gestiona códigos telefónicos internacionales, formatos de números telefónicos y validación de números por país.

## Características

- 📞 **Gestión de códigos telefónicos**: CRUD completo de códigos internacionales
- 🌍 **Soporte multi-país**: Integración con el módulo Countries
- ⚙️ **Formateo automático**: Aplicación de formatos específicos por país
- ✓ **Validación avanzada**: Validación de números según estándares internacionales
- 🔄 **Priorización**: Sistema de prioridades para países con múltiples códigos
- 📊 **Estadísticas**: Métricas y reportes de uso

## Estructura del Módulo

```
src/modules/phone-codes/
├── components/          # Componentes React
│   ├── PhoneCodeInput.tsx       # Input con selección de código
│   ├── PhoneCodesDirectory.tsx  # Directorio principal
│   ├── PhoneCodesForm.tsx       # Formulario de gestión
│   ├── PhoneCodesTable.tsx      # Tabla con listado
│   └── index.ts
├── hooks/              # Hooks personalizados
│   ├── use-phone-codes.ts       # Hook principal
│   └── index.ts
├── services/           # Servicios de datos
│   ├── phone-codes.service.ts   # Servicio Firebase
│   └── index.ts
├── types/              # Definiciones de tipos
│   ├── phone-codes.types.ts     # Tipos principales
│   └── index.ts
├── utils/              # Utilidades
│   ├── phone-codes.utils.ts     # Funciones utilitarias
│   └── index.ts
├── validations/        # Esquemas de validación
│   ├── phone-codes.schema.ts    # Esquemas Zod
│   └── index.ts
├── docs/               # Documentación
│   ├── README.md               # Documentación principal
│   └── API.md                  # Documentación de API
├── mock-phone-codes.ts # Datos de prueba
└── index.ts            # Exportaciones principales
```

## Uso Rápido

### Importar el Módulo

```typescript
import {
  PhoneCodesDirectory,
  PhoneCodeInput,
  usePhoneCodes,
  PhoneCodeUtils
} from '@/modules/phone-codes';
```

### Componente de Directorio

```typescript
import { PhoneCodesDirectory } from '@/modules/phone-codes';

export function PhoneCodesPage() {
  return (
    <div className="container mx-auto py-6">
      <PhoneCodesDirectory />
    </div>
  );
}
```

### Input de Número Telefónico

```typescript
import { PhoneCodeInput } from '@/modules/phone-codes';
import { useState } from 'react';

export function ContactForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  return (
    <div className="space-y-4">
      <PhoneCodeInput
        value={phoneNumber}
        onChange={setPhoneNumber}
        onCountryChange={setSelectedCountry}
        placeholder="Ingrese número telefónico"
      />
    </div>
  );
}
```

### Hook de Phone Codes

```typescript
import { usePhoneCodes } from '@/modules/phone-codes';

export function PhoneCodesList() {
  const {
    phoneCodes,
    loading,
    error,
    createPhoneCode,
    updatePhoneCode,
    deletePhoneCode
  } = usePhoneCodes();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {phoneCodes.map(code => (
        <div key={code.id}>
          {code.code} - {code.countryId}
        </div>
      ))}
    </div>
  );
}
```

### Utilidades de Formateo

```typescript
import { PhoneCodeUtils } from '@/modules/phone-codes';

// Formatear número telefónico
const phoneCode = { code: '+51', dialCode: '51', format: '+51 ### ### ###' };
const formatted = PhoneCodeUtils.formatPhoneNumber('999123456', phoneCode);
// Resultado: "+51 999 123 456"

// Validar número telefónico
const isValid = PhoneCodeUtils.isValidPhoneNumber('+51999123456', phoneCode);

// Extraer código de país
const extractedCode = PhoneCodeUtils.extractCountryCode('+51999123456', phoneCodes);

// Parsear número completo
const parsed = PhoneCodeUtils.parsePhoneNumber('+51999123456', phoneCodes);
```

## Tipos Principales

### PhoneCode

```typescript
interface PhoneCode {
  id: string;
  countryId: string;     // ID del país
  code: string;          // Código con + (ej: "+51")
  dialCode: string;      // Código numérico (ej: "51")
  format?: string;       // Patrón de formato (ej: "+51 ### ### ###")
  example?: string;      // Ejemplo de número
  priority: number;      // Prioridad (1-10)
  isActive: boolean;     // Estado activo
}
```

### PhoneNumber

```typescript
interface PhoneNumber {
  countryId: string;     // ID del país
  phoneCode: string;     // Código telefónico
  number: string;        // Número sin código
  fullNumber?: string;   // Número completo formateado
  isValid: boolean;      // Validez del número
}
```

## Integración con Countries

El módulo Phone-codes está estrechamente integrado con el módulo Countries:

```typescript
import { useCountries } from '@/modules/countries';
import { usePhoneCodes } from '@/modules/phone-codes';

export function PhoneCodesByCountry() {
  const { countries } = useCountries();
  const { getPhoneCodesByCountry } = usePhoneCodes();

  const handleCountrySelect = async (countryId: string) => {
    const phoneCodes = await getPhoneCodesByCountry(countryId);
    console.log(`Códigos para ${countryId}:`, phoneCodes);
  };

  return (
    <div>
      {countries.map(country => (
        <button
          key={country.id}
          onClick={() => handleCountrySelect(country.id)}
        >
          {country.flagEmoji} {country.name}
        </button>
      ))}
    </div>
  );
}
```

## Configuración de Firebase

Estructura de colección en Firestore:

```javascript
// Colección: phoneCodes
{
  countryId: "PE",
  code: "+51",
  dialCode: "51",
  format: "+51 ### ### ###",
  example: "+51 999 123 456",
  priority: 1,
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Características Avanzadas

### Sistema de Prioridades

Para países con múltiples códigos telefónicos (como Estados Unidos y Canadá que comparten +1):

```typescript
const usCodes = [
  { id: 'us-1', countryId: 'US', code: '+1', priority: 1 },
  { id: 'ca-1', countryId: 'CA', code: '+1', priority: 2 }
];
```

### Formateo Inteligente

El sistema aplica formatos automáticamente según el país:

```typescript
// Perú: +51 999 123 456
// Estados Unidos: +1 (555) 123-4567
// Brasil: +55 (11) 91234-5678
```

### Validación Contextual

Validación que considera las reglas específicas de cada país:

```typescript
const isValidPeru = PhoneCodeUtils.isValidPhoneNumber('+51999123456');
const isValidUS = PhoneCodeUtils.isValidPhoneNumber('+15551234567');
```

## Mejores Prácticas

1. **Usar el Hook Principal**: Sempre utilize `usePhoneCodes` para acceso a datos
2. **Validación en Tiempo Real**: Implemente validación conforme el usuario escribe
3. **Formateo Automático**: Use las utilidades para formateo consistente
4. **Gestión de Errores**: Implemente manejo robusto de errores
5. **Cache Local**: Aproveche el cache del hook para mejor performance

## Dependencias

- React 18+
- Firebase/Firestore
- Zod para validación
- React Hook Form
- Módulo Countries (para integración)

## Contribuciones

Para contribuir al módulo:

1. Siga la estructura establecida
2. Agregue tests para nuevas funcionalidades
3. Mantenga la documentación actualizada
4. Use TypeScript estricto
5. Siga las convenciones de nomenclatura

---

*📞 Para más información técnica, consulte [API.md](./API.md)*