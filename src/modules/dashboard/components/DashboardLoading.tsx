/**
 * ZADIA OS - Dashboard Loading State
 * Estado de carga con estética cockpit
 * Rule #2: ShadCN UI + Lucide Icons
 */

'use client';

import { Zap } from 'lucide-react';

export function DashboardLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
          <Zap className="h-5 w-5 text-gray-700" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-40 bg-gray-800 rounded" />
          <div className="h-3 w-32 bg-gray-800/50 rounded" />
        </div>
      </div>

      {/* KPIs Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#161b22] border border-gray-800/50 rounded-xl p-4">
            <div className="h-3 w-16 bg-gray-800 rounded mb-3" />
            <div className="h-7 w-24 bg-gray-800 rounded mb-3" />
            <div className="h-6 w-full bg-gray-800/50 rounded" />
          </div>
        ))}
      </div>

      {/* ZADIA Score + Advisor Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6 h-80">
          <div className="h-4 w-32 bg-gray-800 rounded mb-4" />
          <div className="flex items-center justify-center h-48">
            <div className="w-40 h-40 rounded-full border-4 border-gray-800" />
          </div>
        </div>
        <div className="xl:col-span-2 bg-[#161b22] border border-gray-800/50 rounded-xl p-6 h-80">
          <div className="h-4 w-40 bg-gray-800 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-800/30 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6 h-72">
            <div className="h-4 w-36 bg-gray-800 rounded mb-2" />
            <div className="h-3 w-48 bg-gray-800/50 rounded mb-4" />
            <div className="h-48 bg-gray-800/30 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
