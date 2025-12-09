# 🔒 MCP Security Scanner

Servidor MCP (Model Context Protocol) para escaneo de vulnerabilidades en código y dependencias. Genera reportes detallados en español con soluciones priorizadas por criticidad.

## ✨ Características

- 📦 **Escaneo de dependencias** usando npm audit
- 💻 **Análisis de código fuente** para detectar patrones vulnerables (XSS, eval, etc.)
- 🔑 **Detección de secrets** expuestos (API keys, tokens, contraseñas)
- 🇪🇸 **Reportes en español** con soluciones detalladas
- 📊 **Priorización por severidad** (Crítico → Alto → Medio → Bajo)
- 📝 **Reportes en Markdown** fáciles de leer y versionar

## 📋 Requisitos

- Node.js 18.0.0 o superior
- npm 9.0.0 o superior

## 🚀 Instalación

```bash
# Navegar al proyecto
cd mcp-security-scanner

# Instalar dependencias
npm install
```

## 📖 Uso

### Con MCP Inspector (Recomendado para pruebas)

```bash
npm run mcp:inspector
```

Esto abrirá una interfaz web donde puedes:
1. Conectar al servidor
2. Listar herramientas disponibles
3. Ejecutar escaneos de seguridad

### Con Claude Desktop / Windsurf

Agrega esta configuración a tu archivo de configuración MCP:

```json
{
  "mcpServers": {
    "security-scanner": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "/ruta-proyecto/mcp-security-scanner"
    }
  }
}
```

## 🛠️ Herramientas Disponibles

### `scan_dependencies`

Escanea vulnerabilidades en las dependencias del package.json usando npm audit.

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `projectPath` | string | ✅ | Ruta absoluta al proyecto |
| `includeDevDeps` | boolean | ❌ | Incluir devDependencies (default: true) |

**Ejemplo:**
```
"Escanea las dependencias del proyecto en D:/mi-proyecto"
```

### `scan_code_vulnerabilities`

Escanea el código fuente buscando patrones de código vulnerable.

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `projectPath` | string | ✅ | Ruta absoluta al proyecto |
| `patterns` | string[] | ❌ | Patrones glob (default: src/**/*.{ts,tsx,js,jsx}) |

**Detecta:**
- XSS (dangerouslySetInnerHTML, innerHTML)
- Ejecución de código (eval, new Function)
- Almacenamiento inseguro de tokens
- Redirecciones abiertas
- ReDoS potencial

### `scan_secrets`

Detecta secrets expuestos en el código fuente.

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `projectPath` | string | ✅ | Ruta absoluta al proyecto |
| `patterns` | string[] | ❌ | Patrones glob de archivos |

**Detecta:**
- API Keys (Stripe, Google, GitHub, Slack)
- Contraseñas hardcodeadas
- Claves privadas
- Connection strings de bases de datos

### `generate_security_report`

Genera un reporte completo de seguridad en formato Markdown.

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `projectPath` | string | ✅ | Ruta absoluta al proyecto |
| `outputDir` | string | ❌ | Directorio de salida (default: ./reports) |
| `projectName` | string | ❌ | Nombre del proyecto para el reporte |

**Ejemplo:**
```
"Genera un reporte de seguridad completo para el proyecto frontend-app"
```

## 📊 Niveles de Severidad

| Nivel | Emoji | Descripción | Acción Requerida |
|-------|-------|-------------|------------------|
| CRÍTICO | 🔴 | Vulnerabilidad explotable remotamente | Acción inmediata |
| ALTO | 🟠 | Riesgo significativo de seguridad | < 24 horas |
| MEDIO | 🟡 | Vulnerabilidad con impacto limitado | < 1 semana |
| BAJO | 🟢 | Riesgo mínimo | Próximo sprint |

## 📁 Estructura del Proyecto

```
mcp-security-scanner/
├── src/
│   ├── index.ts              # Punto de entrada
│   ├── server.ts             # Configuración del servidor MCP
│   ├── tools/                # Definición de herramientas
│   │   ├── index.ts
│   │   ├── scan-dependencies.tool.ts
│   │   ├── scan-code.tool.ts
│   │   ├── scan-secrets.tool.ts
│   │   └── generate-report.tool.ts
│   ├── services/             # Lógica de negocio
│   │   ├── index.ts
│   │   ├── dependency-scanner.service.ts
│   │   ├── code-scanner.service.ts
│   │   └── report.service.ts
│   ├── patterns/             # Patrones de detección
│   │   ├── index.ts
│   │   └── code-patterns.ts
│   ├── types/                # Tipos TypeScript
│   │   └── index.ts
│   └── utils/                # Utilidades
│       ├── index.ts
│       ├── constants.ts
│       └── formatters.ts
├── docs/
│   └── GUIA_USO.md           # Guía de uso detallada
├── reports/                  # Reportes generados (gitignore)
├── package.json
├── tsconfig.json
└── README.md
```

## 📚 Documentación

- [Guía de Uso Paso a Paso](./docs/GUIA_USO.md) - Instrucciones detalladas

## 🔧 Scripts Disponibles

```bash
# Iniciar servidor MCP
npm start

# Iniciar con MCP Inspector
npm run mcp:inspector

# Verificar tipos TypeScript
npm run typecheck

# Compilar a JavaScript
npm run build
```

## 📄 Licencia

MIT
