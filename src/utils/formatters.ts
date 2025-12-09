/**
 * Utilidades de formateo
 */

import type { Severity, Vulnerability } from '../types/index.js';
import { SEVERITY_ORDER, SEVERITY_EMOJI, SEVERITY_LABEL } from './constants.js';

/**
 * Formatea una fecha a string YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formatea una fecha a string completo en español
 */
export function formatDateFull(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Ordena vulnerabilidades por severidad (más críticas primero)
 */
export function sortBySeverity(vulnerabilities: Vulnerability[]): Vulnerability[] {
  return [...vulnerabilities].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );
}

/**
 * Cuenta vulnerabilidades por severidad
 */
export function countBySeverity(
  vulnerabilities: Vulnerability[]
): Record<Severity, number> {
  return {
    critical: vulnerabilities.filter((v) => v.severity === 'critical').length,
    high: vulnerabilities.filter((v) => v.severity === 'high').length,
    moderate: vulnerabilities.filter((v) => v.severity === 'moderate').length,
    low: vulnerabilities.filter((v) => v.severity === 'low').length,
  };
}

/**
 * Genera resumen de severidad en formato texto
 */
export function formatSeveritySummary(counts: Record<Severity, number>): string {
  const lines: string[] = [];
  
  if (counts.critical > 0) {
    lines.push(`${SEVERITY_EMOJI.critical} Críticas: ${counts.critical}`);
  }
  if (counts.high > 0) {
    lines.push(`${SEVERITY_EMOJI.high} Altas: ${counts.high}`);
  }
  if (counts.moderate > 0) {
    lines.push(`${SEVERITY_EMOJI.moderate} Medias: ${counts.moderate}`);
  }
  if (counts.low > 0) {
    lines.push(`${SEVERITY_EMOJI.low} Bajas: ${counts.low}`);
  }

  return lines.join('\n');
}

/**
 * Obtiene el emoji para una severidad
 */
export function getSeverityEmoji(severity: Severity): string {
  return SEVERITY_EMOJI[severity];
}

/**
 * Obtiene la etiqueta en español para una severidad
 */
export function getSeverityLabel(severity: Severity): string {
  return SEVERITY_LABEL[severity];
}

/**
 * Escapa caracteres especiales de Markdown
 */
export function escapeMarkdown(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

/**
 * Trunca texto a un máximo de caracteres
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
