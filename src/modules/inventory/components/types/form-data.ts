import { z } from 'zod';
import { RawMaterialFormSchema, FinishedProductFormSchema } from '../../validations/inventory.schema';

// Tipos derivados de schemas
export type EditRawMaterialFormData = z.infer<typeof RawMaterialFormSchema>;
export type EditFinishedProductFormData = z.infer<typeof FinishedProductFormSchema>;

// Opciones para selects de materias primas
export const RAW_MATERIAL_CATEGORIES = [
  { value: 'Maderas', label: 'Maderas' },
  { value: 'Acabados', label: 'Acabados' },
  { value: 'Adhesivos', label: 'Adhesivos' },
  { value: 'Herrajes', label: 'Herrajes' },
  { value: 'Químicos', label: 'Químicos' },
  { value: 'Textiles', label: 'Textiles' },
  { value: 'Herramientas', label: 'Herramientas' },
  { value: 'Otros', label: 'Otros' },
] as const;

// Opciones para selects de productos terminados
export const FINISHED_PRODUCT_CATEGORIES = [
  { value: 'Dormitorio', label: 'Dormitorio' },
  { value: 'Oficina', label: 'Oficina' },
  { value: 'Sala', label: 'Sala' },
  { value: 'Cocina', label: 'Cocina' },
  { value: 'Comedor', label: 'Comedor' },
  { value: 'Baño', label: 'Baño' },
  { value: 'Infantil', label: 'Infantil' },
  { value: 'Exterior', label: 'Exterior' },
  { value: 'Otros', label: 'Otros' },
] as const;

// Opciones para unidades de medida
export const UNITS_OF_MEASURE = [
  { value: 'unidades', label: 'Unidades' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'lb', label: 'Libras (lb)' },
  { value: 'oz', label: 'Onzas (oz)' },
  { value: 'litros', label: 'Litros (L)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'gal', label: 'Galones (gal)' },
  { value: 'm3', label: 'Metros cúbicos (m³)' },
  { value: 'm2', label: 'Metros cuadrados (m²)' },
  { value: 'm', label: 'Metros (m)' },
  { value: 'cm', label: 'Centímetros (cm)' },
  { value: 'mm', label: 'Milímetros (mm)' },
  { value: 'pies', label: 'Pies (ft)' },
  { value: 'pulgadas', label: 'Pulgadas (in)' },
  { value: 'yardas', label: 'Yardas (yd)' },
] as const;