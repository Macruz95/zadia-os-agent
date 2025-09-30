/**
 * ZADIA OS - Municipalities Table Component
 * 
 * Table component for displaying municipalities data
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
import { Edit, Trash2, MoreVertical, Building2, MapPin } from 'lucide-react';
import { Municipality } from '../types/municipalities.types';

interface MunicipalitiesTableProps {
  municipalities: Municipality[];
  loading?: boolean;
  onEdit: (municipality: Municipality) => void;
  onDelete: (municipalityId: string) => void;
  onViewDistricts?: (municipality: Municipality) => void;
  getDepartmentName?: (departmentId: string) => string;
}

export function MunicipalitiesTable({
  municipalities,
  loading = false,
  onEdit,
  onDelete,
  onViewDistricts,
  getDepartmentName
}: MunicipalitiesTableProps) {
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

  if (municipalities.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay municipios
        </h3>
        <p className="text-gray-500">
          No se encontraron municipios que coincidan con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Municipio</TableHead>
            <TableHead>Código Postal</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Coordenadas</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {municipalities.map((municipality) => (
            <TableRow key={municipality.id}>
              <TableCell>
                <div className="font-medium">{municipality.name}</div>
              </TableCell>
              <TableCell>
                {municipality.postalCode ? (
                  <Badge variant="secondary">{municipality.postalCode}</Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-gray-700">
                  {getDepartmentName ? getDepartmentName(municipality.departmentId) : municipality.departmentId}
                </span>
              </TableCell>
              <TableCell>
                {municipality.latitude && municipality.longitude ? (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {municipality.latitude.toFixed(4)}, {municipality.longitude.toFixed(4)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={municipality.isActive ? "default" : "secondary"}
                  className={
                    municipality.isActive
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {municipality.isActive ? "Activo" : "Inactivo"}
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
                    {onViewDistricts && (
                      <DropdownMenuItem
                        onClick={() => onViewDistricts(municipality)}
                        className="cursor-pointer"
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        Ver Distritos
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onEdit(municipality)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(municipality.id)}
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