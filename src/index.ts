/**
 * MCP Security Scanner Server
 * 
 * Punto de entrada principal del servidor MCP para escaneo de vulnerabilidades.
 * 
 * @author MCP Security Team
 * @version 1.0.0
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

/**
 * Función principal que inicia el servidor MCP
 */
async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error('🔒 MCP Security Scanner Server iniciado');
  console.error('📋 Herramientas disponibles:');
  console.error('   - scan_dependencies: Escanea vulnerabilidades en dependencias');
  console.error('   - scan_code_vulnerabilities: Escanea código fuente');
  console.error('   - scan_secrets: Detecta secrets expuestos');
  console.error('   - generate_security_report: Genera reporte completo');
}

// Iniciar servidor
main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
