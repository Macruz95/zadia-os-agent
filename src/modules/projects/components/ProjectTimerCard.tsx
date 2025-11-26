'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Play, Pause, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc,
    updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

interface FirestoreTimestamp {
    seconds: number;
    nanoseconds: number;
    toDate?: () => Date;
}

interface WorkSession {
    id: string;
    startTime: FirestoreTimestamp | Date | null;
    endTime: FirestoreTimestamp | Date | null;
    durationSeconds: number;
    cost: number;
}

interface ProjectTimerCardProps {
    projectId: string;
    project: {
        name?: string;
        hourlyRate?: number;
        startDate?: unknown;
    };
}

export function ProjectTimerCard({ projectId, project }: ProjectTimerCardProps) {
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);

    // Listen to work sessions
    useEffect(() => {
        const sessionsRef = collection(db, 'projects', projectId, 'workSessions');
        const q = query(sessionsRef, orderBy('startTime', 'desc'));

        const unsubscribe = onSnapshot(q, (snap) => {
            const sessions = snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkSession));
            setWorkSessions(sessions);
        }, (error) => {
            logger.error('Error listening to work sessions', error);
        });

        return () => unsubscribe();
    }, [projectId]);

    // Timer interval
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isTimerActive) {
            const start = timerStartTime || Date.now() - elapsedTime;
            if (!timerStartTime) setTimerStartTime(start);
            interval = setInterval(() => setElapsedTime(Date.now() - start), 1000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isTimerActive, timerStartTime, elapsedTime]);

    const handleStartTimer = async () => {
        // If project hasn't started, mark it as started
        if (!project.startDate) {
            try {
                await updateDoc(doc(db, 'projects', projectId), {
                    startDate: new Date(),
                    status: 'in-progress'
                });
                toast.success('¡Proyecto iniciado!');
            } catch (error) {
                logger.error('Error starting project', error as Error);
                toast.error('Error al iniciar el proyecto');
                return;
            }
        }
        setIsTimerActive(true);
    };

    const handlePauseTimer = async () => {
        setIsTimerActive(false);
        const endTime = new Date();
        const durationSeconds = Math.round(elapsedTime / 1000);

        if (durationSeconds < 1) {
            toast.info('Sesión muy corta, no se guardará');
            setElapsedTime(0);
            setTimerStartTime(null);
            return;
        }

        // Calculate cost based on hourly rate (default $15/hour if not set)
        const hourlyRate = project.hourlyRate || 15;
        const sessionCost = (durationSeconds / 3600) * hourlyRate;

        try {
            await addDoc(collection(db, 'projects', projectId, 'workSessions'), {
                startTime: new Date(timerStartTime!),
                endTime,
                durationSeconds,
                cost: sessionCost,
                createdAt: new Date()
            });

            toast.success('Sesión de trabajo guardada');
            setElapsedTime(0);
            setTimerStartTime(null);
        } catch (error) {
            logger.error('Error saving work session', error as Error);
            toast.error('Error al guardar la sesión');
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!window.confirm('¿Eliminar esta sesión de trabajo?')) return;

        try {
            await deleteDoc(doc(db, 'projects', projectId, 'workSessions', sessionId));
            toast.success('Sesión eliminada');
        } catch (error) {
            logger.error('Error deleting session', error as Error);
            toast.error('Error al eliminar la sesión');
        }
    };

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatDate = (date: FirestoreTimestamp | Date | null | undefined) => {
        if (!date) return 'N/A';
        if (typeof date === 'object' && 'seconds' in date) {
            return new Date(date.seconds * 1000).toLocaleDateString('es-MX');
        }
        if (date instanceof Date) {
            return date.toLocaleDateString('es-MX');
        }
        return 'N/A';
    };

    const totalHours = workSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600;
    const totalCost = workSessions.reduce((sum, s) => sum + s.cost, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Control de Tiempo del Proyecto
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Timer Display */}
                <div className="flex items-center justify-center gap-4 p-6 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <div className="text-center">
                        <p className="text-6xl font-mono font-bold tabular-nums">
                            {formatTime(elapsedTime)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            {isTimerActive ? 'Sesión en curso' : 'Timer detenido'}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={isTimerActive ? handlePauseTimer : handleStartTimer}
                            size="lg"
                            variant={isTimerActive ? 'destructive' : 'default'}
                        >
                            {isTimerActive ? (
                                <>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pausar
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Iniciar
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border">
                    <div>
                        <p className="text-sm text-muted-foreground">Total de Horas</p>
                        <p className="text-2xl font-bold">{totalHours.toFixed(2)}h</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Costo Total de Mano de Obra</p>
                        <p className="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</p>
                    </div>
                </div>

                {/* Sessions History */}
                <div>
                    <h4 className="font-semibold mb-3">Historial de Sesiones</h4>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Duración</TableHead>
                                    <TableHead className="text-right">Costo</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {workSessions.length > 0 ? (
                                    workSessions.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell>{formatDate(session.startTime)}</TableCell>
                                            <TableCell>{formatTime(session.durationSeconds * 1000)}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                ${session.cost.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteSession(session.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No hay sesiones de trabajo registradas
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
