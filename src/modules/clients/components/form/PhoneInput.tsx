'use client';

import { useState } from 'react';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Phone } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

interface PhoneInputProps {
  value: string;
  countryCode?: string;
  onChange: (phone: string, countryCode: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Lista de países más comunes en LATAM + internacionales
const COUNTRIES: Country[] = [
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷' },
  { code: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮' },
  { code: 'DO', name: 'República Dominicana', dialCode: '+1-809', flag: '🇩🇴' },
  { code: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸' },
];

export const PhoneInput = ({
  value,
  countryCode = 'CO',
  onChange,
  label = 'Teléfono',
  placeholder = 'Ingrese número de teléfono',
  error,
  required = false,
  disabled = false,
}: PhoneInputProps) => {
  const [selectedCountry, setSelectedCountry] = useState(countryCode);
  const [phoneNumber, setPhoneNumber] = useState(value);

  const handleCountryChange = (newCountryCode: string) => {
    setSelectedCountry(newCountryCode);
    const country = COUNTRIES.find(c => c.code === newCountryCode);
    if (country) {
      onChange(phoneNumber, newCountryCode);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters except spaces and dashes
    const cleaned = e.target.value.replace(/[^\d\s-]/g, '');
    setPhoneNumber(cleaned);
    onChange(cleaned, selectedCountry);
  };

  const getFullPhoneNumber = () => {
    const country = COUNTRIES.find(c => c.code === selectedCountry);
    if (country && phoneNumber) {
      return `${country.dialCode} ${phoneNumber}`;
    }
    return phoneNumber;
  };

  const selectedCountryData = COUNTRIES.find(c => c.code === selectedCountry);

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="phone-input">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        {/* Country Selector */}
        <Select value={selectedCountry} onValueChange={handleCountryChange} disabled={disabled}>
          <SelectTrigger className="w-[140px]">
            <SelectValue>
              {selectedCountryData && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedCountryData.flag}</span>
                  <span className="text-sm font-medium">{selectedCountryData.dialCode}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm">{country.name}</span>
                  <span className="text-xs text-muted-foreground">{country.dialCode}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Phone className="w-4 h-4" />
          </div>
          <Input
            id="phone-input"
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`pl-10 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
        </div>
      </div>

      {/* Display full formatted number */}
      {phoneNumber && !error && (
        <p className="text-xs text-muted-foreground">
          Número completo: <span className="font-medium">{getFullPhoneNumber()}</span>
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};
