'use client';

import { useState } from 'react';
import { ContactsService } from '../../modules/clients/services/entities/contacts-entity.service';

export default function DiagnoseContactsPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<string>('');

  const handleDiagnose = async () => {
    setLoading(true);
    setResult('🔍 Iniciando diagnóstico de contactos...\n');

    try {
      await ContactsService.diagnoseContacts(clientId || undefined);
      setResult(prev => prev + '✅ Diagnóstico completado. Revisa la consola del navegador (F12) para ver los resultados detallados.\n');
    } catch (error) {
      setResult(prev => prev + `❌ Error en diagnóstico: ${String(error)}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Diagnóstico de Contactos
          </h1>
          <p className="text-gray-600 mb-6">
            Esta herramienta ayuda a diagnosticar problemas con la colección de contactos en Firebase.
          </p>

          <div className="mb-6">
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
              Client ID (opcional - deja vacío para ver todos los contactos)
            </label>
            <input
              type="text"
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Ingresa el ID del cliente"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleDiagnose}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {loading ? 'Ejecutando diagnóstico...' : 'Ejecutar Diagnóstico'}
          </button>

          {result && (
            <div className="p-4 bg-gray-100 rounded-md mb-6">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}

          <div className="text-sm text-gray-500 space-y-2">
            <p><strong>¿Qué hace este diagnóstico?</strong></p>
            <ul className="text-left list-disc list-inside space-y-1">
              <li>Muestra todos los contactos en la colección</li>
              <li>Verifica la estructura de datos de cada contacto</li>
              <li>Prueba consultas simples y ordenadas</li>
              <li>Ayuda a identificar problemas de índices en Firebase</li>
            </ul>
            <p className="mt-4">
              <strong>Importante:</strong> Abre la consola del navegador (F12 → Console) para ver los resultados detallados del diagnóstico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}