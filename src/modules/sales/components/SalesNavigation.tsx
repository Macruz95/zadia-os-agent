/**
 * ZADIA OS - Sales Navigation Tabs
 * 
 * Internal navigation for sales module
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, FileText, BarChart3 } from 'lucide-react';

const SALES_TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    href: '/sales',
    icon: BarChart3,
  },
  {
    value: 'leads',
    label: 'Leads',
    href: '/sales/leads',
    icon: Users,
  },
  {
    value: 'opportunities',
    label: 'Oportunidades',
    href: '/sales/opportunities',
    icon: TrendingUp,
  },
  {
    value: 'quotes',
    label: 'Cotizaciones',
    href: '/sales/quotes',
    icon: FileText,
  },
  {
    value: 'analytics',
    label: 'Analytics',
    href: '/sales/analytics',
    icon: TrendingUp,
  },
];

export function SalesNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const getCurrentTab = () => {
    if (pathname === '/sales') return 'dashboard';
    if (pathname.includes('/leads')) return 'leads';
    if (pathname.includes('/opportunities')) return 'opportunities';
    if (pathname.includes('/quotes')) return 'quotes';
    if (pathname.includes('/analytics')) return 'analytics';
    return 'dashboard'; // default
  };

  const handleTabChange = (value: string) => {
    const tab = SALES_TABS.find(t => t.value === value);
    if (tab) {
      router.push(tab.href);
    }
  };

  return (
    <div className="border-b">
      <Tabs value={getCurrentTab()} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5">
          {SALES_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}