'use client';

import { Trash2, Edit, Phone, Mail, FolderKanban } from 'lucide-react';
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
  onDeleteClient: (client: Client) => void;
  onEditClient?: (client: Client) => void;
}

export function ClientTable({ clients, loading, onClientSelect, onDeleteClient, onEditClient }: ClientTableProps) {
  // Click-to-call handler
  const handleCall = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    window.location.href = `tel:${phone}`;
  };

  // Click-to-email handler
  const handleEmail = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    window.location.href = `mailto:${email}`;
  };

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
              <TableHead>Contacto</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Proyectos</TableHead>
              <TableHead>Creado</TableHead>
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
                  <div className="flex gap-2">
                    {client.address?.country && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleCall(e, client.address.country)}
                        className="text-blue-600 hover:text-blue-700 p-1 h-auto"
                        title="Llamar"
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEmail(e, `cliente-${client.id}@placeholder.com`)}
                      className="text-blue-600 hover:text-blue-700 p-1 h-auto"
                      title="Enviar email"
                    >
                      <Mail className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {client.owner ? (
                    <span className="text-sm">{client.owner}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin asignar</span>
                  )}
                </TableCell>
                <TableCell>
                  {client.activeProjectsCount && client.activeProjectsCount > 0 ? (
                    <Badge variant="secondary" className="gap-1">
                      <FolderKanban className="h-3 w-3" />
                      {client.activeProjectsCount}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(client.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {onEditClient && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClient(client);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClient(client);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}