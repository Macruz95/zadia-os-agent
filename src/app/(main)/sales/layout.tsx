/**
 * ZADIA OS - Sales Layout
 * 
 * Layout with internal navigation for sales module
 */

import { SalesNavigation } from '@/modules/sales/components/SalesNavigation';

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <SalesNavigation />
      {children}
    </div>
  );
}