import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Truck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  updateTrackingSchema,
  type UpdateTrackingFormData,
} from '../validations/orders.validation';

interface TrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateTrackingFormData) => Promise<boolean>;
}

export default function TrackingDialog({
  open,
  onOpenChange,
  onSubmit,
}: TrackingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateTrackingFormData>({
    resolver: zodResolver(updateTrackingSchema),
  });

  /**
   * Manejar envío del formulario
   */
  const onSubmitForm = async (data: UpdateTrackingFormData) => {
    setIsSubmitting(true);
    const success = await onSubmit(data);
    setIsSubmitting(false);

    if (success) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Agregar información de envío
          </DialogTitle>
          <DialogDescription>
            Ingresa los datos del envío para que el cliente pueda rastrear
            su pedido
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          {/* Carrier */}
          <div className="space-y-2">
            <Label htmlFor="carrier">Paquetería *</Label>
            <Input
              id="carrier"
              placeholder="Ej: FedEx, DHL, UPS"
              {...register('carrier')}
            />
            {errors.carrier && (
              <p className="text-sm text-destructive">
                {errors.carrier.message}
              </p>
            )}
          </div>

          {/* Tracking Number */}
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Número de guía *</Label>
            <Input
              id="trackingNumber"
              placeholder="Ej: 1234567890"
              {...register('trackingNumber')}
            />
            {errors.trackingNumber && (
              <p className="text-sm text-destructive">
                {errors.trackingNumber.message}
              </p>
            )}
          </div>

          {/* Tracking URL */}
          <div className="space-y-2">
            <Label htmlFor="trackingUrl">URL de rastreo (opcional)</Label>
            <Input
              id="trackingUrl"
              type="url"
              placeholder="https://..."
              {...register('trackingUrl')}
            />
            {errors.trackingUrl && (
              <p className="text-sm text-destructive">
                {errors.trackingUrl.message}
              </p>
            )}
          </div>

          {/* Estimated Delivery */}
          <div className="space-y-2">
            <Label htmlFor="estimatedDelivery">
              Fecha estimada de entrega (opcional)
            </Label>
            <Input
              id="estimatedDelivery"
              type="date"
              {...register('estimatedDelivery', {
                setValueAs: (v) => (v ? new Date(v) : undefined),
              })}
            />
            {errors.estimatedDelivery && (
              <p className="text-sm text-destructive">
                {errors.estimatedDelivery.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
