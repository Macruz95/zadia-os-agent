/**
 * Phone Code Delete Dialog Component
 * Confirmation dialog for deleting phone codes
 */

'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PhoneCode } from '../types/phone-codes.types';
import { Country } from '@/modules/countries/types/countries.types';

interface PhoneCodeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneCode: PhoneCode | null;
  country: Country | null;
  onConfirm: () => void;
}

export function PhoneCodeDeleteDialog({
  open,
  onOpenChange,
  phoneCode,
  country,
  onConfirm
}: PhoneCodeDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará el código telefónico "<strong>{phoneCode?.code}</strong>" 
            del país {country?.name}.
            <br /><br />
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}