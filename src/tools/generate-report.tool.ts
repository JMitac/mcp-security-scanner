/**
 * Definición de la herramienta generate_security_report
 */

import type { GenerateReportParams } from '../types/index.js';
import { generateSecurityReport } from '../services/report.service.js';

/**
 * Schema de la herramienta generate_security_report
 */
export const generateReportToolSchema = {
  name: 'generate_security_report',
  description:
    'Genera un reporte completo de seguridad en español que incluye: vulnerabilidades en dependencias (npm audit), vulnerabilidades en código fuente y secrets expuestos. El reporte se guarda en formato Markdown con todas las vulnerabilidades priorizadas por severidad y soluciones recomendadas.',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Ruta absoluta al proyecto a escanear',
      },
      outputDir: {
        type: 'string',
        description: 'Directorio donde guardar el reporte (default: ./reports)',
      },
      projectName: {
        type: 'string',
        description: 'Nombre del proyecto para el título del reporte',
      },
    },
    required: ['projectPath'],
  },
};

/**
 * Handler de la herramienta generate_security_report
 */
export async function generateReportToolHandler(
  args: Record<string, unknown>
) {
  const params: GenerateReportParams = {
    projectPath: args.projectPath as string,
    outputDir: args.outputDir as string | undefined,
    projectName: args.projectName as string | undefined,
  };

  return generateSecurityReport(params);
}
