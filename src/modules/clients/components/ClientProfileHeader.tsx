'use client';

import { Tag, Plus, FileText, Calendar, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Client } from '../types/clients.types';
import { getStatusColor, getClientTypeDisplay } from '../utils/display.utils';
import { calculateAge } from '../utils/age.utils';

interface ClientProfileHeaderProps {
  client: Client;
  onBack?: () => void;
}

export const ClientProfileHeader = ({ client }: ClientProfileHeaderProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg">
                {client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div>
                <h1 className="text-2xl font-bold">{client.name}</h1>
                <p className="text-muted-foreground">{client.documentId}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge className={getStatusColor(client.status)}>
                  {client.status}
                </Badge>
                <span>{getClientTypeDisplay(client.clientType)}</span>
                {client.birthDate && client.clientType === 'PersonaNatural' && (
                  <span>{calculateAge(client.birthDate)} años</span>
                )}
              </div>
              {client.tags.length > 0 && (
                <div className="flex gap-1">
                  {client.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Añadir Interacción
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Crear Cotización
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Reunión
            </Button>
            <Button variant="outline" size="sm">
              <Clock className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};