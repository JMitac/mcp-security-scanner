/**
 * Definición de la herramienta scan_dependencies
 */

import type { ScanDependenciesParams, McpToolResponse } from '../types/index.js';
import { scanDependencies } from '../services/dependency-scanner.service.js';
import { getSeverityEmoji, formatSeveritySummary } from '../utils/formatters.js';

/**
 * Schema de la herramienta scan_dependencies
 */
export const scanDependenciesToolSchema = {
  name: 'scan_dependencies',
  description:
    'Escanea vulnerabilidades en las dependencias del package.json usando npm audit. Retorna un listado de vulnerabilidades ordenadas por severidad con soluciones recomendadas.',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Ruta absoluta al proyecto a escanear (donde está el package.json)',
      },
      includeDevDeps: {
        type: 'boolean',
        description: 'Incluir devDependencies en el análisis (default: true)',
      },
    },
    required: ['projectPath'],
  },
};

/**
 * Handler de la herramienta scan_dependencies
 */
export async function scanDependenciesToolHandler(
  args: Record<string, unknown>
): Promise<McpToolResponse> {
  const params: ScanDependenciesParams = {
    projectPath: args.projectPath as string,
    includeDevDeps: (args.includeDevDeps as boolean) ?? true,
  };

  const result = await scanDependencies(params);

  // Formatear respuesta
  let response = `## 📦 Escaneo de Dependencias

**Total de vulnerabilidades:** ${result.total}

### Por Severidad
${formatSeveritySummary(result.bySeverity)}

`;

  if (result.vulnerabilities.length > 0) {
    response += `### Vulnerabilidades Encontradas\n\n`;

    for (const vuln of result.vulnerabilities) {
      response += `#### ${getSeverityEmoji(vuln.severity)} ${vuln.title}

- **Paquete:** \`${vuln.package}\`
- **Versión actual:** ${vuln.currentVersion || 'N/A'}
- **Versión segura:** ${vuln.fixedVersion || 'Ver solución'}
- **Descripción:** ${vuln.description}

**Solución:**
${vuln.solution}

---

`;
    }
  } else {
    response += `\n✅ **No se encontraron vulnerabilidades en las dependencias.**\n`;
  }

  return {
    content: [{ type: 'text', text: response }],
  };
}
