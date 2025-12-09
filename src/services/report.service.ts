/**
 * Servicio para generar reportes de seguridad
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import type {
  Vulnerability,
  SecurityScanResult,
  GenerateReportParams,
  McpToolResponse,
  Severity,
} from '../types/index.js';
import { scanDependencies } from './dependency-scanner.service.js';
import { scanCodeVulnerabilities, scanSecrets } from './code-scanner.service.js';
import {
  formatDate,
  formatDateFull,
  sortBySeverity,
  countBySeverity,
  getSeverityEmoji,
  getSeverityLabel,
} from '../utils/formatters.js';
import { SEVERITY_ACTION } from '../utils/constants.js';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Genera un reporte completo de seguridad
 */
export async function generateSecurityReport(
  params: GenerateReportParams
): Promise<McpToolResponse> {
  const {
    projectPath,
    outputDir = './reports',
    projectName = path.basename(projectPath),
  } = params;

  console.error(`🔒 Iniciando escaneo de seguridad para: ${projectName}`);

  try {
    // Ejecutar todos los escaneos
    console.error('📦 Escaneando dependencias...');
    const depResult = await scanDependencies({ projectPath });

    console.error('🔍 Escaneando código fuente...');
    const codeResult = await scanCodeVulnerabilities({ projectPath });

    console.error('🔑 Escaneando secrets...');
    const secretsResult = await scanSecrets({ projectPath });

    // Combinar todas las vulnerabilidades
    const allVulnerabilities = sortBySeverity([
      ...depResult.vulnerabilities,
      ...codeResult.vulnerabilities,
      ...secretsResult.vulnerabilities,
    ]);

    const now = new Date();
    const scanResult: SecurityScanResult = {
      date: now.toISOString(),
      projectName,
      projectPath,
      total: allVulnerabilities.length,
      bySeverity: countBySeverity(allVulnerabilities),
      dependencies: depResult.vulnerabilities,
      code: codeResult.vulnerabilities,
      secrets: secretsResult.vulnerabilities,
    };

    // Generar reporte Markdown
    const report = generateMarkdownReport(scanResult, now);

    // Crear directorio si no existe
    const absoluteOutputDir = path.isAbsolute(outputDir)
      ? outputDir
      : path.join(__dirname, '..', '..', outputDir);

    fs.mkdirSync(absoluteOutputDir, { recursive: true });

    // Guardar archivo
    const dateStr = formatDate(now);
    const fileName = `REPORTE_SEGURIDAD_${dateStr}.md`;
    const outputPath = path.join(absoluteOutputDir, fileName);
    
    fs.writeFileSync(outputPath, report, 'utf-8');

    console.error(`✅ Reporte generado: ${outputPath}`);

    // Preparar resumen para mostrar al usuario
    const summary = generateSummary(scanResult, outputPath, fileName);

    return {
      content: [{ type: 'text', text: summary }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error generando reporte:`, errorMessage);

    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error generando reporte de seguridad**

${errorMessage}

**Posibles causas:**
- El directorio del proyecto no existe
- No hay permisos de lectura/escritura
- No se encontró package.json`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Genera el contenido del reporte en formato Markdown
 */
function generateMarkdownReport(result: SecurityScanResult, date: Date): string {
  const { projectName, projectPath, total, bySeverity, dependencies, code, secrets } = result;

  let report = `# 🔒 Reporte de Seguridad - ${projectName}

**Fecha:** ${formatDateFull(date)}  
**Escaneado por:** MCP Security Scanner v1.0.0  
**Ruta del proyecto:** \`${projectPath}\`

---

## 📊 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Total de vulnerabilidades** | ${total} |
| ${getSeverityEmoji('critical')} Críticas | ${bySeverity.critical} |
| ${getSeverityEmoji('high')} Altas | ${bySeverity.high} |
| ${getSeverityEmoji('moderate')} Medias | ${bySeverity.moderate} |
| ${getSeverityEmoji('low')} Bajas | ${bySeverity.low} |

### Desglose por Tipo

| Tipo | Cantidad |
|------|----------|
| 📦 Dependencias | ${dependencies.length} |
| 💻 Código fuente | ${code.length} |
| 🔑 Secrets expuestos | ${secrets.length} |

---

## 📋 Leyenda de Severidad

| Nivel | Emoji | Descripción | Acción Requerida |
|-------|-------|-------------|------------------|
| CRÍTICO | ${getSeverityEmoji('critical')} | Vulnerabilidad explotable remotamente | ${SEVERITY_ACTION.critical} |
| ALTO | ${getSeverityEmoji('high')} | Riesgo significativo de seguridad | ${SEVERITY_ACTION.high} |
| MEDIO | ${getSeverityEmoji('moderate')} | Vulnerabilidad con impacto limitado | ${SEVERITY_ACTION.moderate} |
| BAJO | ${getSeverityEmoji('low')} | Riesgo mínimo | ${SEVERITY_ACTION.low} |

---

`;

  // Sección de vulnerabilidades críticas
  const criticalVulns = [...dependencies, ...code, ...secrets].filter(
    (v) => v.severity === 'critical'
  );
  if (criticalVulns.length > 0) {
    report += generateVulnerabilitySection('critical', criticalVulns);
  }

  // Sección de vulnerabilidades altas
  const highVulns = [...dependencies, ...code, ...secrets].filter(
    (v) => v.severity === 'high'
  );
  if (highVulns.length > 0) {
    report += generateVulnerabilitySection('high', highVulns);
  }

  // Sección de vulnerabilidades medias
  const moderateVulns = [...dependencies, ...code, ...secrets].filter(
    (v) => v.severity === 'moderate'
  );
  if (moderateVulns.length > 0) {
    report += generateVulnerabilitySection('moderate', moderateVulns);
  }

  // Sección de vulnerabilidades bajas
  const lowVulns = [...dependencies, ...code, ...secrets].filter(
    (v) => v.severity === 'low'
  );
  if (lowVulns.length > 0) {
    report += generateVulnerabilitySection('low', lowVulns);
  }

  // Tabla resumen de dependencias a actualizar
  if (dependencies.length > 0) {
    report += `## 📦 Dependencias a Actualizar

| Paquete | Versión Actual | Versión Segura | Severidad |
|---------|---------------|----------------|-----------|
`;

    for (const dep of dependencies) {
      const fixedVersion = dep.fixedVersion || 'Ver solución';
      report += `| \`${dep.package}\` | ${dep.currentVersion || '?'} | ${fixedVersion} | ${getSeverityEmoji(dep.severity)} ${getSeverityLabel(dep.severity)} |\n`;
    }

    report += '\n---\n\n';
  }

  // Comandos de remediación
  report += `## ✅ Comandos de Remediación Rápida

### Para vulnerabilidades en dependencias

\`\`\`bash
# Ver todas las vulnerabilidades
npm audit

# Corregir vulnerabilidades automáticamente (cuando sea posible)
npm audit fix

# Forzar corrección (puede romper compatibilidad - usar con cuidado)
npm audit fix --force

# Ver detalles de una vulnerabilidad específica
npm audit --json | jq '.vulnerabilities["nombre-paquete"]'
\`\`\`

### Para vulnerabilidades en código

1. Revisar cada archivo listado en el reporte
2. Aplicar las soluciones recomendadas
3. Ejecutar tests para verificar que no se rompió funcionalidad
4. Volver a ejecutar el escaneo para confirmar la corrección

---

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Las 10 vulnerabilidades web más críticas
- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Documentación oficial de npm audit
- [DOMPurify](https://github.com/cure53/DOMPurify) - Librería para sanitizar HTML
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) - Guías de seguridad

---

*Reporte generado automáticamente por MCP Security Scanner*  
*Para reportar problemas o sugerencias, contacta al equipo de desarrollo*
`;

  return report;
}

/**
 * Genera una sección de vulnerabilidades por severidad
 */
function generateVulnerabilitySection(
  severity: Severity,
  vulnerabilities: Vulnerability[]
): string {
  const emoji = getSeverityEmoji(severity);
  const label = getSeverityLabel(severity);

  let section = `## ${emoji} VULNERABILIDADES ${label}S

`;

  vulnerabilities.forEach((vuln, index) => {
    section += `### ${index + 1}. ${vuln.title}

`;

    // Información según el tipo
    if (vuln.type === 'dependency') {
      section += `- **Tipo:** 📦 Dependencia\n`;
      section += `- **Paquete:** \`${vuln.package}\`\n`;
      if (vuln.currentVersion) {
        section += `- **Versión actual:** ${vuln.currentVersion}\n`;
      }
      if (vuln.fixedVersion) {
        section += `- **Versión segura:** ${vuln.fixedVersion}\n`;
      }
    } else {
      section += `- **Tipo:** ${vuln.type === 'secret' ? '🔑 Secret expuesto' : '💻 Código vulnerable'}\n`;
      section += `- **Archivo:** \`${vuln.file}\`\n`;
      section += `- **Línea:** ${vuln.line}\n`;
      if (vuln.codeSnippet) {
        section += `- **Código:**\n\`\`\`\n${vuln.codeSnippet}\n\`\`\`\n`;
      }
    }

    if (vuln.cve) {
      section += `- **CVE/CWE:** ${vuln.cve}\n`;
    }
    if (vuln.referenceUrl) {
      section += `- **Más información:** [Ver detalles](${vuln.referenceUrl})\n`;
    }

    section += `\n**Descripción:**\n${vuln.description}\n\n`;
    section += `**Solución:**\n${vuln.solution}\n\n`;
    section += `---\n\n`;
  });

  return section;
}

/**
 * Genera el resumen para mostrar al usuario
 */
function generateSummary(
  result: SecurityScanResult,
  outputPath: string,
  fileName: string
): string {
  const { total, bySeverity, dependencies, code, secrets } = result;

  let summary = `✅ **Reporte de seguridad generado exitosamente**

📁 **Archivo:** ${fileName}
📍 **Ubicación:** ${outputPath}

## 📊 Resumen de Resultados

| Categoría | Cantidad |
|-----------|----------|
| **Total vulnerabilidades** | ${total} |
| ${getSeverityEmoji('critical')} Críticas | ${bySeverity.critical} |
| ${getSeverityEmoji('high')} Altas | ${bySeverity.high} |
| ${getSeverityEmoji('moderate')} Medias | ${bySeverity.moderate} |
| ${getSeverityEmoji('low')} Bajas | ${bySeverity.low} |

### Por Tipo
- 📦 Dependencias: ${dependencies.length}
- 💻 Código: ${code.length}
- 🔑 Secrets: ${secrets.length}
`;

  if (bySeverity.critical > 0) {
    summary += `\n⚠️ **ATENCIÓN:** Se encontraron ${bySeverity.critical} vulnerabilidades CRÍTICAS que requieren acción inmediata.\n`;
  }

  return summary;
}
