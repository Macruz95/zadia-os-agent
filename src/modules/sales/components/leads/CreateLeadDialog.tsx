/**
 * ZADIA OS - Create Lead Dialog
 * 
 * Modal component for creating new leads
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Building2, Loader2 } from 'lucide-react';
import { useLeads } from '../../hooks/use-leads';
import { useAuth } from '@/contexts/AuthContext';
import { LeadFormData, leadSchema } from '../../validations/sales.schema';

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const LEAD_SOURCE_OPTIONS = [
  { value: 'web', label: 'Sitio Web' },
  { value: 'referral', label: 'Referido' },
  { value: 'event', label: 'Evento' },
  { value: 'cold-call', label: 'Llamada Fría' },
  { value: 'imported', label: 'Importado' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'hot', label: '🔥 Caliente', description: 'Requiere atención inmediata' },
  { value: 'warm', label: '🟡 Tibio', description: 'Seguimiento regular' },
  { value: 'cold', label: '🧊 Frío', description: 'Contacto ocasional' },
] as const;

export function CreateLeadDialog({ open, onOpenChange, onSuccess }: CreateLeadDialogProps) {
  const { user } = useAuth();
  const { createLead } = useLeads();
  const [loading, setLoading] = useState(false);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      entityType: 'person',
      fullName: '',
      entityName: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      source: 'web',
      priority: 'warm',
      score: 50,
      assignedTo: '',
      notes: '',
    },
  });

  const entityType = form.watch('entityType');

  const onSubmit = async (data: LeadFormData) => {
    if (!user?.uid) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      setLoading(true);
      
      // Set assignedTo to current user if not specified
      const leadData = {
        ...data,
        assignedTo: data.assignedTo || user.uid,
      };
      
      await createLead(leadData, user.uid);
      toast.success('Lead creado exitosamente');
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Error al crear el lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Lead</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Entity Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tipo de Entidad</CardTitle>
                <CardDescription>
                  Selecciona si es una persona individual o una entidad/empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="entityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="person" id="person" />
                            <Label htmlFor="person" className="flex items-center gap-2 cursor-pointer">
                              <User className="h-4 w-4" />
                              Persona Individual
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="company" id="company" />
                            <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer">
                              <Building2 className="h-4 w-4" />
                              Empresa
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {entityType === 'person' ? (
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Carlos López" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="entityName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Empresa *</FormLabel>
                        <FormControl>
                          <Input placeholder="Tecnologías ABC S.A." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="contacto@ejemplo.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono *</FormLabel>
                        <FormControl>
                          <Input placeholder="+595 21 123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {entityType === 'person' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Empresa donde trabaja" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo</FormLabel>
                          <FormControl>
                            <Input placeholder="Gerente de Sistemas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lead Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles del Lead</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuente *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la fuente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LEAD_SOURCE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridad *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la prioridad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>



                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Iniciales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observaciones, contexto del contacto, necesidades específicas..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Priority Info */}
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="text-sm">Información de Prioridades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {PRIORITY_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center gap-3">
                      <Badge variant="outline">{option.label}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear Lead
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}