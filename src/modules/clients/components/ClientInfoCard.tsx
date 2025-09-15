'use client';

import { Calendar, MapPin, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Client } from '../types/clients.types';
import { formatDate } from '../utils/clients.utils';

interface ClientInfoCardProps {
  client: Client;
}

export const ClientInfoCard = ({ client }: ClientInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Información General</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{client.address.street}, {client.address.city}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>Cliente desde {formatDate(client.createdAt)}</span>
          </div>
          {client.lastInteractionDate && (
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span>Última interacción {formatDate(client.lastInteractionDate)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};