'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, History, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MovementHistory } from '@/modules/inventory/components/MovementHistory';

export default function InventoryMovementsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    movementType: '',
    itemType: '',
    limit: 100,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? '' : value
    }));
  };

  return (
    <div className="container mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <History className="h-6 w-6" />
              Historial de Movimientos
            </h1>
            <p className="text-muted-foreground">
              Registro completo de todos los movimientos de inventario
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tipo de Movimiento
              </label>
              <Select
                value={filters.movementType || 'all'}
                onValueChange={(value) => handleFilterChange('movementType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="Entrada">Entrada</SelectItem>
                  <SelectItem value="Salida">Salida</SelectItem>
                  <SelectItem value="Ajuste">Ajuste</SelectItem>
                  <SelectItem value="Merma">Merma</SelectItem>
                  <SelectItem value="Produccion">Producción</SelectItem>
                  <SelectItem value="Venta">Venta</SelectItem>
                  <SelectItem value="Devolucion">Devolución</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Tipo de Ítem
              </label>
              <Select
                value={filters.itemType || 'all'}
                onValueChange={(value) => handleFilterChange('itemType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los ítems" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los ítems</SelectItem>
                  <SelectItem value="raw-material">Materias Primas</SelectItem>
                  <SelectItem value="finished-product">Productos Terminados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Límite de Registros
              </label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) => handleFilterChange('limit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 registros</SelectItem>
                  <SelectItem value="100">100 registros</SelectItem>
                  <SelectItem value="200">200 registros</SelectItem>
                  <SelectItem value="500">500 registros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ movementType: '', itemType: '', limit: 100 })}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movement History */}
      <MovementHistory
        showAll={true}
        limit={filters.limit}
        key={`${filters.movementType}-${filters.itemType}-${filters.limit}`}
      />
    </div>
  );
}