/**
 * ZADIA OS - Invite Member Dialog
 * 
 * Dialog for inviting new members to the tenant
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 3: Zod validation
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send, UserPlus } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { createInvitation } from '@/modules/tenants/services/tenant-member.service';
import { toast } from 'sonner';

const inviteFormSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  role: z.enum(['admin', 'manager', 'member', 'viewer'], {
    required_error: 'Selecciona un rol',
  }),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

const ROLES = [
  { value: 'admin', label: 'Administrador', description: 'Acceso completo excepto facturación' },
  { value: 'manager', label: 'Gerente', description: 'Supervisión y aprobación' },
  { value: 'member', label: 'Miembro', description: 'Acceso estándar' },
  { value: 'viewer', label: 'Solo lectura', description: 'Solo puede ver información' },
];

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSent?: () => void;
}

export function InviteMemberDialog({ 
  open, 
  onOpenChange,
  onInviteSent 
}: InviteMemberDialogProps) {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    if (!tenant?.id || !user?.uid) {
      toast.error('Error de autenticación');
      return;
    }

    setIsSubmitting(true);
    try {
      await createInvitation(
        tenant.id,
        { email: values.email, role: values.role },
        user.uid,
        user.displayName || user.email || 'Usuario'
      );

      toast.success('Invitación enviada', {
        description: `Se envió una invitación a ${values.email}`,
      });

      form.reset();
      onOpenChange(false);
      onInviteSent?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al enviar invitación', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-cyan-400" />
            Invitar Miembro
          </DialogTitle>
          <DialogDescription>
            Envía una invitación por email para unirse a {tenant?.name || 'la organización'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@ejemplo.com"
                      type="email"
                      className="bg-gray-800 border-gray-700 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {ROLES.map((role) => (
                        <SelectItem 
                          key={role.value} 
                          value={role.value}
                          className="text-white focus:bg-gray-700"
                        >
                          <div>
                            <p className="font-medium">{role.label}</p>
                            <p className="text-xs text-gray-400">{role.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-gray-500">
                    El usuario podrá cambiar su rol después
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar invitación
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
