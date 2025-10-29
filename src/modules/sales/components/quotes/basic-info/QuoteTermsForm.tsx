import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface QuoteTermsFormProps {
  currency: string;
  validUntil: Date;
  paymentTerms: string;
  onCurrencyChange: (currency: string) => void;
  onValidUntilChange: (date: Date) => void;
  onPaymentTermsChange: (terms: string) => void;
}

export function QuoteTermsForm({
  currency,
  validUntil,
  paymentTerms,
  onCurrencyChange,
  onValidUntilChange,
  onPaymentTermsChange,
}: QuoteTermsFormProps) {
  return (
    <div className="space-y-6">
      {/* Moneda */}
      <div className="space-y-2">
        <Label htmlFor="currency">Moneda *</Label>
        <Select value={currency} onValueChange={onCurrencyChange}>
          <SelectTrigger id="currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD - Dólares</SelectItem>
            <SelectItem value="PYG">PYG - Guaraníes</SelectItem>
            <SelectItem value="BRL">BRL - Reales</SelectItem>
            <SelectItem value="ARS">ARS - Pesos Argentinos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Válido hasta */}
      <div className="space-y-2">
        <Label>Válido hasta *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {validUntil ? (
                format(validUntil, 'PPP', { locale: es })
              ) : (
                <span>Seleccionar fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={validUntil}
              onSelect={(date) => date && onValidUntilChange(date)}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Términos de pago */}
      <div className="space-y-2">
        <Label htmlFor="paymentTerms">Términos de Pago *</Label>
        <Textarea
          id="paymentTerms"
          value={paymentTerms}
          onChange={(e) => onPaymentTermsChange(e.target.value)}
          placeholder="Ej: 30% adelanto, 70% contra entrega"
          rows={3}
        />
      </div>
    </div>
  );
}