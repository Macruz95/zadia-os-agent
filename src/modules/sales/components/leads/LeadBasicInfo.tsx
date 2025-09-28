import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
            placeholder="Ej: Juan Carlos Pérez"
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
            placeholder={entityType === 'company' ? 'Ej: Tecnología S.A.' : 'Ej: Universidad Nacional'}
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
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+595 21 123456"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
        />
      </div>

      {/* Additional Fields for Person */}
      {entityType === 'person' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              placeholder="Empresa donde trabaja"
              value={company}
              onChange={(e) => onCompanyChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              placeholder="Director, Gerente, etc."
              value={position}
              onChange={(e) => onPositionChange(e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}