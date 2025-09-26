'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hammer, Package } from 'lucide-react';
import { RawMaterialForm } from './forms/RawMaterialForm';
import { FinishedProductForm } from './forms/FinishedProductForm';

export function CreateItemPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'raw-material' | 'finished-product'>('raw-material');

  const handleSuccess = () => {
    router.push('/inventory');
  };

  const handleCancel = () => {
    router.push('/inventory');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Agregar Nuevo Ítem</h1>
          <p className="text-muted-foreground">
            Crea una nueva materia prima o producto terminado
          </p>
        </div>
      </div>

      {/* Form Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Ítem</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'raw-material' | 'finished-product')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="raw-material" className="flex items-center gap-2">
                <Hammer className="h-4 w-4" />
                Materia Prima
              </TabsTrigger>
              <TabsTrigger value="finished-product" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Producto Terminado
              </TabsTrigger>
            </TabsList>

            <TabsContent value="raw-material" className="mt-6">
              <RawMaterialForm 
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </TabsContent>

            <TabsContent value="finished-product" className="mt-6">
              <FinishedProductForm 
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}