/**
 * ZADIA OS - Quotes Directory
 * 
 * Main page for managing sales quotes
 */

'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { useRouter } from 'next/navigation';
import { QuotesPageHeader } from './QuotesPageHeader';
import { QuotesKPICards } from './QuotesKPICards';
import { QuotesFilters } from './QuotesFilters';
import { QuotesTable } from './QuotesTable';
import { QuotesService } from '../../services/quotes.service';
import { Quote } from '../../types/sales.types';
import { toast } from 'sonner';

export function QuotesDirectory() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Quote['status'] | 'all'>('all');

  // Load quotes
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        const data = await QuotesService.getQuotes();
        setQuotes(data);
      } catch (error) {
        logger.error('Error loading quotes', error as Error, {
          component: 'QuotesDirectory',
          action: 'fetchQuotes'
        });
        toast.error('Error al cargar cotizaciones');
      }
    };

    loadQuotes();
  }, []);


  // Filtered quotes
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = !searchQuery || 
      quote.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.notes && quote.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      quote.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <QuotesPageHeader 
        onNewQuote={() => router.push('/sales/quotes/new')} 
      />
      
      <QuotesKPICards quotes={quotes} />
      
      <QuotesFilters 
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
      />
      
      <QuotesTable 
        quotes={filteredQuotes}
        onQuoteClick={(quoteId) => router.push(`/sales/quotes/${quoteId}`)}
      />
    </div>
  );
}