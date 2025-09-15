'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client } from '../types/clients.types';
import { formatDate, getStatusColor, getClientTypeDisplay } from '../utils/clients.utils';

interface ClientTableProps {
  clients: Client[];
  loading: boolean;
  onClientSelect?: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
}

export function ClientTable({ clients, loading, onClientSelect, onDeleteClient }: ClientTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">Cargando clientes...</div>
        </CardContent>
      </Card>
    );
  }

  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron clientes
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Resultados ({clients.length} clientes)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Última Interacción</TableHead>
              <TableHead>Fecha de Nacimiento</TableHead>
              <TableHead className="w-20">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onClientSelect?.(client)}
              >
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.documentId}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getClientTypeDisplay(client.clientType)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(client.status)}>
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {client.lastInteractionDate
                    ? formatDate(client.lastInteractionDate)
                    : 'Sin interacciones'
                  }
                </TableCell>
                <TableCell>
                  {client.birthDate && client.clientType === 'PersonaNatural'
                    ? formatDate(client.birthDate)
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClient(client.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}