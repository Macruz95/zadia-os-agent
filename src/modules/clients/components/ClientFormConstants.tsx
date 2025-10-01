export const TOTAL_STEPS = 5;

export const getFieldsForStep = (step: number, clientType: string) => {
  switch (step) {
    case 1:
      return ['clientType'];
    case 2:
      return ['name', 'documentId', 'status'];
    case 3:
      return ['address.country', 'address.state', 'address.city'];
    case 4:
      // Para Persona Natural, solo requerir teléfono (email es opcional)
      return clientType === 'PersonaNatural' ? ['contacts.0.phone'] : ['contacts.0.name', 'contacts.0.email'];
    default:
      return [];
  }
};

export const getDefaultFormValues = () => ({
  name: '',
  documentId: '',
  clientType: 'PersonaNatural' as const,
  status: 'Prospecto' as const,
  tags: [],
  communicationOptIn: false,
  address: {
    country: '',
    state: '',
    city: '',
    street: '',
    postalCode: '',
  },
  contacts: [{
    name: '',
    role: '',
    email: '',
    phone: '',
    phoneCountryId: '',
    isPrimary: true,
  }],
});