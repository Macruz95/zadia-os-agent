/**
 * ZADIA OS - Leads Table Component
 * 
 * Displays leads data in a table format with actions
 */

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Lead } from '../../types/sales.types';
import { LeadsTableHeader } from './LeadsTableHeader';
import { LeadsTableRow } from './LeadsTableRow';

interface LeadsTableProps {
  leads: Lead[];
  loading?: boolean;
  totalCount: number;
  onConvertLead: (lead: Lead) => void;
  onDisqualifyLead: (lead: Lead) => void;
}

export function LeadsTable({ 
  leads, 
  loading = false, 
  totalCount, 
  onConvertLead, 
  onDisqualifyLead 
}: LeadsTableProps) {
  const router = useRouter();

  const handleRowClick = (leadId: string) => {
    router.push(`/sales/leads/${leadId}`);
  };

  return (
    <Card>
      <LeadsTableHeader totalCount={totalCount} />
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre/Entidad</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Puntuación</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Cargando leads...
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No se encontraron leads
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <LeadsTableRow
                    key={lead.id}
                    lead={lead}
                    onConvertLead={onConvertLead}
                    onDisqualifyLead={onDisqualifyLead}
                    onRowClick={handleRowClick}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}