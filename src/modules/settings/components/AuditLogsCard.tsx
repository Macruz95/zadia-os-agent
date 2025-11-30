/**
 * ZADIA OS - Audit Logs Component
 * 
 * View and filter audit logs
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: Max 200-350 lines
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  Search, 
  RefreshCw,
  User,
  Plus,
  Pencil,
  Trash2,
  LogIn,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { 
  getAuditLogs, 
  AuditLogEntry, 
  AuditModule, 
  AuditAction 
} from '@/services/audit-trail.service';

const actionIcons: Record<AuditAction, React.ReactNode> = {
  create: <Plus className="h-4 w-4 text-green-600" />,
  read: <Search className="h-4 w-4 text-blue-600" />,
  update: <Pencil className="h-4 w-4 text-amber-600" />,
  delete: <Trash2 className="h-4 w-4 text-red-600" />,
  login: <LogIn className="h-4 w-4 text-blue-600" />,
  logout: <LogIn className="h-4 w-4 text-gray-600" />,
  export: <Download className="h-4 w-4 text-purple-600" />,
  import: <Download className="h-4 w-4 text-purple-600" />,
  approve: <Plus className="h-4 w-4 text-green-600" />,
  reject: <Trash2 className="h-4 w-4 text-red-600" />,
  send: <Plus className="h-4 w-4 text-blue-600" />,
  archive: <Download className="h-4 w-4 text-gray-600" />,
  restore: <RefreshCw className="h-4 w-4 text-green-600" />,
};

const severityColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-amber-100 text-amber-800',
  critical: 'bg-red-100 text-red-800',
};

const moduleOptions: { value: AuditModule | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos los módulos' },
  { value: 'clients', label: 'Clientes' },
  { value: 'leads', label: 'Leads' },
  { value: 'opportunities', label: 'Oportunidades' },
  { value: 'quotes', label: 'Cotizaciones' },
  { value: 'invoices', label: 'Facturas' },
  { value: 'payments', label: 'Pagos' },
  { value: 'projects', label: 'Proyectos' },
  { value: 'inventory', label: 'Inventario' },
  { value: 'employees', label: 'Empleados' },
  { value: 'settings', label: 'Configuración' },
  { value: 'auth', label: 'Autenticación' },
];

const actionOptions: { value: AuditAction | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas las acciones' },
  { value: 'create', label: 'Crear' },
  { value: 'update', label: 'Actualizar' },
  { value: 'delete', label: 'Eliminar' },
  { value: 'login', label: 'Inicio sesión' },
  { value: 'export', label: 'Exportar' },
];

function formatTimestamp(timestamp: { seconds: number }): string {
  if (!timestamp) return '-';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTimeAgo(timestamp: { seconds: number }): string {
  if (!timestamp) return '-';
  const date = new Date(timestamp.seconds * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Hace un momento';
  if (minutes < 60) return `Hace ${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

export function AuditLogsCard() {
  const { tenant } = useTenant();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<AuditModule | 'all'>('all');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  
  const loadLogs = useCallback(async () => {
    if (!tenant?.id) return;
    
    setLoading(true);
    try {
      const result = await getAuditLogs({
        tenantId: tenant.id,
        module: moduleFilter !== 'all' ? moduleFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
      }, 100);
      
      setLogs(result.logs);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [tenant?.id, moduleFilter, actionFilter]);
  
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);
  
  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.description.toLowerCase().includes(query) ||
      log.userName.toLowerCase().includes(query) ||
      log.userEmail.toLowerCase().includes(query)
    );
  });
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Registro de Auditoría
            </CardTitle>
            <CardDescription>
              Historial de todas las acciones en el sistema
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descripción o usuario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select 
            value={moduleFilter} 
            onValueChange={(v) => setModuleFilter(v as AuditModule | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              {moduleOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={actionFilter} 
            onValueChange={(v) => setActionFilter(v as AuditAction | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Acción" />
            </SelectTrigger>
            <SelectContent>
              {actionOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Logs List */}
        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3 border rounded-lg">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No hay registros</p>
              <p className="text-sm text-muted-foreground">
                Las acciones del sistema aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {actionIcons[log.action] || <AlertTriangle className="h-4 w-4" />}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{log.userName}</span>
                      </div>
                      <span>•</span>
                      <span title={formatTimestamp(log.timestamp)}>
                        {formatTimeAgo(log.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {log.module}
                    </Badge>
                    {log.severity !== 'info' && (
                      <Badge className={severityColors[log.severity]}>
                        {log.severity}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
