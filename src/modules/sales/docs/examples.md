# 📚 Ejemplos de Uso - Sales Module

## 1. Gestión Básica de Leads

### Crear un Lead

```typescript
import { useLeads, LeadFormData } from '@/modules/sales';
import { toast } from 'sonner';

function CreateLeadExample() {
  const { createLead, loading } = useLeads();

  const handleSubmit = async (data: LeadFormData) => {
    try {
      const newLead = await createLead({
        entityType: 'company',
        name: 'Empresa ABC',
        email: 'contacto@empresaabc.com',
        phone: '+57 300 123 4567',
        company: 'Empresa ABC S.A.S',
        source: 'website',
        priority: 'high',
        notes: 'Interesado en solución de inventario'
      });
      
      toast.success('Lead creado exitosamente');
      console.log('Nuevo lead:', newLead);
    } catch (error) {
      toast.error('Error al crear lead');
    }
  };

  return (
    <LeadForm onSubmit={handleSubmit} loading={loading} />
  );
}
```

### Buscar y Filtrar Leads

```typescript
function LeadsListExample() {
  const { leads, searchLeads, loading } = useLeads();
  
  useEffect(() => {
    // Cargar todos los leads
    searchLeads();
  }, []);

  const filterByStatus = async (status: LeadStatus) => {
    await searchLeads({ status: [status] });
  };

  const filterByPriority = async (priority: LeadPriority) => {
    await searchLeads({ priority: [priority] });
  };

  const filterByDateRange = async () => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    await searchLeads({
      createdFrom: lastWeek,
      createdTo: new Date()
    });
  };

  return (
    <div>
      <div className="filters">
        <Button onClick={() => filterByStatus('new')}>
          Leads Nuevos
        </Button>
        <Button onClick={() => filterByPriority('high')}>
          Alta Prioridad
        </Button>
        <Button onClick={filterByDateRange}>
          Última Semana
        </Button>
      </div>
      
      <LeadsTable leads={leads} loading={loading} />
    </div>
  );
}
```

## 2. Conversión de Lead a Oportunidad

```typescript
function LeadConversionExample() {
  const { convertLead } = useLeads();
  const { refresh: refreshOpportunities } = useOpportunities();

  const handleConversion = async (leadId: string) => {
    try {
      await convertLead(leadId, {
        clientData: {
          entityType: 'company',
          name: 'Empresa ABC S.A.S',
          email: 'contacto@empresaabc.com',
          phone: '+57 300 123 4567',
          company: 'Empresa ABC S.A.S'
        },
        opportunityData: {
          name: 'Implementación Sistema Inventario',
          estimatedValue: 50000000,
          expectedCloseDate: new Date('2024-12-31'),
          notes: 'Oportunidad de alto valor para sistema completo'
        }
      });
      
      toast.success('Lead convertido exitosamente');
      await refreshOpportunities();
    } catch (error) {
      toast.error('Error en la conversión');
    }
  };

  return (
    <Button onClick={() => handleConversion('lead-123')}>
      Convertir a Oportunidad
    </Button>
  );
}
```

## 3. Gestión de Pipeline de Oportunidades

```typescript
function OpportunitiesPipelineExample() {
  const { 
    opportunities, 
    getOpportunitiesByStage, 
    moveOpportunity,
    pipelineValue 
  } = useOpportunities();

  const handleStageChange = async (opportunityId: string, newStage: OpportunityStage) => {
    try {
      await moveOpportunity(opportunityId, newStage);
      toast.success('Oportunidad movida exitosamente');
    } catch (error) {
      toast.error('Error al mover oportunidad');
    }
  };

  const stages: OpportunityStage[] = [
    'prospecting', 'qualification', 'proposal', 'negotiation'
  ];

  return (
    <div className="pipeline">
      <div className="pipeline-header">
        <h2>Pipeline de Ventas</h2>
        <span>Valor Total: {formatCurrency(pipelineValue)}</span>
      </div>
      
      <div className="pipeline-stages">
        {stages.map(stage => (
          <div key={stage} className="stage-column">
            <h3>{stage}</h3>
            {getOpportunitiesByStage(stage).map(opportunity => (
              <OpportunityCard 
                key={opportunity.id}
                opportunity={opportunity}
                onStageChange={(newStage) => 
                  handleStageChange(opportunity.id, newStage)
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 4. Generación y Envío de Cotizaciones

```typescript
function QuoteGenerationExample() {
  const { createQuote, sendQuote } = useQuotes();
  const [quoteId, setQuoteId] = useState<string | null>(null);

  const generateQuote = async (opportunityId: string) => {
    try {
      const quote = await createQuote({
        opportunityId,
        title: 'Cotización Sistema de Inventario',
        description: 'Implementación completa del sistema',
        items: [
          {
            description: 'Licencia Software',
            quantity: 1,
            unitPrice: 30000000,
            total: 30000000
          },
          {
            description: 'Implementación y Configuración',
            quantity: 1,
            unitPrice: 15000000,
            total: 15000000
          },
          {
            description: 'Capacitación (40 horas)',
            quantity: 40,
            unitPrice: 200000,
            total: 8000000
          }
        ],
        subtotal: 53000000,
        tax: 10070000,
        total: 63070000,
        validUntil: new Date('2024-03-31'),
        terms: 'Pago 50% inicial, 50% al finalizar implementación'
      });
      
      setQuoteId(quote.id);
      toast.success('Cotización generada exitosamente');
    } catch (error) {
      toast.error('Error al generar cotización');
    }
  };

  const handleSendQuote = async (email: string) => {
    if (!quoteId) return;
    
    try {
      await sendQuote(quoteId, email);
      toast.success('Cotización enviada por email');
    } catch (error) {
      toast.error('Error al enviar cotización');
    }
  };

  return (
    <div>
      <Button onClick={() => generateQuote('opp-123')}>
        Generar Cotización
      </Button>
      
      {quoteId && (
        <div className="quote-actions">
          <Input 
            placeholder="Email del cliente"
            onBlur={(e) => handleSendQuote(e.target.value)}
          />
          <Button onClick={() => handleSendQuote('cliente@email.com')}>
            Enviar por Email
          </Button>
        </div>
      )}
    </div>
  );
}
```

## 5. Dashboard de Analytics

```typescript
function SalesAnalyticsDashboard() {
  const { 
    metrics, 
    funnelData, 
    userPerformance,
    loadMetrics,
    loadFunnelData,
    loadUserPerformance 
  } = useSalesAnalytics();

  useEffect(() => {
    const dateRange = {
      from: new Date('2024-01-01'),
      to: new Date()
    };
    
    loadMetrics(dateRange);
    loadFunnelData(dateRange);
    loadUserPerformance(['user1', 'user2'], 'monthly');
  }, []);

  return (
    <div className="analytics-dashboard">
      {/* KPIs Principales */}
      <div className="kpis-grid">
        <KPICard 
          title="Total Leads"
          value={metrics?.totalLeads || 0}
          change="+12%"
        />
        <KPICard 
          title="Tasa Conversión"
          value={`${metrics?.conversionRate || 0}%`}
          change="+2.5%"
        />
        <KPICard 
          title="Valor Pipeline"
          value={formatCurrency(metrics?.pipelineValue || 0)}
          change="+8%"
        />
        <KPICard 
          title="Deals Cerrados"
          value={metrics?.closedDeals || 0}
          change="+15%"
        />
      </div>

      {/* Embudo de Ventas */}
      <div className="funnel-chart">
        <h3>Embudo de Ventas</h3>
        <FunnelChart data={funnelData} />
      </div>

      {/* Performance por Usuario */}
      <div className="user-performance">
        <h3>Rendimiento por Usuario</h3>
        <UserPerformanceTable data={userPerformance} />
      </div>
    </div>
  );
}
```

## 6. Gestión de Metas y Targets

```typescript
function UserTargetsExample() {
  const { user } = useAuth();
  const [targets, setTargets] = useState<Target[]>([]);
  const [performance, setPerformance] = useState<UserPerformance | null>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Cargar metas del usuario
      const userTargets = await UsersTargetsService.getUserTargets(
        user.uid, 
        'monthly'
      );
      setTargets(userTargets);

      // Cargar rendimiento actual
      const userPerf = await UsersTargetsService.calculateUserPerformance(
        user.uid,
        'monthly'
      );
      setPerformance(userPerf);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const createNewTarget = async () => {
    try {
      await UsersTargetsService.createTarget({
        userId: user.uid,
        type: 'revenue',
        targetValue: 100000000, // 100M COP
        period: 'monthly',
        startDate: new Date(),
        endDate: new Date('2024-12-31')
      });
      
      await loadUserData();
      toast.success('Meta creada exitosamente');
    } catch (error) {
      toast.error('Error al crear meta');
    }
  };

  return (
    <div className="user-targets">
      <div className="targets-header">
        <h2>Mis Metas</h2>
        <Button onClick={createNewTarget}>
          Nueva Meta
        </Button>
      </div>

      <div className="targets-grid">
        {targets.map(target => (
          <TargetCard 
            key={target.id}
            target={target}
            currentValue={performance?.currentRevenue || 0}
          />
        ))}
      </div>

      {performance && (
        <div className="performance-summary">
          <h3>Resumen de Performance</h3>
          <div className="metrics">
            <span>Leads Generados: {performance.leadsGenerated}</span>
            <span>Oportunidades Creadas: {performance.opportunitiesCreated}</span>
            <span>Deals Cerrados: {performance.dealsClosed}</span>
            <span>Revenue Generado: {formatCurrency(performance.currentRevenue)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 7. Integración con Notificaciones

```typescript
function SalesNotificationsExample() {
  const { leads } = useLeads();
  const { quotes } = useQuotes();
  
  useEffect(() => {
    checkNotifications();
  }, [leads, quotes]);

  const checkNotifications = () => {
    // Leads sin contactar por más de 24h
    const staleLeads = leads.filter(lead => {
      const created = lead.createdAt.toDate();
      const hoursAgo = (Date.now() - created.getTime()) / (1000 * 60 * 60);
      return lead.status === 'new' && hoursAgo > 24;
    });

    if (staleLeads.length > 0) {
      toast.warning(`${staleLeads.length} leads sin contactar por más de 24h`);
    }

    // Cotizaciones próximas a vencer
    const expiringQuotes = quotes.filter(quote => {
      if (!quote.validUntil) return false;
      const validUntil = quote.validUntil.toDate();
      const daysUntilExpiry = (validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
    });

    if (expiringQuotes.length > 0) {
      toast.info(`${expiringQuotes.length} cotizaciones vencen pronto`);
    }
  };

  return null; // Componente de notificaciones silencioso
}
```

## 8. Utilidades Comunes

```typescript
import { 
  formatCurrency,
  calculateConversionRate,
  getLeadStatusColor,
  generateQuoteNumber,
  calculateWeightedPipelineValue
} from '@/modules/sales';

// Formatear moneda
const price = formatCurrency(50000000); // "$50.000.000"

// Calcular tasa de conversión
const rate = calculateConversionRate(25, 100); // 25%

// Obtener color de estado
const colorClass = getLeadStatusColor('qualified'); // "bg-green-100 text-green-800"

// Generar número de cotización
const quoteNumber = generateQuoteNumber('COT-24-0150'); // "COT-24-0151"

// Calcular valor ponderado del pipeline
const weightedValue = calculateWeightedPipelineValue(opportunities);
```

Estos ejemplos muestran los casos de uso más comunes del módulo de ventas. Para implementaciones más específicas, consulta la documentación de API completa.