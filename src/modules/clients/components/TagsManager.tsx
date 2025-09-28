'use client';

import { useState } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface TagsManagerProps {
  form: UseFormReturn<FieldValues>;
  fieldName?: string;
  label?: string;
  placeholder?: string;
}

export function TagsManager({
  form,
  fieldName = 'tags',
  label = 'Etiquetas',
  placeholder = 'Agregar etiqueta'
}: TagsManagerProps) {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = form.getValues(fieldName) as string[];
      if (!currentTags.includes(newTag.trim())) {
        form.setValue(fieldName, [...currentTags, newTag.trim()]);
        setNewTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues(fieldName) as string[];
    form.setValue(fieldName, currentTags.filter((tag: string) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {(form.watch(fieldName) as string[]).map((tag: string, index: number) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {tag}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addTag}
          disabled={!newTag.trim()}
        >
          Agregar
        </Button>
      </div>
    </div>
  );
}