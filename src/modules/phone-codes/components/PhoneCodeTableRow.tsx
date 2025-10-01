/**
 * Phone Code Table Row Component
 * Individual row component for phone codes table
 */

'use client';

import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
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
import { notificationService } from '@/lib/notifications';

interface PhoneCodeTableRowProps {
  phoneCode: PhoneCode;
  country: Country;
  onEdit?: (phoneCode: PhoneCode) => void;
  onDelete?: (phoneCode: PhoneCode) => void;
  onSelect?: (phoneCode: PhoneCode) => void;
  isSelectionMode?: boolean;
}

export function PhoneCodeTableRow({
  phoneCode,
  country,
  onEdit,
  onDelete,
  onSelect,
  isSelectionMode = false
}: PhoneCodeTableRowProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      notificationService.success('Código copiado al portapapeles');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      notificationService.error('Error al copiar código');
    }
  };

  const handleRowClick = () => {
    if (isSelectionMode && onSelect) {
      onSelect(phoneCode);
    }
  };

  return (
    <TableRow 
      className={`${
        isSelectionMode ? 'cursor-pointer hover:bg-muted/50' : ''
      } ${!phoneCode.isActive ? 'opacity-50' : ''}`}
      onClick={handleRowClick}
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
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(phoneCode);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )}
    </TableRow>
  );
}