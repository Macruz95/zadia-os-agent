/**
 * ZADIA OS - Add Bonus Dialog
 * 
 * Dialog for adding bonuses, gratifications, aguinaldo to a work period
 */

'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { BonusesService } from '../../services/bonuses.service';
import { BONUS_TYPE_CONFIG, type BonusType } from '../../types/hr.types';

interface AddBonusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    periodId: string;
    employeeId: string;
    onSuccess: () => void;
}

export function AddBonusDialog({
    open,
    onOpenChange,
    periodId,
    employeeId,
    onSuccess,
}: AddBonusDialogProps) {
    const { user } = useAuth();
    const [type, setType] = useState<BonusType>('gratification');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error('Ingresa un monto válido');
            return;
        }

        if (!user?.uid) {
            toast.error('Sesión expirada');
            return;
        }

        setSubmitting(true);
        try {
            await BonusesService.addBonus(
                employeeId,
                periodId,
                type,
                amountNum,
                description || BONUS_TYPE_CONFIG[type].label,
                user.uid
            );

            toast.success('Bonificación registrada');
            setAmount('');
            setDescription('');
            setType('gratification');
            onOpenChange(false);
            onSuccess();
        } catch {
            toast.error('Error al registrar bonificación');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Bonificación</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Bonificación</Label>
                        <Select
                            value={type}
                            onValueChange={(v) => setType(v as BonusType)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(BONUS_TYPE_CONFIG).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        {config.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Monto (USD)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción (opcional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Ej: Bono por buen desempeño, Aguinaldo 2025..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Guardando...' : 'Registrar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
