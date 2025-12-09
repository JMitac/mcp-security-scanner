/**
 * Tipos e interfaces del MCP Security Scanner
 */

// ============================================
// Niveles de severidad
// ============================================

/**
 * Niveles de severidad de vulnerabilidades
 */
export type Severity = 'critical' | 'high' | 'moderate' | 'low';

/**
 * Tipo de vulnerabilidad
 */
export type VulnerabilityType = 'dependency' | 'code' | 'secret';

// ============================================
// Parámetros de las herramientas
// ============================================

/**
 * Parámetros para scan_dependencies
 */
export interface ScanDependenciesParams {
  /** Ruta al proyecto a escanear */
  projectPath: string;
  /** Incluir devDependencies en el análisis (default: true) */
  includeDevDeps?: boolean;
}

/**
 * Parámetros para scan_code_vulnerabilities
 */
export interface ScanCodeParams {
  /** Ruta al proyecto a escanear */
  projectPath: string;
  /** Patrones glob de archivos a escanear (default: src/**\/*.{ts,tsx,js,jsx}) */
  patterns?: string[];
}

/**
 * Parámetros para scan_secrets
 */
export interface ScanSecretsParams {
  /** Ruta al proyecto a escanear */
  projectPath: string;
  /** Patrones glob de archivos a escanear */
  patterns?: string[];
}

/**
 * Parámetros para generate_security_report
 */
export interface GenerateReportParams {
  /** Ruta al proyecto a escanear */
  projectPath: string;
  /** Ruta de salida del reporte (default: ./reports) */
  outputDir?: string;
  /** Nombre del proyecto para el reporte */
  projectName?: string;
}

// ============================================
// Vulnerabilidades
// ============================================

/**
 * Vulnerabilidad detectada
 */
export interface Vulnerability {
  /** Identificador único */
  id: string;
  /** Tipo de vulnerabilidad */
  type: VulnerabilityType;
  /** Nivel de severidad */
  severity: Severity;
  /** Título de la vulnerabilidad */
  title: string;
  /** Descripción detallada */
  description: string;
  /** Solución recomendada */
  solution: string;
  /** Paquete afectado (para dependencias) */
  package?: string;
  /** Versión actual del paquete */
  currentVersion?: string;
  /** Versión segura recomendada */
  fixedVersion?: string;
  /** Archivo afectado (para código) */
  file?: string;
  /** Número de línea */
  line?: number;
  /** Código vulnerable encontrado */
  codeSnippet?: string;
  /** CVE asociado */
  cve?: string;
  /** URL con más información */
  referenceUrl?: string;
}

/**
 * Resultado del escaneo de dependencias
 */
export interface DependencyScanResult {
  /** Total de vulnerabilidades encontradas */
  total: number;
  /** Conteo por severidad */
  bySeverity: Record<Severity, number>;
  /** Lista de vulnerabilidades */
  vulnerabilities: Vulnerability[];
}

/**
 * Resultado del escaneo de código
 */
export interface CodeScanResult {
  /** Total de vulnerabilidades encontradas */
  total: number;
  /** Conteo por severidad */
  bySeverity: Record<Severity, number>;
  /** Lista de vulnerabilidades */
  vulnerabilities: Vulnerability[];
  /** Archivos escaneados */
  filesScanned: number;
}

/**
 * Resultado completo del escaneo de seguridad
 */
export interface SecurityScanResult {
  /** Fecha del escaneo */
  date: string;
  /** Nombre del proyecto */
  projectName: string;
  /** Ruta del proyecto */
  projectPath: string;
  /** Total de vulnerabilidades */
  total: number;
  /** Conteo por severidad */
  bySeverity: Record<Severity, number>;
  /** Vulnerabilidades en dependencias */
  dependencies: Vulnerability[];
  /** Vulnerabilidades en código */
  code: Vulnerability[];
  /** Secrets expuestos */
  secrets: Vulnerability[];
}

// ============================================
// Patrones de detección
// ============================================

/**
 * Patrón de código vulnerable
 */
export interface VulnerablePattern {
  /** Expresión regular para detectar */
  pattern: RegExp;
  /** Severidad de la vulnerabilidad */
  severity: Severity;
  /** Tipo de vulnerabilidad */
  type: VulnerabilityType;
  /** Título en español */
  title: string;
  /** Descripción en español */
  description: string;
  /** Solución recomendada en español */
  solution: string;
}

// ============================================
// Respuestas del MCP
// ============================================

/**
 * Contenido de respuesta del MCP
 */
export interface McpContent {
  type: 'text';
  text: string;
}

/**
 * Respuesta de una herramienta MCP
 */
export interface McpToolResponse {
  content: McpContent[];
  isError?: boolean;
}

// ============================================
// npm audit types
// ============================================

/**
 * Resultado de npm audit
 */
export interface NpmAuditResult {
  auditReportVersion?: number;
  vulnerabilities?: Record<string, NpmVulnerability>;
  metadata?: {
    vulnerabilities: Record<Severity, number>;
    dependencies: number;
    devDependencies: number;
    totalDependencies: number;
  };
}

/**
 * Vulnerabilidad de npm audit
 */
export interface NpmVulnerability {
  name: string;
  severity: Severity;
  isDirect: boolean;
  via: Array<string | NpmVulnerabilityVia>;
  effects: string[];
  range: string;
  nodes: string[];
  fixAvailable: boolean | NpmFixAvailable;
}

/**
 * Información de la vulnerabilidad via
 */
export interface NpmVulnerabilityVia {
  source: number;
  name: string;
  dependency: string;
  title: string;
  url: string;
  severity: Severity;
  cwe: string[];
  cvss: {
    score: number;
    vectorString: string;
  };
  range: string;
}

/**
 * Información de fix disponible
 */
export interface NpmFixAvailable {
  name: string;
  version: string;
  isSemVerMajor: boolean;
}
