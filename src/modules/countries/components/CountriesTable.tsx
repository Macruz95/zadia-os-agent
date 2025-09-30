/**
 * ZADIA OS - Countries Table Component
 * 
 * Table for displaying countries with actions
 */

import React from 'react';
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
import { Edit, MoreHorizontal, Trash2, Phone, Globe2 } from 'lucide-react';
import { Country } from '../types/countries.types';

interface CountriesTableProps {
  countries: Country[];
  loading?: boolean;
  onEdit: (country: Country) => void;
  onDelete: (countryId: string) => void;
}

export function CountriesTable({
  countries,
  loading = false,
  onEdit,
  onDelete
}: CountriesTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando países...</p>
        </div>
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Globe2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron países
          </h3>
          <p className="text-gray-600">
            No hay países que coincidan con tu búsqueda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Bandera</TableHead>
            <TableHead>País</TableHead>
            <TableHead className="w-20">ISO</TableHead>
            <TableHead className="w-32">Teléfono</TableHead>
            <TableHead className="w-24">Estado</TableHead>
            <TableHead className="w-16">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {countries.map((country) => (
            <TableRow key={country.id}>
              <TableCell>
                <div className="flex items-center justify-center w-8 h-6 text-lg">
                  {country.flagEmoji || '🏳️'}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{country.name}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {country.isoCode}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span className="font-mono text-sm">{country.phoneCode}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={country.isActive ? "default" : "secondary"}
                  className={country.isActive ? "bg-green-100 text-green-800" : ""}
                >
                  {country.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(country)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(country.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}