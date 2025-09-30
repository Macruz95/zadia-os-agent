/**
 * ZADIA OS - Districts Table Component
 * 
 * Table component for displaying districts data
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, MoreVertical, MapPin } from 'lucide-react';
import { District } from '../types/districts.types';

interface DistrictsTableProps {
  districts: District[];
  loading?: boolean;
  onEdit: (district: District) => void;
  onDelete: (districtId: string) => void;
  getMunicipalityName?: (municipalityId: string) => string;
}

export function DistrictsTable({
  districts,
  loading = false,
  onEdit,
  onDelete,
  getMunicipalityName
}: DistrictsTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (districts.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay distritos
        </h3>
        <p className="text-gray-500">
          No se encontraron distritos que coincidan con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Distrito</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Municipio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[70px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {districts.map((district) => (
            <TableRow key={district.id}>
              <TableCell>
                <div className="font-medium">{district.name}</div>
              </TableCell>
              <TableCell>
                {district.code ? (
                  <Badge variant="secondary">{district.code}</Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-gray-700">
                  {getMunicipalityName ? getMunicipalityName(district.municipalityId) : district.municipalityId}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={district.isActive ? "default" : "secondary"}
                  className={
                    district.isActive
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {district.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEdit(district)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(district.id)}
                      className="cursor-pointer text-red-600 focus:text-red-600"
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