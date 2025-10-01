'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PhoneCode } from '../types/phone-codes.types';
import { Country } from '@/modules/countries/types/countries.types';
import { usePhoneCodes } from '../hooks/use-phone-codes';
import { notificationService } from '@/lib/notifications';
import { PhoneCodeTableRow } from './PhoneCodeTableRow';
import { PhoneCodesEmptyState } from './PhoneCodesEmptyState';
import { PhoneCodeDeleteDialog } from './PhoneCodeDeleteDialog';

interface PhoneCodesTableProps {
  phoneCodes: PhoneCode[];
  countries: Country[];
  onEdit?: (phoneCode: PhoneCode) => void;
  onSelect?: (phoneCode: PhoneCode) => void;
  onRefresh?: () => void;
  isSelectionMode?: boolean;
}

export function PhoneCodesTable({ 
  phoneCodes, 
  countries, 
  onEdit, 
  onSelect,
  onRefresh,
  isSelectionMode = false 
}: PhoneCodesTableProps) {
  const { deletePhoneCode } = usePhoneCodes();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [phoneCodeToDelete, setPhoneCodeToDelete] = useState<PhoneCode | null>(null);

  const getCountryInfo = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country || { 
      id: countryId, 
      name: countryId, 
      flagEmoji: '🏳️', 
      isoCode: countryId,
      phoneCode: '',
      isActive: true
    };
  };

  const handleDeleteClick = (phoneCode: PhoneCode) => {
    setPhoneCodeToDelete(phoneCode);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!phoneCodeToDelete) return;

    try {
      await deletePhoneCode(phoneCodeToDelete.id);
      notificationService.success('Código telefónico eliminado exitosamente');
      if (onRefresh) {
        onRefresh();
      }
    } catch {
      notificationService.error('Error al eliminar código telefónico');
    } finally {
      setDeleteDialogOpen(false);
      setPhoneCodeToDelete(null);
    }
  };

  if (phoneCodes.length === 0) {
    return <PhoneCodesEmptyState />;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">País</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-[120px]">Código</TableHead>
              <TableHead className="w-[100px]">Marcado</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead>Ejemplo</TableHead>
              <TableHead className="w-[100px]">Prioridad</TableHead>
              <TableHead className="w-[80px]">Estado</TableHead>
              {!isSelectionMode && <TableHead className="w-[70px]">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {phoneCodes.map((phoneCode) => {
              const country = getCountryInfo(phoneCode.countryId);
              return (
                <PhoneCodeTableRow
                  key={phoneCode.id}
                  phoneCode={phoneCode}
                  country={country}
                  onEdit={onEdit}
                  onDelete={handleDeleteClick}
                  onSelect={onSelect}
                  isSelectionMode={isSelectionMode}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>

      <PhoneCodeDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        phoneCode={phoneCodeToDelete}
        country={phoneCodeToDelete ? getCountryInfo(phoneCodeToDelete.countryId) : null}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}