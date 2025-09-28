import {
  User,
  Target,
  TrendingUp,
  Trophy,
  AlertCircle
} from 'lucide-react';

export const STAGE_CONFIG = {
  qualified: {
    title: 'Calificado',
    color: 'bg-blue-100 border-blue-300',
    textColor: 'text-blue-700',
    icon: User,
  },
  'proposal-sent': {
    title: 'Propuesta Enviada',
    color: 'bg-yellow-100 border-yellow-300',
    textColor: 'text-yellow-700',
    icon: Target,
  },
  negotiation: {
    title: 'Negociación',
    color: 'bg-orange-100 border-orange-300',
    textColor: 'text-orange-700',
    icon: TrendingUp,
  },
  'closed-won': {
    title: 'Ganada',
    color: 'bg-green-100 border-green-300',
    textColor: 'text-green-700',
    icon: Trophy,
  },
  'closed-lost': {
    title: 'Perdida',
    color: 'bg-red-100 border-red-300',
    textColor: 'text-red-700',
    icon: AlertCircle,
  },
};

export const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-gray-100 text-gray-700 border-gray-300',
};