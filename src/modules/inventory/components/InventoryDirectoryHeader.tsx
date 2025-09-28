import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InventoryDirectoryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
}

export function InventoryDirectoryHeader({ 
  searchQuery, 
  onSearchChange, 
  onRefresh 
}: InventoryDirectoryHeaderProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-muted-foreground">Gestiona tus materias primas y productos terminados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh}>
            Actualizar
          </Button>
          <Button onClick={() => router.push('/inventory/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Item
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en inventario..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}