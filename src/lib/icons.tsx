/**
 * ZADIA OS - Dynamic Icon Renderer
 * 
 * Helper to render Lucide icons by name string
 * REGLA 2: ShadCN UI + Lucide icons only
 */

import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

// Type for valid Lucide icon names
type LucideIconName = keyof typeof LucideIcons;

interface DynamicIconProps extends LucideProps {
  name: string;
}

/**
 * Render a Lucide icon by its name
 */
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  // Get the icon component from Lucide
  const IconComponent = LucideIcons[name as LucideIconName] as React.ComponentType<LucideProps>;
  
  if (!IconComponent) {
    // Fallback to a default icon if not found
    return <LucideIcons.HelpCircle {...props} />;
  }
  
  return <IconComponent {...props} />;
}

/**
 * Map of position icons for HR module
 */
export const positionIcons: Record<string, React.ComponentType<LucideProps>> = {
  Hammer: LucideIcons.Hammer,
  HandHelping: LucideIcons.HandHelping,
  Pencil: LucideIcons.Pencil,
  Wrench: LucideIcons.Wrench,
  UserCheck: LucideIcons.UserCheck,
  Briefcase: LucideIcons.Briefcase,
  DollarSign: LucideIcons.DollarSign,
  ClipboardList: LucideIcons.ClipboardList,
  User: LucideIcons.User,
};

/**
 * Map of shift icons for HR module
 */
export const shiftIcons: Record<string, React.ComponentType<LucideProps>> = {
  Sunrise: LucideIcons.Sunrise,
  Sun: LucideIcons.Sun,
  Moon: LucideIcons.Moon,
  Clock: LucideIcons.Clock,
};

/**
 * Map of inventory category icons
 */
export const inventoryCategoryIcons: Record<string, React.ComponentType<LucideProps>> = {
  Bed: LucideIcons.Bed,
  Building2: LucideIcons.Building2,
  Sofa: LucideIcons.Sofa,
  ChefHat: LucideIcons.ChefHat,
  UtensilsCrossed: LucideIcons.UtensilsCrossed,
  Bath: LucideIcons.Bath,
  Baby: LucideIcons.Baby,
  TreePine: LucideIcons.TreePine,
  Armchair: LucideIcons.Armchair,
};


