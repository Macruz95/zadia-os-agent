'use client';

import { useState, useEffect } from 'react';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface ValidatedInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onValidate: (value: string) => Promise<{ isValid: boolean; error?: string }>;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  debounceMs?: number;
  helperText?: string;
}

export const ValidatedInput = ({
  id,
  label,
  value,
  onChange,
  onValidate,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  debounceMs = 500,
  helperText,
}: ValidatedInputProps) => {
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    // Don't validate empty values or if not touched
    if (!value || !touched) {
      setValidationError(null);
      setIsValid(null);
      return;
    }

    const timer = setTimeout(async () => {
      setValidating(true);
      try {
        const result = await onValidate(value);
        setIsValid(result.isValid);
        setValidationError(result.error || null);
      } catch (error) {
        void error;
        setIsValid(null);
        setValidationError(null);
      } finally {
        setValidating(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, onValidate, debounceMs, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (!touched) setTouched(true);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const getStatusIcon = () => {
    if (!touched || !value) return null;
    if (validating) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    if (isValid === true) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    if (isValid === false) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-10 ${validationError ? 'border-red-500 focus-visible:ring-red-500' : ''} ${
            isValid ? 'border-green-500' : ''
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>
      
      {/* Helper text */}
      {helperText && !validationError && !validating && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {/* Validating message */}
      {validating && (
        <p className="text-xs text-blue-500 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Verificando disponibilidad...
        </p>
      )}

      {/* Success message */}
      {isValid === true && !validating && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Disponible
        </p>
      )}

      {/* Error message */}
      {validationError && !validating && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          {validationError}
        </p>
      )}
    </div>
  );
};
