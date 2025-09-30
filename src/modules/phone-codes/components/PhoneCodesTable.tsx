'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Phone, 
  Copy, 
  Check,
  Globe,
  Star
} from 'lucide-react';
import { PhoneCode } from '../types/phone-codes.types';
import { Country } from '@/modules/countries/types/countries.types';
import { usePhoneCodes } from '../hooks/use-phone-codes';
import { notificationService } from '@/lib/notifications';

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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      notificationService.success('Código copiado al portapapeles');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      notificationService.error('Error al copiar código');
    }
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
    } catch (error) {
      notificationService.error('Error al eliminar código telefónico');
    } finally {
      setDeleteDialogOpen(false);
      setPhoneCodeToDelete(null);
    }
  };

  const handleRowClick = (phoneCode: PhoneCode) => {
    if (isSelectionMode && onSelect) {
      onSelect(phoneCode);
    }
  };

  if (phoneCodes.length === 0) {
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
                <TableRow 
                  key={phoneCode.id}
                  className={`${
                    isSelectionMode ? 'cursor-pointer hover:bg-muted/50' : ''
                  } ${!phoneCode.isActive ? 'opacity-50' : ''}`}
                  onClick={() => handleRowClick(phoneCode)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flagEmoji || '🏳️'}</span>
                      <Badge variant="outline" className="text-xs">
                        {country.isoCode}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{country.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {phoneCode.code}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(phoneCode.code);
                        }}
                      >
                        {copiedCode === phoneCode.code ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {phoneCode.dialCode}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {phoneCode.format ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {phoneCode.format}
                      </code>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin formato</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {phoneCode.example ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <code className="text-xs">{phoneCode.example}</code>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin ejemplo</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm font-medium">{phoneCode.priority}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={phoneCode.isActive ? "default" : "secondary"}
                      className={phoneCode.isActive ? "bg-green-100 text-green-800" : ""}
                    >
                      {phoneCode.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  {!isSelectionMode && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(phoneCode.code);
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar código
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {onEdit && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(phoneCode);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(phoneCode);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el código telefónico "<strong>{phoneCodeToDelete?.code}</strong>" 
              del país {getCountryInfo(phoneCodeToDelete?.countryId || '').name}.
              <br /><br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}