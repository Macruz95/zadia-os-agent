/**
 * ZADIA OS - Offline Page
 * Displayed when user is offline and page is not cached
 */

'use client';

import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Sin conexión a internet
        </h1>

        {/* Description */}
        <p className="text-gray-400 mb-8">
          Parece que no tienes conexión a internet. Verifica tu conexión e intenta nuevamente.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Reintentar
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Ir al inicio
          </Link>
        </div>

        {/* Additional info */}
        <p className="text-sm text-gray-500 mt-8">
          Algunas funciones pueden estar disponibles sin conexión si ya las has visitado antes.
        </p>
      </div>
    </div>
  );
}
