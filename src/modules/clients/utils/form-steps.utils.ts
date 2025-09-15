import { ClientType } from '../types/clients.types';

export interface FormStep {
  id: number;
  title: string;
  description?: string;
}

export const getFormSteps = (clientType: ClientType): FormStep[] => {
  const baseSteps = [
    {
      id: 1,
      title: 'Tipo de Cliente',
      description: 'Selecciona el tipo de cliente'
    },
    {
      id: 2,
      title: 'Información Básica',
      description: 'Datos principales del cliente'
    },
    {
      id: 3,
      title: 'Dirección',
      description: 'Ubicación del cliente'
    }
  ];

  const contactStep = {
    id: 4,
    title: clientType === 'PersonaNatural' ? 'Contacto Principal (Auto)' : 'Contacto Principal',
    description: clientType === 'PersonaNatural' 
      ? 'Información de contacto (se completa automáticamente)' 
      : 'Información del contacto principal'
  };

  const reviewStep = {
    id: 5,
    title: 'Revisar y Confirmar',
    description: 'Verifica la información antes de guardar'
  };

  return [...baseSteps, contactStep, reviewStep];
};

export const getStepTitles = (clientType: ClientType): string[] => {
  return getFormSteps(clientType).map(step => step.title);
};