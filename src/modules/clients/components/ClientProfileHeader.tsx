'use client';

import { Tag, Phone, Mail, FileText, FolderPlus, Calendar, Edit } from 'lucide-react';
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
  onEdit?: () => void;
  onCreateQuote?: () => void;
  onCreateProject?: () => void;
  onScheduleMeeting?: () => void;
}

export const ClientProfileHeader = ({
  client,
  onEdit,
  onCreateQuote,
  onCreateProject,
  onScheduleMeeting,
}: ClientProfileHeaderProps) => {
  // Click-to-call handler - TODO: Integrar con sistema CTI cuando esté disponible
  const handleCall = () => {
    if (client.address?.country) {
      window.location.href = `tel:${client.address.country}`;
    }
  };

  // Click-to-email handler - TODO: Obtener email del contacto principal
  const handleEmail = () => {
    // Por ahora usa el ID como placeholder - en producción obtener email del contacto
    const email = `cliente-${client.id}@placeholder.com`;
    window.location.href = `mailto:${email}`;
  };
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
            <Button variant="outline" size="sm" onClick={handleCall}>
              <Phone className="w-4 h-4 mr-2" />
              Llamar
            </Button>
            <Button variant="outline" size="sm" onClick={handleEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={onCreateQuote}>
              <FileText className="w-4 h-4 mr-2" />
              Cotización
            </Button>
            <Button variant="outline" size="sm" onClick={onCreateProject}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Proyecto
            </Button>
            <Button variant="outline" size="sm" onClick={onScheduleMeeting}>
              <Calendar className="w-4 h-4 mr-2" />
              Reunión
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};