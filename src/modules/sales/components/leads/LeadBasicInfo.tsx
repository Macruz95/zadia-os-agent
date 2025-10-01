import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneCodeInput } from '@/modules/phone-codes/components/PhoneCodeInput';

interface LeadBasicInfoProps {
  entityType: 'person' | 'company' | 'institution';
  fullName: string;
  onFullNameChange: (value: string) => void;
  entityName: string;
  onEntityNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  phoneCountryId?: string;
  onPhoneCountryChange?: (countryId: string) => void;
  company: string;
  onCompanyChange: (value: string) => void;
  position: string;
  onPositionChange: (value: string) => void;
}

export function LeadBasicInfo({
  entityType,
  fullName,
  onFullNameChange,
  entityName,
  onEntityNameChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  phoneCountryId,
  onPhoneCountryChange,
  company,
  onCompanyChange,
  position,
  onPositionChange,
}: LeadBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Name Fields */}
      {entityType === 'person' ? (
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="fullName">Nombre Completo *</Label>
          <Input
            id="fullName"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            autoFocus
          />
        </div>
      ) : (
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="entityName">
            {entityType === 'company' ? 'Nombre de la Empresa' : 'Nombre de la Institución'} *
          </Label>
          <Input
            id="entityName"
            placeholder={entityType === 'company' ? 'Nombre de la empresa' : 'Nombre de la institución'}
            value={entityName}
            onChange={(e) => onEntityNameChange(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* Contact Information */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="correo@empresa.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono *</Label>
        <PhoneCodeInput
          value={phone}
          onChange={onPhoneChange}
          countryId={phoneCountryId}
          onCountryChange={onPhoneCountryChange}
          placeholder="Ingrese número de teléfono"
        />
      </div>

      {/* Additional Fields for Person */}
      {entityType === 'person' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              placeholder="Nombre de la empresa"
              value={company}
              onChange={(e) => onCompanyChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              placeholder="Cargo o posición"
              value={position}
              onChange={(e) => onPositionChange(e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}