/**
 * ZADIA OS - Design Tokens
 * 
 * Tokens centralizados del sistema de diseño "Command Center"
 * Estos tokens deben usarse en lugar de valores hardcodeados
 * 
 * REGLA: Usar estos tokens para mantener consistencia UI
 */

// ============================================
// COLORES DEL TEMA ZADIA (Command Center)
// ============================================

export const colors = {
  // Fondos principales
  bg: {
    deep: '#0a0f1a',      // Fondo base del sistema
    elevated: '#161b22',   // Cards y elementos elevados
    surface: '#1c2333',    // Superficies interactivas
    hover: '#252d3d',      // Estados hover
    input: '#0d1117',      // Campos de entrada
  },
  
  // Bordes
  border: {
    default: 'rgba(55, 65, 81, 0.5)',  // gray-800/50
    subtle: 'rgba(55, 65, 81, 0.3)',   // gray-800/30
    accent: 'rgba(6, 182, 212, 0.3)',  // cyan-500/30
    glow: 'rgba(6, 182, 212, 0.5)',    // cyan-500/50
  },
  
  // Acentos (Brand)
  accent: {
    primary: '#06b6d4',    // cyan-500 - color principal de la marca
    primaryHover: '#22d3ee', // cyan-400
    gradient: {
      from: '#06b6d4',     // cyan-500
      to: '#3b82f6',       // blue-500
    },
  },
  
  // Texto
  text: {
    primary: '#ffffff',
    secondary: '#9ca3af',   // gray-400
    muted: '#6b7280',       // gray-500
    accent: '#22d3ee',      // cyan-400
  },
  
  // Estados
  status: {
    success: '#22c55e',     // green-500
    successBg: 'rgba(34, 197, 94, 0.2)',
    warning: '#f59e0b',     // amber-500
    warningBg: 'rgba(245, 158, 11, 0.2)',
    error: '#ef4444',       // red-500
    errorBg: 'rgba(239, 68, 68, 0.2)',
    info: '#3b82f6',        // blue-500
    infoBg: 'rgba(59, 130, 246, 0.2)',
  },
} as const;

// ============================================
// CLASES TAILWIND REUTILIZABLES
// ============================================

export const tw = {
  // Fondos de cards/contenedores
  card: 'bg-[#161b22] border border-gray-800/50 rounded-lg',
  cardHover: 'bg-[#161b22] border border-gray-800/50 rounded-lg hover:border-cyan-500/30 transition-colors',
  
  // Inputs
  input: 'bg-[#0d1117] border-gray-800/50',
  inputFocus: 'bg-[#0d1117] border-gray-800/50 focus:border-cyan-500/50 focus:ring-cyan-500/20',
  
  // Badges de estado
  badgeCyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  badgeGreen: 'bg-green-500/20 text-green-400 border-green-500/30',
  badgeYellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  badgeRed: 'bg-red-500/20 text-red-400 border-red-500/30',
  badgeGray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  
  // Texto
  textPrimary: 'text-white',
  textSecondary: 'text-gray-400',
  textMuted: 'text-gray-500',
  textAccent: 'text-cyan-400',
  
  // Iconos
  iconAccent: 'text-cyan-400',
  iconMuted: 'text-gray-500',
  
  // Headers de página estándar
  pageTitle: 'text-2xl font-bold text-white tracking-tight',
  pageSubtitle: 'text-sm text-gray-400',
  
  // Secciones
  sectionTitle: 'text-lg font-semibold text-white',
  
  // Dialogs
  dialogContent: 'bg-[#161b22] border-gray-800/50',
  
  // Botones especiales (gradiente cyan)
  btnGradient: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white',
  btnCyan: 'bg-cyan-600 hover:bg-cyan-700 text-white',
} as const;

// ============================================
// ESPACIADO ESTÁNDAR
// ============================================

export const spacing = {
  page: 'p-6',
  pageGap: 'space-y-6',
  cardPadding: 'p-4',
  sectionGap: 'gap-6',
} as const;

// ============================================
// PATRONES DE LAYOUT
// ============================================

export const layout = {
  // Wrapper estándar de página (sin container)
  pageWrapper: 'p-6 space-y-6',
  
  // Wrapper con container (para páginas más anchas)
  pageWrapperContainer: 'container mx-auto p-6 space-y-6',
  
  // Grid de KPIs
  kpiGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
  
  // Grid de cards
  cardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
} as const;

// ============================================
// ANIMACIONES
// ============================================

export const animation = {
  fast: 'transition-all duration-150',
  base: 'transition-all duration-200',
  slow: 'transition-all duration-300',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Combina clases de forma segura
 */
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Genera clases para un badge de estado
 */
export function getStatusBadgeClass(status: 'success' | 'warning' | 'error' | 'info' | 'default'): string {
  const map: Record<string, string> = {
    success: tw.badgeGreen,
    warning: tw.badgeYellow,
    error: tw.badgeRed,
    info: tw.badgeCyan,
    default: tw.badgeGray,
  };
  return map[status] || tw.badgeGray;
}
