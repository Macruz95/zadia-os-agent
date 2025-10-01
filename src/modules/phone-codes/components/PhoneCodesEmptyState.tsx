/**
 * Phone Codes Empty State Component
 * Display when no phone codes are available
 */

'use client';

import React from 'react';
import { Phone } from 'lucide-react';

export function PhoneCodesEmptyState() {
  return (
    <div className="text-center py-12">
      <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">No hay códigos telefónicos</h3>
      <p className="text-muted-foreground mb-4">
        No se encontraron códigos telefónicos con los criterios actuales.
      </p>
    </div>
  );
}