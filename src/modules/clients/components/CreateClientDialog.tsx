/**
 * ZADIA OS - Create Client Dialog
 * 
 * Modal para crear nuevos clientes
 * Wraps ClientCreationForm in a standard Dialog
 */

'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ClientCreationForm } from './ClientCreationForm';

interface CreateClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateClientDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateClientDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <ClientCreationForm
                        onSuccess={() => {
                            onSuccess?.();
                            onOpenChange(false);
                        }}
                        onCancel={() => onOpenChange(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
