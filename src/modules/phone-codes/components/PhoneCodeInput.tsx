'use client';

import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { CountriesSelect } from '../../countries/components/CountriesSelect';
import { useCountries } from '../../countries/hooks/use-countries';
import { formatPhoneNumber } from '../../countries/utils/countries.utils';

interface PhoneCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  countryId?: string;
  onCountryChange?: (countryId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const PhoneCodeInput = forwardRef<HTMLInputElement, PhoneCodeInputProps>(
  ({ value, onChange, countryId, onCountryChange, placeholder = "Número de teléfono", disabled = false }, ref) => {
    const { getCountryById } = useCountries();
    const selectedCountry = countryId ? getCountryById(countryId) : null;

    const handlePhoneChange = (phoneValue: string) => {
      // If we have a selected country, format the phone number
      if (selectedCountry && phoneValue) {
        const formatted = formatPhoneNumber(phoneValue, selectedCountry);
        onChange(formatted);
      } else {
        onChange(phoneValue);
      }
    };

    return (
      <div className="flex gap-2">
        <div className="w-48 min-w-[192px]">
          <CountriesSelect
            value={countryId}
            onValueChange={onCountryChange || (() => {})}
            placeholder="País"
            disabled={disabled}
          />
        </div>
        <Input
          ref={ref}
          type="tel"
          value={value}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || !countryId}
          className="flex-1 min-w-0"
        />
      </div>
    );
  }
);

PhoneCodeInput.displayName = 'PhoneCodeInput';