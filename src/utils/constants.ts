/**
 * Constantes del MCP Security Scanner
 */

import type { Severity } from '../types/index.js';

/**
 * Orden de severidad para ordenamiento (menor = más crítico)
 */
export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
};

/**
 * Emojis por nivel de severidad
 */
export const SEVERITY_EMOJI: Record<Severity, string> = {
  critical: '🔴',
  high: '🟠',
  moderate: '🟡',
  low: '🟢',
};

/**
 * Etiquetas en español por nivel de severidad
 */
export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'CRÍTICO',
  high: 'ALTO',
  moderate: 'MEDIO',
  low: 'BAJO',
};

/**
 * Descripciones de acción requerida por severidad
 */
export const SEVERITY_ACTION: Record<Severity, string> = {
  critical: 'Acción inmediata requerida',
  high: 'Resolver en menos de 24 horas',
  moderate: 'Resolver en menos de 1 semana',
  low: 'Resolver en el próximo sprint',
};

/**
 * Patrones de archivos por defecto para escanear
 */
export const DEFAULT_SCAN_PATTERNS = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'src/**/*.js',
  'src/**/*.jsx',
];

/**
 * Patrones de archivos a excluir
 */
export const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/__tests__/**',
  '**/__mocks__/**',
];
