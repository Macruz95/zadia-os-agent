import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Quote } from '../../types/sales.types';

export const STATUS_CONFIG: Record<Quote['status'], {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: typeof FileText;
  color: string;
}> = {
  draft: { 
    label: 'Borrador', 
    variant: 'secondary', 
    icon: FileText,
    color: 'text-gray-600'
  },
  sent: { 
    label: 'Enviada', 
    variant: 'default', 
    icon: Clock,
    color: 'text-blue-600'
  },
  accepted: { 
    label: 'Aceptada', 
    variant: 'default', 
    icon: CheckCircle,
    color: 'text-green-600'
  },
  rejected: { 
    label: 'Rechazada', 
    variant: 'destructive', 
    icon: XCircle,
    color: 'text-red-600'
  },
  expired: { 
    label: 'Expirada', 
    variant: 'outline', 
    icon: AlertTriangle,
    color: 'text-orange-600'
  },
};