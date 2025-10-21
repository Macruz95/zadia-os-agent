/**
 * ZADIA OS - Client Permanent Notes
 * 
 * Notas permanentes no transaccionales del cliente
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <150 líneas
 */

'use client';

import { useState } from 'react';
import { StickyNote, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface PermanentNote {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  isPinned: boolean;
}

interface ClientPermanentNotesProps {
  clientId: string;
  notes?: PermanentNote[];
  onNoteAdd?: (content: string) => void;
  onNoteEdit?: (noteId: string, content: string) => void;
  onNoteDelete?: (noteId: string) => void;
}

export function ClientPermanentNotes({
  // clientId, // TODO: Use for Firebase direct queries
  notes = [],
  onNoteAdd,
  onNoteEdit,
  onNoteDelete,
}: ClientPermanentNotesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAdd = () => {
    if (newNoteContent.trim()) {
      onNoteAdd?.(newNoteContent);
      setNewNoteContent('');
      setIsAdding(false);
    }
  };

  const handleEdit = (note: PermanentNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      onNoteEdit?.(editingId, editContent);
      setEditingId(null);
      setEditContent('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Notas Permanentes
          </CardTitle>
          {!isAdding && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add New Note */}
        {isAdding && (
          <div className="space-y-2 p-3 border rounded-lg bg-accent/50">
            <Textarea
              placeholder="Escribe una nota permanente sobre este cliente..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>
                Guardar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewNoteContent('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {notes.length === 0 && !isAdding ? (
          <div className="text-center py-6 text-muted-foreground">
            <StickyNote className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay notas permanentes</p>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className="p-3 border rounded-lg space-y-2"
            >
              {editingId === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit}>
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm flex-1">{note.content}</p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEdit(note)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => onNoteDelete?.(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{note.createdBy}</span>
                    <span>•</span>
                    <span>{note.createdAt.toLocaleDateString('es-SV')}</span>
                    {note.isPinned && (
                      <Badge variant="secondary" className="text-xs">
                        Fijada
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
