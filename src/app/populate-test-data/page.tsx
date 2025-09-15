'use client';

import { useState } from 'react';
import { populateTestData } from '../../modules/clients/services/populate-test-data';

export default function PopulateTestDataPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handlePopulateData = async () => {
    setLoading(true);
    setResult('🚀 Iniciando población de datos de prueba...\n');

    try {
      const response = await populateTestData();
      if (response.success) {
        setResult(prev => prev + '✅ Datos de prueba creados exitosamente!\n');
        setResult(prev => prev + `📋 ID del cliente de prueba: ${response.clientId}\n`);
        setResult(prev => prev + '💡 Ahora puedes ver este cliente en la aplicación\n');
      } else {
        setResult(prev => prev + `❌ Error: ${response.error}\n`);
      }
    } catch (error) {
      setResult(prev => prev + `❌ Error inesperado: ${String(error)}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Poblar Datos de Prueba
          </h1>
          <p className="text-gray-600 mb-6">
            Esta página crea datos de prueba para verificar que la funcionalidad de contactos funciona correctamente.
          </p>

          <button
            onClick={handlePopulateData}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando datos...' : 'Crear Datos de Prueba'}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <p>Después de crear los datos, ve a la página de clientes para ver el cliente de prueba con sus contactos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}