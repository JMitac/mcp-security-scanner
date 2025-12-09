/**
 * Definición de la herramienta scan_secrets
 */

import type { ScanCodeParams, McpToolResponse } from '../types/index.js';
import { scanSecrets } from '../services/code-scanner.service.js';
import { getSeverityEmoji, formatSeveritySummary } from '../utils/formatters.js';

/**
 * Schema de la herramienta scan_secrets
 */
export const scanSecretsToolSchema = {
  name: 'scan_secrets',
  description:
    'Escanea el código fuente buscando secrets expuestos como API keys, tokens, contraseñas hardcodeadas, claves privadas, connection strings de bases de datos, etc.',
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
        description: 'Patrones glob de archivos a escanear',
      },
    },
    required: ['projectPath'],
  },
};

/**
 * Handler de la herramienta scan_secrets
 */
export async function scanSecretsToolHandler(
  args: Record<string, unknown>
): Promise<McpToolResponse> {
  const params: ScanCodeParams = {
    projectPath: args.projectPath as string,
    patterns: args.patterns as string[] | undefined,
  };

  const result = await scanSecrets(params);

  // Formatear respuesta
  let response = `## 🔑 Escaneo de Secrets

**Archivos escaneados:** ${result.filesScanned}
**Total de secrets expuestos:** ${result.total}

### Por Severidad
${formatSeveritySummary(result.bySeverity)}

`;

  if (result.vulnerabilities.length > 0) {
    response += `### ⚠️ Secrets Expuestos\n\n`;

    for (const vuln of result.vulnerabilities) {
      response += `#### ${getSeverityEmoji(vuln.severity)} ${vuln.title}

- **Archivo:** \`${vuln.file}\`
- **Línea:** ${vuln.line}

**Descripción:**
${vuln.description}

**Solución:**
${vuln.solution}

---

`;
    }

    response += `\n⚠️ **IMPORTANTE:** Si alguno de estos secrets es real y está en un repositorio público, debes rotarlo inmediatamente.\n`;
  } else {
    response += `\n✅ **No se encontraron secrets expuestos en el código.**\n`;
  }

  return {
    content: [{ type: 'text', text: response }],
  };
}
