/**
 * ZADIA OS - Tenant Onboarding
 * 
 * Componente para crear la primera empresa/tenant cuando un usuario nuevo
 * no tiene ninguna empresa asociada.
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Zap, ArrowRight, Loader2, LayoutDashboard, Bot, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTenant } from '@/contexts/TenantContext';
import { notificationService } from '@/lib/notifications';

const tenantFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  slug: z
    .string()
    .min(2, 'El identificador debe tener al menos 2 caracteres')
    .max(50, 'El identificador no puede exceder 50 caracteres')
    .regex(
      /^[a-z0-9-]+$/,
      'Solo letras minúsculas, números y guiones'
    ),
});

type TenantFormData = z.infer<typeof tenantFormSchema>;

export function TenantOnboarding() {
  const { createTenant } = useTenant();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove duplicate hyphens
      .slice(0, 50);
    
    form.setValue('slug', slug);
  };

  const onSubmit = async (data: TenantFormData) => {
    setIsSubmitting(true);
    try {
      await createTenant(data.name, data.slug);
      notificationService.success('¡Empresa creada exitosamente! Bienvenido a ZADIA OS.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear la empresa';
      notificationService.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/25 mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido a ZADIA OS
          </h1>
          <p className="text-gray-400">
            Configura tu empresa para comenzar
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-[#161b22] border-gray-800/50">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-cyan-400" />
            </div>
            <CardTitle className="text-white">Crear tu Empresa</CardTitle>
            <CardDescription className="text-gray-400">
              Ingresa los datos de tu empresa para configurar tu espacio de trabajo
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Nombre de la Empresa
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Mi Empresa S.A. de C.V."
                          className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-cyan-500"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleNameChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        El nombre comercial de tu empresa
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Identificador Único
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="text-gray-500 text-sm mr-2">
                            zadia.app/
                          </span>
                          <Input
                            placeholder="mi-empresa"
                            className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-cyan-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        URL única para tu empresa (solo letras, números y guiones)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando empresa...
                    </>
                  ) : (
                    <>
                      Comenzar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-gray-800/30">
            <div className="flex justify-center mb-2">
              <LayoutDashboard className="h-6 w-6 text-cyan-400" />
            </div>
            <p className="text-xs text-gray-400">Dashboard Inteligente</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/30">
            <div className="flex justify-center mb-2">
              <Bot className="h-6 w-6 text-purple-400" />
            </div>
            <p className="text-xs text-gray-400">Asistente IA</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/30">
            <div className="flex justify-center mb-2">
              <Briefcase className="h-6 w-6 text-amber-400" />
            </div>
            <p className="text-xs text-gray-400">CRM Completo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
