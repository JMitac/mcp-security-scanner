/**
 * Definición de la herramienta scan_code_vulnerabilities
 */

import type { ScanCodeParams, McpToolResponse } from '../types/index.js';
import { scanCodeVulnerabilities } from '../services/code-scanner.service.js';
import { getSeverityEmoji, formatSeveritySummary } from '../utils/formatters.js';

/**
 * Schema de la herramienta scan_code_vulnerabilities
 */
export const scanCodeToolSchema = {
  name: 'scan_code_vulnerabilities',
  description:
    'Escanea el código fuente del proyecto buscando patrones de código vulnerable como XSS, eval(), innerHTML sin sanitizar, tokens en localStorage, etc. Retorna vulnerabilidades con ubicación exacta y soluciones.',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Ruta absoluta al proyecto a escanear',
      },
      patterns: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Patrones glob de archivos a escanear (default: src/**/*.{ts,tsx,js,jsx})',
      },
    },
    required: ['projectPath'],
  },
};

/**
 * Handler de la herramienta scan_code_vulnerabilities
 */
export async function scanCodeToolHandler(
  args: Record<string, unknown>
): Promise<McpToolResponse> {
  const params: ScanCodeParams = {
    projectPath: args.projectPath as string,
    patterns: args.patterns as string[] | undefined,
  };

  const result = await scanCodeVulnerabilities(params);

  // Formatear respuesta
  let response = `## 💻 Escaneo de Código Fuente

**Archivos escaneados:** ${result.filesScanned}
**Total de vulnerabilidades:** ${result.total}

### Por Severidad
${formatSeveritySummary(result.bySeverity)}

`;

  if (result.vulnerabilities.length > 0) {
    response += `### Vulnerabilidades Encontradas\n\n`;

    for (const vuln of result.vulnerabilities) {
      response += `#### ${getSeverityEmoji(vuln.severity)} ${vuln.title}

- **Archivo:** \`${vuln.file}\`
- **Línea:** ${vuln.line}
- **Código:** \`${vuln.codeSnippet}\`

**Descripción:**
${vuln.description}

**Solución:**
${vuln.solution}

---

`;
    }
  } else {
    response += `\n✅ **No se encontraron vulnerabilidades en el código fuente.**\n`;
  }

  return {
    content: [{ type: 'text', text: response }],
  };
}
