/**
 * ZADIA OS - Organization Settings Card
 * 
 * Complete organization info and settings management
 * REGLA 1: Real Firebase data
 * REGLA 2: ShadCN UI + Lucide icons
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Building2, 
  Globe, 
  Calendar, 
  DollarSign, 
  Clock, 
  Languages,
  Camera,
  Save,
  Loader2,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Pencil
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { 
  getOrganizationInfo, 
  updateOrganizationInfo,
} from '@/services/settings.service';
import { updateTenant } from '@/modules/tenants/services/tenant.service';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const CURRENCIES = [
  { value: 'USD', label: 'USD - Dólar estadounidense', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'MXN', label: 'MXN - Peso mexicano', symbol: '$' },
  { value: 'COP', label: 'COP - Peso colombiano', symbol: '$' },
  { value: 'CLP', label: 'CLP - Peso chileno', symbol: '$' },
  { value: 'ARS', label: 'ARS - Peso argentino', symbol: '$' },
  { value: 'PEN', label: 'PEN - Sol peruano', symbol: 'S/' },
  { value: 'BRL', label: 'BRL - Real brasileño', symbol: 'R$' },
  { value: 'GBP', label: 'GBP - Libra esterlina', symbol: '£' },
];

const TIMEZONES = [
  { value: 'America/Mexico_City', label: '(GMT-6) Ciudad de México' },
  { value: 'America/Bogota', label: '(GMT-5) Bogotá, Lima' },
  { value: 'America/New_York', label: '(GMT-5) Nueva York' },
  { value: 'America/Los_Angeles', label: '(GMT-8) Los Ángeles' },
  { value: 'America/Sao_Paulo', label: '(GMT-3) São Paulo' },
  { value: 'America/Buenos_Aires', label: '(GMT-3) Buenos Aires' },
  { value: 'Europe/Madrid', label: '(GMT+1) Madrid' },
  { value: 'Europe/London', label: '(GMT+0) Londres' },
  { value: 'UTC', label: '(GMT+0) UTC' },
];

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2025)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2025)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-31)' },
];

export function OrganizationSettingsCard() {
  const { tenant, isAdmin, refreshTenant } = useTenant();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    // Settings
    currency: 'USD',
    timezone: 'America/Mexico_City',
    language: 'es',
    dateFormat: 'DD/MM/YYYY',
    // Extended info
    address: '',
    phone: '',
    email: '',
    taxId: '',
    website: '',
    industry: '',
    employeeCount: '',
    foundedYear: '',
  });

  // Load organization info from Firebase
  useEffect(() => {
    async function loadOrgInfo() {
      if (!tenant?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const info = await getOrganizationInfo(tenant.id);
        
        // Merge tenant data with org info
        setFormData({
          name: tenant.name || '',
          slug: tenant.slug || '',
          currency: tenant.settings?.currency || 'USD',
          timezone: tenant.settings?.timezone || 'America/Mexico_City',
          language: tenant.settings?.language || 'es',
          dateFormat: tenant.settings?.dateFormat || 'DD/MM/YYYY',
          address: info?.address || '',
          phone: info?.phone || '',
          email: info?.email || '',
          taxId: info?.taxId || '',
          website: info?.website || '',
          industry: info?.industry || '',
          employeeCount: info?.employeeCount || '',
          foundedYear: info?.foundedYear || '',
        });
      } catch (error) {
        logger.error('Failed to load organization info', error as Error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadOrgInfo();
  }, [tenant?.id, tenant?.name, tenant?.slug, tenant?.settings]);

  const handleSave = async () => {
    if (!tenant?.id) return;
    
    setIsSaving(true);
    try {
      // Update tenant basic info and settings
      await updateTenant(tenant.id, {
        name: formData.name,
        settings: {
          ...tenant.settings,
          currency: formData.currency,
          timezone: formData.timezone,
          language: formData.language as 'es' | 'en',
          dateFormat: formData.dateFormat,
        },
      });
      
      // Update organization extended info
      await updateOrganizationInfo(tenant.id, {
        name: formData.name,
        slug: formData.slug,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        taxId: formData.taxId,
        website: formData.website,
        industry: formData.industry,
        employeeCount: formData.employeeCount,
        foundedYear: formData.foundedYear,
      });
      
      // Refresh tenant data
      await refreshTenant();
      
      toast.success('Configuración guardada correctamente');
      setShowEditDialog(false);
    } catch (error) {
      logger.error('Failed to save organization settings', error as Error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const planColors = {
    free: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    pro: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    enterprise: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  const planFeatures = {
    free: ['3 usuarios', '1 GB almacenamiento', '10 proyectos', 'Soporte básico'],
    pro: ['15 usuarios', '10 GB almacenamiento', '100 proyectos', 'Soporte prioritario', 'Integraciones'],
    enterprise: ['Usuarios ilimitados', '100 GB almacenamiento', 'Proyectos ilimitados', 'Soporte 24/7', 'API Access', 'White Label'],
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-800/30 border-gray-700/50">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Organization Identity Card */}
        <Card className="bg-gray-800/30 border-gray-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Información de la Organización</CardTitle>
                  <CardDescription>Datos generales de tu empresa</CardDescription>
                </div>
              </div>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-600 hover:bg-gray-700"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Header */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-700/30">
              <Avatar className="h-20 w-20 rounded-xl">
                {tenant?.settings?.branding?.logo ? (
                  <AvatarImage src={tenant.settings.branding.logo} alt={tenant.name} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-2xl rounded-xl">
                  {getInitials(tenant?.name || 'ZO')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{tenant?.name || 'Mi Organización'}</h3>
                  <Badge className={planColors[tenant?.plan || 'free']}>
                    {(tenant?.plan || 'FREE').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  @{tenant?.slug || 'mi-organizacion'}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {formData.industry && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {formData.industry}
                    </span>
                  )}
                  {formData.employeeCount && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {formData.employeeCount} empleados
                    </span>
                  )}
                  {formData.foundedYear && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Fundada en {formData.foundedYear}
                    </span>
                  )}
                </div>
              </div>
              {isAdmin && (
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Camera className="h-4 w-4 text-gray-400" />
                </Button>
              )}
            </div>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Email corporativo</span>
                </div>
                <p className="text-white font-medium">
                  {formData.email || 'No configurado'}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Teléfono</span>
                </div>
                <p className="text-white font-medium">
                  {formData.phone || 'No configurado'}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Dirección</span>
                </div>
                <p className="text-white font-medium">
                  {formData.address || 'No configurada'}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">RFC / NIT / Tax ID</span>
                </div>
                <p className="text-white font-medium">
                  {formData.taxId || 'No configurado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Preferences Card */}
        <Card className="bg-gray-800/30 border-gray-700/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Preferencias Regionales</CardTitle>
                <CardDescription>Configuración de idioma, moneda y formato</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-400">Moneda</span>
                </div>
                <p className="text-white font-medium text-lg">{formData.currency}</p>
                <p className="text-xs text-gray-500">
                  {CURRENCIES.find(c => c.value === formData.currency)?.label.split(' - ')[1] || ''}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Zona horaria</span>
                </div>
                <p className="text-white font-medium text-lg">
                  {TIMEZONES.find(t => t.value === formData.timezone)?.label.split(')')[0]}
                </p>
                <p className="text-xs text-gray-500">
                  {formData.timezone.split('/')[1]?.replace('_', ' ') || 'UTC'}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Idioma</span>
                </div>
                <p className="text-white font-medium text-lg">
                  {LANGUAGES.find(l => l.value === formData.language)?.label || formData.language}
                </p>
                <p className="text-xs text-gray-500">Interfaz del sistema</p>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-gray-400">Formato de fecha</span>
                </div>
                <p className="text-white font-medium text-lg">{formData.dateFormat}</p>
                <p className="text-xs text-gray-500">
                  {formData.dateFormat === 'DD/MM/YYYY' ? '31/12/2025' : 
                   formData.dateFormat === 'MM/DD/YYYY' ? '12/31/2025' : '2025-12-31'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Plan Card */}
        <Card className="bg-gray-800/30 border-gray-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-700 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Plan Actual</CardTitle>
                  <CardDescription>Características y límites de tu suscripción</CardDescription>
                </div>
              </div>
              {isAdmin && (
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                  Actualizar Plan
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['free', 'pro', 'enterprise'] as const).map((plan) => (
                <div 
                  key={plan}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tenant?.plan === plan 
                      ? 'border-cyan-500 bg-cyan-500/10' 
                      : 'border-gray-700/30 bg-gray-900/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={planColors[plan]}>
                      {plan.toUpperCase()}
                    </Badge>
                    {tenant?.plan === plan && (
                      <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                    )}
                  </div>
                  <ul className="space-y-2">
                    {planFeatures[plan].map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Información de la Organización</DialogTitle>
            <DialogDescription>
              Actualiza los datos de tu empresa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Información Básica
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la empresa</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Identificador (slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industria</Label>
                  <Input
                    id="industry"
                    placeholder="Ej: Tecnología, Retail, Servicios..."
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Número de empleados</Label>
                  <Select 
                    value={formData.employeeCount}
                    onValueChange={(v) => setFormData({ ...formData, employeeCount: v })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="500+">500+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Información de Contacto
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email corporativo</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    placeholder="+52 55 1234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  placeholder="Calle, número, colonia, ciudad, país"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">RFC / NIT / Tax ID</Label>
                  <Input
                    id="taxId"
                    placeholder="XAXX010101000"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio web</Label>
                  <Input
                    id="website"
                    placeholder="https://www.empresa.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Regional Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Preferencias Regionales
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select 
                    value={formData.currency}
                    onValueChange={(v) => setFormData({ ...formData, currency: v })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona horaria</Label>
                  <Select 
                    value={formData.timezone}
                    onValueChange={(v) => setFormData({ ...formData, timezone: v })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {TIMEZONES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select 
                    value={formData.language}
                    onValueChange={(v) => setFormData({ ...formData, language: v })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Formato de fecha</Label>
                  <Select 
                    value={formData.dateFormat}
                    onValueChange={(v) => setFormData({ ...formData, dateFormat: v })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {DATE_FORMATS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-gray-600">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
