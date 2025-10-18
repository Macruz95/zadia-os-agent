// src/app/(main)/finance/invoices/new/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { InvoicesService } from '@/modules/finance/services/invoices.service';
import { QuotesService } from '@/modules/sales/services/quotes.service';
import { OrdersService } from '@/modules/orders/services/orders.service';
import { useAuth } from '@/contexts/AuthContext';
import type { InvoiceItem } from '@/modules/finance/types/finance.types';

interface InvoiceFormData {
  clientId: string;
  clientName: string;
  quoteId?: string;
  quoteNumber?: string;
  orderId?: string;
  orderNumber?: string;
  projectId?: string;
  items: InvoiceItem[];
  currency: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
}

/**
 * Formulario de creación de facturas
 * Soporta pre-llenado desde cotizaciones con ?quoteId=xxx
 */
export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [formData, setFormData] = useState<InvoiceFormData>({
    clientId: '',
    clientName: '',
    items: [
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        subtotal: 0,
        unitOfMeasure: 'pza',
      },
    ],
    currency: 'USD',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'), // +30 días
    paymentTerms: '30 días',
    notes: '',
  });

  const [taxes] = useState<Record<string, number>>({
    IVA: 16,
  });

  // Cargar cotización o pedido si viene en URL
  useEffect(() => {
    const quoteId = searchParams.get('quoteId');
    const orderId = searchParams.get('orderId');
    
    if (quoteId) {
      loadQuoteData(quoteId);
    } else if (orderId) {
      loadOrderData(orderId);
    }
  }, [searchParams]);

  const loadQuoteData = async (quoteId: string) => {
    try {
      setLoadingQuote(true);
      const quote = await QuotesService.getQuoteById(quoteId);

      if (!quote) {
        toast.error('Cotización no encontrada');
        return;
      }

      setFormData({
        clientId: quote.clientId,
        clientName: 'Cliente', // TODO: Obtener nombre del cliente desde ClientsService
        quoteId: quote.id,
        quoteNumber: quote.number,
        projectId: undefined, // Quotes no tienen projectId directo
        items: quote.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          subtotal: item.subtotal,
          unitOfMeasure: item.unitOfMeasure || 'pza',
        })),
        currency: quote.currency,
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'),
        paymentTerms: quote.paymentTerms || '30 días',
        notes: quote.notes || '',
      });

      toast.success('Datos cargados desde cotización');
    } catch {
      toast.error('Error al cargar la cotización');
    } finally {
      setLoadingQuote(false);
    }
  };

  const loadOrderData = async (orderId: string) => {
    try {
      setLoadingOrder(true);
      const order = await OrdersService.getOrderById(orderId);

      if (!order) {
        toast.error('Pedido no encontrado');
        return;
      }

      setFormData({
        clientId: order.clientId,
        clientName: order.clientName,
        orderId: order.id,
        orderNumber: order.number,
        quoteId: order.quoteId,
        quoteNumber: order.quoteNumber,
        items: order.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          subtotal: item.subtotal,
          unitOfMeasure: item.unitOfMeasure || 'pza',
        })),
        currency: order.currency,
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'),
        paymentTerms: '30 días',
        notes: order.notes || '',
      });

      toast.success('Datos cargados desde pedido');
    } catch {
      toast.error('Error al cargar el pedido');
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          subtotal: 0,
          unitOfMeasure: 'pza',
        },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length === 1) {
      toast.error('Debe haber al menos un ítem');
      return;
    }

    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Recalcular subtotal
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
      const item = newItems[index];
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const discount = Number(item.discount);
      item.subtotal = quantity * unitPrice - discount;
    }

    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0
    );

    const taxAmount = Object.values(taxes).reduce(
      (sum, rate) => sum + (subtotal * rate) / 100,
      0
    );

    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }

    // Validaciones
    if (!formData.clientId || !formData.clientName) {
      toast.error('Ingrese los datos del cliente');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Agregue al menos un ítem');
      return;
    }

    const hasInvalidItems = formData.items.some(
      (item) =>
        !item.description ||
        Number(item.quantity) <= 0 ||
        Number(item.unitPrice) <= 0
    );

    if (hasInvalidItems) {
      toast.error('Verifique que todos los ítems tengan datos válidos');
      return;
    }

    try {
      setLoading(true);

      const { subtotal, total } = calculateTotals();

      // Generar número de factura
      const number = await InvoicesService.generateInvoiceNumber();

      // Crear factura
      await InvoicesService.createInvoice({
        number,
        status: 'draft',
        clientId: formData.clientId,
        clientName: formData.clientName,
        quoteId: formData.quoteId,
        quoteNumber: formData.quoteNumber,
        orderId: formData.orderId,
        orderNumber: formData.orderNumber,
        projectId: formData.projectId,
        items: formData.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount),
          subtotal: Number(item.subtotal),
          unitOfMeasure: item.unitOfMeasure,
        })),
        subtotal,
        taxes,
        discounts: 0,
        total,
        currency: formData.currency,
        issueDate: new Date(formData.issueDate),
        dueDate: new Date(formData.dueDate),
        paymentTerms: formData.paymentTerms,
        notes: formData.notes || undefined,
        createdBy: user.uid,
      });

      toast.success(`Factura ${number} creada exitosamente`);
      router.push('/finance/invoices');
    } catch {
      toast.error('Error al crear la factura');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, total } = calculateTotals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: formData.currency,
    }).format(amount);
  };

  if (loadingQuote || loadingOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {loadingQuote ? 'Cargando cotización...' : 'Cargando pedido...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nueva Factura</h1>
            <p className="text-muted-foreground">
              {formData.orderId
                ? `Desde pedido ${formData.orderNumber}`
                : formData.quoteId
                  ? `Desde cotización ${formData.quoteNumber}`
                  : 'Crear factura manualmente'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
                <CardDescription>
                  Datos de facturación del cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nombre del Cliente *</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                      placeholder="ACME Corporation"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientId">ID Cliente *</Label>
                    <Input
                      id="clientId"
                      value={formData.clientId}
                      onChange={(e) =>
                        setFormData({ ...formData, clientId: e.target.value })
                      }
                      placeholder="client-id"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ítems de la Factura</CardTitle>
                    <CardDescription>
                      {formData.items.length} ítem(s)
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Ítem
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Descripción</TableHead>
                        <TableHead className="w-[12%]">Cant.</TableHead>
                        <TableHead className="w-[10%]">Unidad</TableHead>
                        <TableHead className="w-[15%]">Precio</TableHead>
                        <TableHead className="w-[13%]">Desc.</TableHead>
                        <TableHead className="w-[15%]">Subtotal</TableHead>
                        <TableHead className="w-[5%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  'description',
                                  e.target.value
                                )
                              }
                              placeholder="Producto o servicio"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  'quantity',
                                  parseFloat(e.target.value)
                                )
                              }
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.unitOfMeasure}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  'unitOfMeasure',
                                  e.target.value
                                )
                              }
                              placeholder="pza"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  'unitPrice',
                                  parseFloat(e.target.value)
                                )
                              }
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.discount}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  'discount',
                                  parseFloat(e.target.value)
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(item.subtotal)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(index)}
                              disabled={formData.items.length === 1}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Términos de Pago *</Label>
                  <Input
                    id="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentTerms: e.target.value })
                    }
                    placeholder="Ej: 30 días, Contado, 50% anticipo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Información adicional..."
                    rows={3}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.notes.length}/1000
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Fechas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Fecha de Emisión *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, issueDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha de Vencimiento *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  <CardTitle>Resumen</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  {Object.entries(taxes).map(([name, rate]) => (
                    <div key={name} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {name} ({rate}%)
                      </span>
                      <span className="font-medium">
                        {formatCurrency((subtotal * rate) / 100)}
                      </span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <div className="text-sm font-medium">{formData.currency}</div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  'Creando...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Factura
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
