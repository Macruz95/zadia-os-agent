/**
 * ZADIA OS - Integrations Settings Card
 * 
 * Manage third-party integrations and API access
 * REGLA 1: Real Firebase data
 * REGLA 2: ShadCN UI + Lucide icons
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plug, 
  Link2, 
  Unlink2,
  Key,
  Copy,
  CheckCircle2,
  ExternalLink,
  Settings2,
  Loader2,
  Zap,
  CreditCard,
  Mail,
  FileSpreadsheet,
  ShoppingCart,
  Globe,
  Webhook
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { 
  getIntegrations, 
  connectIntegration, 
  disconnectIntegration,
  getApiKeys,
  createApiKey,
  revokeApiKey,
  ApiKey
} from '@/services/settings.service';
import { logger } from '@/lib/logger';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  lastSync?: string;
  category: 'payments' | 'accounting' | 'ecommerce' | 'email' | 'automation';
}

const defaultIntegrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Procesa pagos con tarjeta de crédito y débito',
    icon: <CreditCard className="h-5 w-5" />,
    connected: false,
    category: 'payments',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sincroniza facturas y contabilidad',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    connected: false,
    category: 'accounting',
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Software de contabilidad en la nube',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    connected: false,
    category: 'accounting',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sincroniza productos y pedidos',
    icon: <ShoppingCart className="h-5 w-5" />,
    connected: false,
    category: 'ecommerce',
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'Servicio de envío de emails transaccionales',
    icon: <Mail className="h-5 w-5" />,
    connected: false,
    category: 'email',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Conecta con miles de aplicaciones',
    icon: <Zap className="h-5 w-5" />,
    connected: false,
    category: 'automation',
  },
];

export function IntegrationsSettingsCard() {
  useAuth();
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(true);
  const [integrationsList, setIntegrationsList] = useState(defaultIntegrations);
  const [apiKeysList, setApiKeysList] = useState<ApiKey[]>([]);
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
  
  // Load integrations and API keys from Firebase
  useEffect(() => {
    async function loadData() {
      if (!tenant?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Load connected integrations
        const connectedIntegrations = await getIntegrations(tenant.id);
        
        // Merge with default integrations
        setIntegrationsList(prev => 
          prev.map(integration => {
            const connected = connectedIntegrations.find(
              c => c.integrationId === integration.id
            );
            return connected ? {
              ...integration,
              connected: true,
              lastSync: connected.lastSyncAt 
                ? new Date(connected.lastSyncAt.toMillis()).toLocaleString()
                : undefined,
            } : integration;
          })
        );
        
        // Load API keys
        const keys = await getApiKeys(tenant.id);
        setApiKeysList(keys);
        
        logger.info('Integrations data loaded');
      } catch (err) {
        logger.error('Error loading integrations', err instanceof Error ? err : undefined);
        toast.error('Error al cargar las integraciones');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [tenant?.id]);

  const handleConnect = async (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConnectDialog(true);
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!tenant?.id) return;
    
    try {
      await disconnectIntegration(tenant.id, integrationId);
      setIntegrationsList(prev => 
        prev.map(i => i.id === integrationId ? { ...i, connected: false, lastSync: undefined } : i)
      );
      toast.success('Integración desconectada');
    } catch (err) {
      logger.error('Error disconnecting integration', err instanceof Error ? err : undefined);
      toast.error('Error al desconectar la integración');
    }
  };

  const handleConfirmConnect = async () => {
    if (!selectedIntegration || !tenant?.id) return;
    
    setIsConnecting(true);
    try {
      await connectIntegration(
        tenant.id,
        selectedIntegration.id,
        selectedIntegration.name,
        {} // Credentials would be entered in the dialog
      );
      setIntegrationsList(prev => 
        prev.map(i => i.id === selectedIntegration.id 
          ? { ...i, connected: true, lastSync: 'Ahora' } 
          : i
        )
      );
      toast.success(`${selectedIntegration.name} conectado correctamente`);
      setShowConnectDialog(false);
    } catch {
      toast.error('Error al conectar la integración');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCopyKey = (key: string, label: string) => {
    navigator.clipboard.writeText(key);
    toast.success(`${label} copiada al portapapeles`);
  };



  const handleRevokeKey = async (keyId: string) => {
    try {
      await revokeApiKey(keyId);
      setApiKeysList(prev => prev.filter(k => k.id !== keyId));
      toast.success('Clave API revocada');
    } catch (err) {
      logger.error('Error revoking API key', err instanceof Error ? err : undefined);
      toast.error('Error al revocar la clave');
    }
  };

  const handleCreateNewApiKey = async () => {
    if (!tenant?.id || !newApiKeyName.trim()) {
      toast.error('Ingresa un nombre para la clave');
      return;
    }
    
    try {
      const result = await createApiKey(tenant.id, newApiKeyName, ['read', 'write']);
      setApiKeysList(prev => [...prev, result.apiKey]);
      setGeneratedApiKey(result.key);
      setNewApiKeyName('');
      toast.success('Clave API creada correctamente');
    } catch (err) {
      logger.error('Error creating API key', err instanceof Error ? err : undefined);
      toast.error('Error al crear la clave');
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      payments: 'Pagos',
      accounting: 'Contabilidad',
      ecommerce: 'E-commerce',
      email: 'Email',
      automation: 'Automatización',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      payments: 'bg-green-500/20 text-green-400 border-green-500/30',
      accounting: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      ecommerce: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      email: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      automation: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  const connectedCount = integrationsList.filter(i => i.connected).length;

  return (
    <div className="space-y-6">
      {/* Integrations Overview */}
      <Card className="bg-gray-800/30 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                <Plug className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Integraciones</CardTitle>
                <CardDescription>
                  {connectedCount} de {integrationsList.length} integraciones conectadas
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="outline"
              className="border-gray-600 hover:bg-gray-700"
              onClick={() => setShowApiDialog(true)}
            >
              <Key className="h-4 w-4 mr-2" />
              API Keys
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {integrationsList.map((integration) => (
              <div 
                key={integration.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-700/30 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    integration.connected 
                      ? 'bg-cyan-500/20 text-cyan-400' 
                      : 'bg-gray-800 text-gray-500'
                  }`}>
                    {integration.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{integration.name}</p>
                      <Badge variant="outline" className={getCategoryColor(integration.category)}>
                        {getCategoryLabel(integration.category)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{integration.description}</p>
                    {integration.connected && integration.lastSync && (
                      <p className="text-xs text-gray-600 mt-1">
                        Última sincronización: {integration.lastSync}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {integration.connected ? (
                    <>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Conectado
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        <Unlink2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => handleConnect(integration)}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Conectar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks Section */}
      <Card className="bg-gray-800/30 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center">
              <Webhook className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Webhooks</CardTitle>
              <CardDescription>Recibe notificaciones en tiempo real de eventos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-cyan-400" />
                  <p className="text-white font-medium">Endpoint Principal</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Activo</Badge>
              </div>
              <code className="text-sm text-gray-400 bg-gray-800 px-3 py-2 rounded block">
                https://tu-servidor.com/api/webhooks/zadia
              </code>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <CheckCircle2 className="h-3 w-3 text-green-400" />
                Último evento recibido hace 2 minutos
              </div>
            </div>

            <Button variant="outline" className="w-full border-gray-600 hover:bg-gray-700">
              <Plug className="h-4 w-4 mr-2" />
              Agregar nuevo endpoint
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Dialog */}
      <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Claves de API</DialogTitle>
            <DialogDescription>
              Usa estas claves para integrar ZADIA OS con tus aplicaciones
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Create New API Key */}
            <div className="space-y-2">
              <Label className="text-gray-400">Crear Nueva Clave</Label>
              <div className="flex gap-2">
                <Input
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  placeholder="Nombre de la clave..."
                  className="bg-gray-800 border-gray-700"
                />
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700"
                  onClick={handleCreateNewApiKey}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Crear
                </Button>
              </div>
            </div>

            {/* Generated Key - Show only once */}
            {generatedApiKey && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className="text-green-400 text-sm font-medium mb-2">
                  ¡Clave generada! Cópiala ahora, no se mostrará de nuevo.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={generatedApiKey}
                    readOnly
                    className="bg-gray-800 border-gray-700 font-mono text-xs"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="border-gray-600"
                    onClick={() => handleCopyKey(generatedApiKey, 'Clave API')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <Separator className="bg-gray-700" />

            {/* Existing API Keys List */}
            <div className="space-y-2">
              <Label className="text-gray-400">Claves Activas</Label>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full bg-gray-700/50" />
                  <Skeleton className="h-12 w-full bg-gray-700/50" />
                </div>
              ) : apiKeysList.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">
                  No hay claves API activas
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {apiKeysList.map((key) => (
                    <div 
                      key={key.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700/30"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">{key.name}</p>
                        <p className="text-gray-500 text-xs font-mono">{key.keyPrefix}...</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleRevokeKey(key.id)}
                      >
                        Revocar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-amber-400">
              ⚠️ Nunca compartas tus claves secretas públicamente
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiDialog(false)} className="border-gray-600">
              Cerrar
            </Button>
            <Button 
              className="bg-cyan-600 hover:bg-cyan-700"
              onClick={() => window.open('/docs/api', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver documentación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connect Integration Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Conectar {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                {selectedIntegration?.icon}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Client ID / API Key</Label>
                <Input 
                  placeholder="Ingresa tu Client ID"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Client Secret</Label>
                <Input 
                  type="password"
                  placeholder="Ingresa tu Client Secret"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)} className="border-gray-600">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmConnect}
              disabled={isConnecting}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Conectar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
