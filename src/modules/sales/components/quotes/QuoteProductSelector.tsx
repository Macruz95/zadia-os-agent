/**
 * ZADIA OS - Quote Product Selector Component
 * 
 * Component for searching and selecting products from inventory to add to quote
 * 
 * @component
 */

'use client';

import { useState } from 'react';
import { Search, Plus, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProductSearch, type QuoteProduct } from '@/modules/sales/hooks/use-product-search';

interface QuoteProductSelectorProps {
  onProductSelect: (product: QuoteProduct) => void;
  selectedProductIds?: string[];
}

export function QuoteProductSelector({
  onProductSelect,
  selectedProductIds = [],
}: QuoteProductSelectorProps) {
  const { products, loading, error, searchProducts } = useProductSearch();
  const [searchQuery, setSearchQuery] = useState('');

  // Don't auto-load - wait for user to search explicitly
  // This prevents auth errors when component mounts before user is ready

  const handleSearch = () => {
    searchProducts(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const isProductSelected = (productId: string) => {
    return selectedProductIds.includes(productId);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos por nombre o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Buscando...
            </>
          ) : (
            'Buscar'
          )}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Products Table */}
      {products.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="w-[100px]">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const selected = isProductSelected(product.id);
                return (
                  <TableRow key={product.id} className={selected ? 'bg-accent/50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.type === 'finished-product' ? 'default' : 'secondary'}>
                        {product.type === 'finished-product' ? 'Producto' : 'Materia Prima'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={product.currentStock > 0 ? 'text-foreground' : 'text-destructive'}>
                        {product.currentStock}
                      </span>
                    </TableCell>
                    <TableCell>{product.unitOfMeasure}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(product.unitPrice)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={selected ? 'secondary' : 'default'}
                        onClick={() => onProductSelect(product)}
                        disabled={selected}
                      >
                        {selected ? (
                          'Agregado'
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : !loading && !error ? (
        <Alert>
          <Package className="h-4 w-4" />
          <AlertDescription>
            {products.length === 0 && searchQuery 
              ? 'No se encontraron productos. Intenta con otro término de búsqueda.'
              : 'Ingresa un término de búsqueda o haz clic en "Buscar" para ver todos los productos disponibles.'}
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Loading State */}
      {loading && products.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
