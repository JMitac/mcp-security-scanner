/**
 * Servicio para escanear vulnerabilidades en código fuente
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

import type {
  Vulnerability,
  CodeScanResult,
  ScanCodeParams,
  VulnerablePattern,
} from '../types/index.js';
import { CODE_VULNERABILITY_PATTERNS, SECRET_PATTERNS } from '../patterns/index.js';
import { sortBySeverity, countBySeverity } from '../utils/formatters.js';
import { DEFAULT_SCAN_PATTERNS, EXCLUDE_PATTERNS } from '../utils/constants.js';

/**
 * Escanea vulnerabilidades en el código fuente del proyecto
 */
export async function scanCodeVulnerabilities(
  params: ScanCodeParams
): Promise<CodeScanResult> {
  const { projectPath, patterns = DEFAULT_SCAN_PATTERNS } = params;
  const vulnerabilities: Vulnerability[] = [];
  let filesScanned = 0;

  console.error(`🔍 Escaneando código fuente en: ${projectPath}`);

  try {
    // Buscar archivos que coincidan con los patrones
    const files: string[] = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: projectPath,
        ignore: EXCLUDE_PATTERNS,
        nodir: true,
      });
      files.push(...matches);
    }

    // Eliminar duplicados
    const uniqueFiles = [...new Set(files)];
    console.error(`📄 Archivos a escanear: ${uniqueFiles.length}`);

    // Escanear cada archivo
    for (const file of uniqueFiles) {
      const filePath = path.join(projectPath, file);
      
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      filesScanned++;

      // Buscar patrones de código vulnerable
      const fileVulns = scanFileForPatterns(
        file,
        content,
        lines,
        CODE_VULNERABILITY_PATTERNS
      );
      vulnerabilities.push(...fileVulns);
    }

    const sorted = sortBySeverity(vulnerabilities);

    return {
      total: sorted.length,
      bySeverity: countBySeverity(sorted),
      vulnerabilities: sorted,
      filesScanned,
    };
  } catch (error) {
    console.error(`❌ Error escaneando código:`, error);
    return {
      total: 0,
      bySeverity: { critical: 0, high: 0, moderate: 0, low: 0 },
      vulnerabilities: [],
      filesScanned,
    };
  }
}

/**
 * Escanea secrets expuestos en el código fuente
 */
export async function scanSecrets(
  params: ScanCodeParams
): Promise<CodeScanResult> {
  const { projectPath, patterns = DEFAULT_SCAN_PATTERNS } = params;
  const vulnerabilities: Vulnerability[] = [];
  let filesScanned = 0;

  // Agregar archivos de configuración comunes
  const allPatterns = [
    ...patterns,
    '*.env*',
    '*.config.js',
    '*.config.ts',
    'config/**/*.{js,ts,json}',
  ];

  console.error(`🔍 Escaneando secrets en: ${projectPath}`);

  try {
    const files: string[] = [];
    
    for (const pattern of allPatterns) {
      const matches = await glob(pattern, {
        cwd: projectPath,
        ignore: EXCLUDE_PATTERNS,
        nodir: true,
        dot: true, // Incluir archivos que empiezan con .
      });
      files.push(...matches);
    }

    const uniqueFiles = [...new Set(files)];
    console.error(`📄 Archivos a escanear: ${uniqueFiles.length}`);

    for (const file of uniqueFiles) {
      const filePath = path.join(projectPath, file);
      
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      filesScanned++;

      const fileVulns = scanFileForPatterns(file, content, lines, SECRET_PATTERNS);
      vulnerabilities.push(...fileVulns);
    }

    const sorted = sortBySeverity(vulnerabilities);

    return {
      total: sorted.length,
      bySeverity: countBySeverity(sorted),
      vulnerabilities: sorted,
      filesScanned,
    };
  } catch (error) {
    console.error(`❌ Error escaneando secrets:`, error);
    return {
      total: 0,
      bySeverity: { critical: 0, high: 0, moderate: 0, low: 0 },
      vulnerabilities: [],
      filesScanned,
    };
  }
}

/**
 * Escanea un archivo buscando patrones vulnerables
 */
function scanFileForPatterns(
  file: string,
  content: string,
  lines: string[],
  patterns: VulnerablePattern[]
): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];

  for (const vulnPattern of patterns) {
    // Reset lastIndex para regex globales
    vulnPattern.pattern.lastIndex = 0;

    let match;
    while ((match = vulnPattern.pattern.exec(content)) !== null) {
      // Calcular número de línea
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      // Obtener el snippet de código (la línea donde se encontró)
      const codeSnippet = lines[lineNumber - 1]?.trim() || match[0];

      vulnerabilities.push({
        id: `code-${file}-${lineNumber}-${Date.now()}`,
        type: vulnPattern.type,
        severity: vulnPattern.severity,
        title: vulnPattern.title,
        description: vulnPattern.description,
        solution: vulnPattern.solution,
        file,
        line: lineNumber,
        codeSnippet: truncateCode(codeSnippet, 100),
      });
    }

    // Reset lastIndex después de usar
    vulnPattern.pattern.lastIndex = 0;
  }

  return vulnerabilities;
}

/**
 * Trunca código para mostrar en el reporte
 */
function truncateCode(code: string, maxLength: number): string {
  if (code.length <= maxLength) return code;
  return code.substring(0, maxLength - 3) + '...';
}
