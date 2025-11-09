/**
 * Design Tokens - AXON Visual System
 * Apple-inspired minimalism + Neuro glow aesthetics
 */

export const colors = {
  // Base
  black: '#000000',
  white: '#FFFFFF',
  
  // Backgrounds
  background: {
    primary: '#F9FAFB',
    secondary: '#FFFFFF',
    dark: '#1F2937',
  },
  
  // Text
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  
  // Score Gradients
  gradients: {
    neuroplasticity: {
      start: '#6366F1', // Indigo
      end: '#8B5CF6',   // Purple
      glow: 'rgba(139, 92, 246, 0.4)',
    },
    currentNeuroState: {
      start: '#F59E0B', // Amber
      end: '#EF4444',   // Red
      glow: 'rgba(239, 68, 68, 0.4)',
    },
    sleepConsolidation: {
      start: '#06B6D4', // Cyan
      end: '#3B82F6',   // Blue
      glow: 'rgba(59, 130, 246, 0.4)',
    },
  },
  
  // Chart colors
  chart: {
    baseline: 'rgba(255, 255, 255, 0.15)',
    measured: '#F59E0B',
    gammaPeak: '#FBBF24',
    gammaGlow: 'rgba(251, 191, 36, 0.6)',
  },
  
  // Semantic
  status: {
    excellent: '#10B981',
    good: '#84CC16',
    moderate: '#F59E0B',
    low: '#EF4444',
  },
};

export const typography = {
  sizes: {
    hero: 44,
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
    tiny: 11,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  }),
};
