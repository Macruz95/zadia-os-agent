/**
 * ZADIA OS - Priority Actions Widget
 * 
 * Muestra las acciones más críticas que requieren atención inmediata del CEO
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight, DollarSign, Briefcase, CheckCircle } from 'lucide-react';
import { PriorityAction } from '../types/dashboard.types';
import Link from 'next/link';

interface PriorityActionsWidgetProps {
    actions: PriorityAction[];
    loading?: boolean;
}

export function PriorityActionsWidget({ actions, loading }: PriorityActionsWidgetProps) {
    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Tu Prioridad Hoy</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getIcon = (type: PriorityAction['type']) => {
        switch (type) {
            case 'finance': return <DollarSign className="h-5 w-5 text-red-500" />;
            case 'sales': return <Briefcase className="h-5 w-5 text-blue-500" />;
            case 'project': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            default: return <CheckCircle className="h-5 w-5 text-green-500" />;
        }
    };

    const getPriorityColor = (priority: PriorityAction['priority']) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <Card className="h-full border-l-4 border-l-primary shadow-md">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                        Tu Prioridad Hoy
                    </CardTitle>
                    <Badge variant="outline" className="font-mono">
                        {actions.length} Acciones
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mt-2">
                    {actions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
                            <p>¡Todo al día! No hay acciones críticas pendientes.</p>
                        </div>
                    ) : (
                        actions.map((action) => (
                            <div
                                key={action.id}
                                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                                <div className="mt-1 p-2 bg-background rounded-full border shadow-sm">
                                    {getIcon(action.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-sm truncate">{action.title}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase ${getPriorityColor(action.priority)}`}>
                                            {action.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {action.description}
                                    </p>

                                    <Button size="sm" variant="outline" className="h-8 text-xs group" asChild>
                                        <Link href={action.actionUrl}>
                                            {action.actionLabel}
                                            <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
