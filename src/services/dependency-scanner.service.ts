/**
 * Servicio para escanear vulnerabilidades en dependencias
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import type {
  Vulnerability,
  DependencyScanResult,
  NpmAuditResult,
  NpmVulnerabilityVia,
  ScanDependenciesParams,
} from '../types/index.js';
import { sortBySeverity, countBySeverity } from '../utils/formatters.js';

/**
 * Escanea vulnerabilidades en las dependencias del proyecto usando npm audit
 */
export async function scanDependencies(
  params: ScanDependenciesParams
): Promise<DependencyScanResult> {
  const { projectPath } = params;
  const vulnerabilities: Vulnerability[] = [];

  // Verificar que existe package.json
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`⚠️ No se encontró package.json en: ${projectPath}`);
    return {
      total: 0,
      bySeverity: { critical: 0, high: 0, moderate: 0, low: 0 },
      vulnerabilities: [],
    };
  }

  // Verificar que existe package-lock.json o node_modules
  const lockPath = path.join(projectPath, 'package-lock.json');
  const nodeModulesPath = path.join(projectPath, 'node_modules');
  
  if (!fs.existsSync(lockPath) && !fs.existsSync(nodeModulesPath)) {
    console.error(`⚠️ No se encontró package-lock.json ni node_modules. Ejecuta 'npm install' primero.`);
    return {
      total: 0,
      bySeverity: { critical: 0, high: 0, moderate: 0, low: 0 },
      vulnerabilities: [],
    };
  }

  try {
    console.error(`🔍 Ejecutando npm audit en: ${projectPath}`);

    // Ejecutar npm audit en formato JSON
    let auditOutput: string;
    
    try {
      auditOutput = execSync('npm audit --json', {
        cwd: projectPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
    } catch (error: unknown) {
      // npm audit retorna exit code 1 si hay vulnerabilidades
      // pero aún así devuelve el JSON en stdout
      const execError = error as { stdout?: string; stderr?: string };
      if (execError.stdout) {
        auditOutput = execError.stdout;
      } else {
        throw error;
      }
    }

    const audit: NpmAuditResult = JSON.parse(auditOutput);

    // Procesar vulnerabilidades
    if (audit.vulnerabilities) {
      for (const [packageName, vuln] of Object.entries(audit.vulnerabilities)) {
        // Obtener información detallada del via
        const viaInfo = vuln.via.find(
          (v): v is NpmVulnerabilityVia => typeof v === 'object'
        );

        const vulnerability: Vulnerability = {
          id: `dep-${packageName}-${Date.now()}`,
          type: 'dependency',
          severity: vuln.severity,
          package: packageName,
          currentVersion: vuln.range,
          title: viaInfo?.title || `Vulnerabilidad en ${packageName}`,
          description: viaInfo?.title || `Se encontró una vulnerabilidad de severidad ${vuln.severity} en el paquete ${packageName}.`,
          solution: generateDependencySolution(packageName, vuln.fixAvailable),
          cve: viaInfo?.cwe?.join(', '),
          referenceUrl: viaInfo?.url,
        };

        // Agregar versión fija si está disponible
        if (typeof vuln.fixAvailable === 'object') {
          vulnerability.fixedVersion = vuln.fixAvailable.version;
        }

        vulnerabilities.push(vulnerability);
      }
    }

    const sorted = sortBySeverity(vulnerabilities);

    return {
      total: sorted.length,
      bySeverity: countBySeverity(sorted),
      vulnerabilities: sorted,
    };
  } catch (error) {
    console.error(`❌ Error ejecutando npm audit:`, error);
    return {
      total: 0,
      bySeverity: { critical: 0, high: 0, moderate: 0, low: 0 },
      vulnerabilities: [],
    };
  }
}

/**
 * Genera la solución recomendada para una vulnerabilidad de dependencia
 */
function generateDependencySolution(
  packageName: string,
  fixAvailable: boolean | { name: string; version: string; isSemVerMajor: boolean }
): string {
  if (typeof fixAvailable === 'object') {
    const majorWarning = fixAvailable.isSemVerMajor
      ? '\n\n⚠️ **Nota:** Esta actualización es un cambio de versión mayor. Revisa el changelog antes de actualizar.'
      : '';

    return `Actualizar el paquete a la versión segura:

\`\`\`bash
npm install ${fixAvailable.name}@${fixAvailable.version}
\`\`\`${majorWarning}`;
  }

  if (fixAvailable === true) {
    return `Ejecutar npm audit fix para corregir automáticamente:

\`\`\`bash
npm audit fix
\`\`\`

Si no funciona, intentar con:

\`\`\`bash
npm audit fix --force
\`\`\``;
  }

  return `No hay una corrección automática disponible. Opciones:

1. **Buscar alternativa:** Considera reemplazar \`${packageName}\` por un paquete alternativo mantenido.

2. **Evaluar el riesgo:** Si el paquete no se usa en producción o no procesa datos de usuario, el riesgo puede ser aceptable.

3. **Contactar al mantenedor:** Reportar el issue en el repositorio del paquete.

4. **Fork y parche:** Como último recurso, hacer fork del paquete y aplicar el parche manualmente.`;
}
