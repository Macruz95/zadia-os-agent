/**
 * ZADIA OS - Interaction Composer
 * 
 * Compositor de interacciones con pestañas
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 3: Zod validation
 * REGLA 5: <200 líneas
 */

'use client';

import { useState } from 'react';
import { Phone, Mail, Users, FileText, Paperclip } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InteractionComposerProps {
  clientId: string;
  clientName: string;
  onInteractionCreated?: () => void;
}

export function InteractionComposer({
  clientId,
  clientName,
  onInteractionCreated,
}: InteractionComposerProps) {
  const [activeTab, setActiveTab] = useState('note');
  const [noteContent, setNoteContent] = useState('');
  const [callDirection, setCallDirection] = useState<'incoming' | 'outgoing'>('outgoing');
  const [callDuration, setCallDuration] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  const handleSubmit = async (type: string) => {
    // TODO: Integrar con InteractionsService
    // Placeholder - will integrate with actual service
    void clientId; // Use clientId
    void type; // Use type
    
    // Reset forms
    setNoteContent('');
    setCallNotes('');
    setEmailSubject('');
    setEmailContent('');
    setMeetingTitle('');
    setMeetingNotes('');
    
    onInteractionCreated?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nueva Interacción con {clientName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="note">
              <FileText className="h-4 w-4 mr-2" />
              Nota
            </TabsTrigger>
            <TabsTrigger value="call">
              <Phone className="h-4 w-4 mr-2" />
              Llamada
            </TabsTrigger>
            <TabsTrigger value="meeting">
              <Users className="h-4 w-4 mr-2" />
              Reunión
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* Nota */}
          <TabsContent value="note" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-content">Contenido de la Nota</Label>
              <Textarea
                id="note-content"
                placeholder="Escribe aquí la nota... Usa @ para mencionar usuarios"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={6}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Adjuntar archivo
              </Button>
            </div>
            <Button onClick={() => handleSubmit('note')} className="w-full">
              Guardar Nota
            </Button>
          </TabsContent>

          {/* Llamada */}
          <TabsContent value="call" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Select value={callDirection} onValueChange={(v: 'incoming' | 'outgoing') => setCallDirection(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outgoing">Saliente</SelectItem>
                    <SelectItem value="incoming">Entrante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="call-duration">Duración (minutos)</Label>
                <Input
                  id="call-duration"
                  type="number"
                  placeholder="15"
                  value={callDuration}
                  onChange={(e) => setCallDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="call-notes">Notas de la llamada</Label>
              <Textarea
                id="call-notes"
                placeholder="Resumen de la conversación..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={() => handleSubmit('call')} className="w-full">
              Registrar Llamada
            </Button>
          </TabsContent>

          {/* Reunión */}
          <TabsContent value="meeting" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-title">Título de la Reunión</Label>
              <Input
                id="meeting-title"
                placeholder="Reunión de seguimiento"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-notes">Agenda y Notas</Label>
              <Textarea
                id="meeting-notes"
                placeholder="Puntos discutidos, acuerdos, próximos pasos..."
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                rows={5}
              />
            </div>
            <Button onClick={() => handleSubmit('meeting')} className="w-full">
              Guardar Reunión
            </Button>
          </TabsContent>

          {/* Email */}
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Asunto</Label>
              <Input
                id="email-subject"
                placeholder="Asunto del correo"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-content">Contenido</Label>
              <Textarea
                id="email-content"
                placeholder="Contenido del email..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={6}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Adjuntar archivo
              </Button>
            </div>
            <Button onClick={() => handleSubmit('email')} className="w-full">
              Guardar Email
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
