'use client';

import { Card, CardContent } from '@/components/ui/card';

interface MovementHistoryStatesProps {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
}

export function MovementHistoryStates({ loading, error, isEmpty }: MovementHistoryStatesProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            Cargando historial de movimientos...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-red-600">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            No hay movimientos registrados
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}