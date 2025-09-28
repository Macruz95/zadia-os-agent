import { Label } from '@/components/ui/label';
import { User, Building2 } from 'lucide-react';

interface EntityTypeSelectorProps {
  entityType: 'person' | 'company' | 'institution';
  onEntityTypeChange: (type: 'person' | 'company' | 'institution') => void;
}

export function EntityTypeSelector({ entityType, onEntityTypeChange }: EntityTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Tipo de Entidad</Label>
      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="person"
            name="entityType"
            value="person"
            checked={entityType === 'person'}
            onChange={() => onEntityTypeChange('person')}
            className="w-4 h-4"
          />
          <Label htmlFor="person" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            Persona Individual
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="company"
            name="entityType"
            value="company"
            checked={entityType === 'company'}
            onChange={() => onEntityTypeChange('company')}
            className="w-4 h-4"
          />
          <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer">
            <Building2 className="h-4 w-4" />
            Empresa
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="institution"
            name="entityType"
            value="institution"
            checked={entityType === 'institution'}
            onChange={() => onEntityTypeChange('institution')}
            className="w-4 h-4"
          />
          <Label htmlFor="institution" className="flex items-center gap-2 cursor-pointer">
            <Building2 className="h-4 w-4" />
            Institución
          </Label>
        </div>
      </div>
    </div>
  );
}