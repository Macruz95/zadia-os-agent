'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, X, AlertTriangle, Phone } from 'lucide-react';
import { phoneCodeFormSchema, PhoneCodeFormData } from '../validations/phone-codes.schema';
import { usePhoneCodes } from '../hooks/use-phone-codes';
import { useCountries } from '@/modules/countries/hooks/use-countries';
import { PhoneCode } from '../types/phone-codes.types';
import { PhoneCodeUtils } from '../utils/phone-codes.utils';
import { notificationService } from '@/lib/notifications';

interface PhoneCodesFormProps {
  phoneCode?: PhoneCode | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PhoneCodesForm({ phoneCode, onSuccess, onCancel }: PhoneCodesFormProps) {
  const { createPhoneCode, updatePhoneCode, phoneCodes } = usePhoneCodes();
  const { countries } = useCountries();
  const isEditing = !!phoneCode;

  const form = useForm<PhoneCodeFormData>({
    resolver: zodResolver(phoneCodeFormSchema),
    defaultValues: {
      countryId: phoneCode?.countryId || '',
      code: phoneCode?.code || '',
      dialCode: phoneCode?.dialCode || '',
      format: phoneCode?.format || '',
      example: phoneCode?.example || '',
      priority: phoneCode?.priority || 1
    }
  });

  const { handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = form;
  const watchedValues = watch();

  const onSubmit = async (data: PhoneCodeFormData) => {
    try {
      // Validate uniqueness
      if (!PhoneCodeUtils.isCodeUnique(phoneCodes, data.code, phoneCode?.id)) {
        notificationService.error('Ya existe un código telefónico con ese código');
        return;
      }

      const phoneCodeData = {
        ...data,
        isActive: true
      };

      if (isEditing && phoneCode) {
        await updatePhoneCode(phoneCode.id, phoneCodeData);
        notificationService.success('Código telefónico actualizado exitosamente');
      } else {
        await createPhoneCode(phoneCodeData);
        notificationService.success('Código telefónico creado exitosamente');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving phone code', error);
      notificationService.error('Error al guardar el código telefónico');
    }
  };

  // Auto-generate dial code from code
  const handleCodeChange = (code: string) => {
    setValue('code', code);
    
    // Extract dial code (remove + prefix)
    if (code.startsWith('+')) {
      const dialCode = code.substring(1);
      setValue('dialCode', dialCode);
    }
  };

  // Generate example when format changes
  const handleFormatChange = (format: string) => {
    setValue('format', format);
    
    if (format && watchedValues.code) {
      const tempPhoneCode: PhoneCode = {
        id: 'temp',
        countryId: watchedValues.countryId,
        code: watchedValues.code,
        dialCode: watchedValues.dialCode,
        format,
        priority: watchedValues.priority,
        isActive: true
      };
      
      const example = PhoneCodeUtils.generateExample(tempPhoneCode);
      setValue('example', example);
    }
  };

  const selectedCountry = countries.find(c => c.id === watchedValues.countryId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {isEditing ? 'Editar Código Telefónico' : 'Crear Código Telefónico'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Country Selection */}
            <div className="space-y-2">
              <Label htmlFor="countryId">País *</Label>
              <Select
                value={watchedValues.countryId}
                onValueChange={(value) => setValue('countryId', value)}
              >
                <SelectTrigger className={errors.countryId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccionar país..." />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      <div className="flex items-center gap-2">
                        <span>{country.flagEmoji || '🏳️'}</span>
                        <span>{country.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {country.isoCode}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.countryId && (
                <p className="text-sm text-red-600">{errors.countryId.message}</p>
              )}
            </div>

            {/* Phone Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Código Telefónico *</Label>
              <Input
                id="code"
                placeholder="Ej: +51"
                value={watchedValues.code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-600">{errors.code.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Debe comenzar con + seguido del código numérico
              </p>
            </div>

            {/* Dial Code */}
            <div className="space-y-2">
              <Label htmlFor="dialCode">Código de Marcado *</Label>
              <Input
                id="dialCode"
                placeholder="Ej: 51"
                value={watchedValues.dialCode}
                onChange={(e) => setValue('dialCode', e.target.value)}
                className={errors.dialCode ? 'border-red-500' : ''}
              />
              {errors.dialCode && (
                <p className="text-sm text-red-600">{errors.dialCode.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Solo números, sin el símbolo +
              </p>
            </div>

            {/* Format */}
            <div className="space-y-2">
              <Label htmlFor="format">Formato (Opcional)</Label>
              <Input
                id="format"
                placeholder="Ej: +51 ### ### ###"
                value={watchedValues.format}
                onChange={(e) => handleFormatChange(e.target.value)}
                className={errors.format ? 'border-red-500' : ''}
              />
              {errors.format && (
                <p className="text-sm text-red-600">{errors.format.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use # para representar dígitos. Ej: +51 ### ### ###
              </p>
            </div>

            {/* Example */}
            <div className="space-y-2">
              <Label htmlFor="example">Ejemplo (Opcional)</Label>
              <Input
                id="example"
                placeholder="Ej: +51 999 123 456"
                value={watchedValues.example}
                onChange={(e) => setValue('example', e.target.value)}
                className={errors.example ? 'border-red-500' : ''}
              />
              {errors.example && (
                <p className="text-sm text-red-600">{errors.example.message}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={watchedValues.priority?.toString()}
                onValueChange={(value) => setValue('priority', parseInt(value))}
              >
                <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccionar prioridad..." />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((priority) => (
                    <SelectItem key={priority} value={priority.toString()}>
                      {priority} {priority === 1 ? '(Mayor)' : priority === 10 ? '(Menor)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-600">{errors.priority.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Para países con múltiples códigos. 1 = Mayor prioridad
              </p>
            </div>

            {/* Preview */}
            {selectedCountry && watchedValues.code && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Vista previa:</strong><br />
                  País: {selectedCountry.flagEmoji || '🏳️'} {selectedCountry.name}<br />
                  Código: {watchedValues.code}<br />
                  {watchedValues.example && (
                    <>Ejemplo: {watchedValues.example}<br /></>
                  )}
                  Prioridad: {watchedValues.priority || 1}
                </AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEditing ? 'Actualizar' : 'Crear'} Código
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}