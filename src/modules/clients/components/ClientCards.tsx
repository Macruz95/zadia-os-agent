'use client';

import { Building, User, Users as UsersIcon, MapPin, Calendar, TrendingUp, FolderKanban } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Client } from '../types/clients.types';
import { getStatusColor, getClientTypeDisplay } from '../utils/display.utils';
import { formatDate } from '../utils/date.utils';

interface ClientCardsProps {
  clients: Client[];
  loading: boolean;
  onClientSelect?: (client: Client) => void;
}

export const ClientCards = ({ clients, loading, onClientSelect }: ClientCardsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <UsersIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-lg text-muted-foreground">No se encontraron clientes</p>
      </div>
    );
  }

  const getClientIcon = (clientType: string) => {
    switch (clientType) {
      case 'PersonaNatural':
        return <User className="w-5 h-5" />;
      case 'Empresa':
        return <Building className="w-5 h-5" />;
      case 'Organización':
        return <UsersIcon className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {clients.map((client) => (
        <Card
          key={client.id}
          className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] group"
          onClick={() => onClientSelect?.(client)}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header with Avatar and Name */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-offset-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                    <AvatarFallback className="text-base font-semibold">
                      {client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                      {client.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{client.documentId}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(client.status)} variant="default">
                  {client.status}
                </Badge>
              </div>

              {/* Client Type */}
              <div className="flex items-center gap-2 text-sm">
                <div className="text-muted-foreground">
                  {getClientIcon(client.clientType)}
                </div>
                <span className="text-muted-foreground font-medium">
                  {getClientTypeDisplay(client.clientType)}
                </span>
              </div>

              {/* Location */}
              {client.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {client.address.city}, {client.address.country}
                  </span>
                </div>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                {/* Projects */}
                <div className="flex items-center gap-2 text-xs">
                  <FolderKanban className="w-3 h-3 text-indigo-600" />
                  <span className="text-muted-foreground">
                    {client.activeProjectsCount || 0} proyectos
                  </span>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3 h-3 text-slate-600" />
                  <span className="text-muted-foreground truncate">
                    {formatDate(client.createdAt)}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {client.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {client.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      +{client.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Owner */}
              {client.owner && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <TrendingUp className="w-3 h-3" />
                  <span>Vendedor: <span className="font-medium text-foreground">{client.owner}</span></span>
                </div>
              )}

              {/* Actions (visible on hover) */}
              <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Ver Detalles
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
