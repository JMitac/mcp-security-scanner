/**
 * Configuración del servidor MCP
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { toolSchemas, toolHandlers } from './tools/index.js';

/**
 * Crea y configura el servidor MCP
 * @returns Instancia del servidor MCP configurado
 */
export function createServer(): Server {
  const server = new Server(
    {
      name: 'security-scanner',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handler para listar herramientas disponibles
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: toolSchemas,
  }));

  // Handler para ejecutar herramientas
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const handler = toolHandlers[name];

    if (!handler) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ Herramienta no encontrada: ${name}`,
          },
        ],
        isError: true,
      };
    }

    const result = await handler(args || {});
    return result as { content: Array<{ type: 'text'; text: string }>; isError?: boolean };
  });

  return server;
}
