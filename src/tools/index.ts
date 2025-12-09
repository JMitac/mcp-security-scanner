/**
 * Registro central de herramientas MCP
 */

import {
  scanDependenciesToolSchema,
  scanDependenciesToolHandler,
} from './scan-dependencies.tool.js';
import { scanCodeToolSchema, scanCodeToolHandler } from './scan-code.tool.js';
import { scanSecretsToolSchema, scanSecretsToolHandler } from './scan-secrets.tool.js';
import {
  generateReportToolSchema,
  generateReportToolHandler,
} from './generate-report.tool.js';

/**
 * Lista de todas las herramientas disponibles (schemas)
 */
export const toolSchemas = [
  scanDependenciesToolSchema,
  scanCodeToolSchema,
  scanSecretsToolSchema,
  generateReportToolSchema,
];

/**
 * Mapa de handlers por nombre de herramienta
 */
export const toolHandlers: Record<
  string,
  (args: Record<string, unknown>) => Promise<unknown>
> = {
  scan_dependencies: scanDependenciesToolHandler,
  scan_code_vulnerabilities: scanCodeToolHandler,
  scan_secrets: scanSecretsToolHandler,
  generate_security_report: generateReportToolHandler,
};

// Re-exportar schemas y handlers individuales
export { scanDependenciesToolSchema, scanDependenciesToolHandler };
export { scanCodeToolSchema, scanCodeToolHandler };
export { scanSecretsToolSchema, scanSecretsToolHandler };
export { generateReportToolSchema, generateReportToolHandler };
