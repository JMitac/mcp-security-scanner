# 📖 Guía de Uso - MCP Security Scanner

Guía paso a paso para usar el MCP Security Scanner y generar reportes de vulnerabilidades.

---

## 📋 Tabla de Contenidos

1. [Instalación](#1-instalación)
2. [Configuración en tu IDE](#2-configuración-en-tu-ide)
3. [Uso con MCP Inspector](#3-uso-con-mcp-inspector)
4. [Herramientas Disponibles](#4-herramientas-disponibles)
5. [Ejemplos de Uso](#5-ejemplos-de-uso)
6. [Interpretación del Reporte](#6-interpretación-del-reporte)
7. [Solución de Problemas](#7-solución-de-problemas)

---

## 1. Instalación

### Paso 1: Navegar al directorio del MCP

```bash
cd d:/deploys/frontend-exchange-rimac/mcp-security-scanner
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Verificar instalación

```bash
npm run typecheck
```

Si no hay errores, la instalación fue exitosa.

---

## 2. Configuración en tu IDE

### Para Windsurf / Cascade

Edita el archivo de configuración MCP (generalmente en la configuración del IDE):

```json
{
  "mcpServers": {
    "security-scanner": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "D:/deploys/frontend-exchange-rimac/mcp-security-scanner"
    }
  }
}
```

### Para Claude Desktop

Edita `claude_desktop_config.json`:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "security-scanner": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "D:/deploys/frontend-exchange-rimac/mcp-security-scanner"
    }
  }
}
```

### Paso final: Reiniciar el IDE

Después de guardar la configuración, reinicia tu IDE para que detecte el nuevo servidor MCP.

---

## 3. Uso con MCP Inspector

El MCP Inspector es una herramienta visual para probar servidores MCP.

### Paso 1: Iniciar el inspector

```bash
cd d:/deploys/frontend-exchange-rimac/mcp-security-scanner
npm run mcp:inspector
```

### Paso 2: Conectar al servidor

1. Se abrirá una ventana del navegador
2. Haz clic en "Connect" para conectar al servidor
3. Verás las 4 herramientas disponibles en el panel izquierdo

### Paso 3: Ejecutar una herramienta

1. Selecciona una herramienta (ej: `generate_security_report`)
2. Completa los parámetros requeridos
3. Haz clic en "Run"
4. El resultado aparecerá en el panel derecho

---

## 4. Herramientas Disponibles

### 4.1 `scan_dependencies`

**Propósito:** Escanear vulnerabilidades en las dependencias del package.json

**Parámetros:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `projectPath` | string | ✅ | Ruta absoluta al proyecto |
| `includeDevDeps` | boolean | ❌ | Incluir devDependencies |

**Qué detecta:**
- Vulnerabilidades conocidas en paquetes npm
- CVEs asociados
- Versiones afectadas y versiones seguras

---

### 4.2 `scan_code_vulnerabilities`

**Propósito:** Detectar patrones de código vulnerable

**Parámetros:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `projectPath` | string | ✅ | Ruta absoluta al proyecto |
| `patterns` | string[] | ❌ | Patrones glob de archivos |

**Qué detecta:**

| Vulnerabilidad | Severidad | Ejemplo |
|----------------|-----------|---------|
| XSS via dangerouslySetInnerHTML | 🟠 Alta | `<div dangerouslySetInnerHTML={{__html: input}}/>` |
| XSS via innerHTML | 🟠 Alta | `element.innerHTML = userInput` |
| Ejecución de código con eval() | 🔴 Crítica | `eval(userCode)` |
| Ejecución con new Function() | 🔴 Crítica | `new Function(code)()` |
| Tokens en localStorage | 🟡 Media | `localStorage.setItem('token', jwt)` |
| Redirecciones abiertas | 🟡 Media | `window.location = userUrl` |
| ReDoS potencial | 🟡 Media | `new RegExp(userInput)` |

---

### 4.3 `scan_secrets`

**Propósito:** Detectar secrets y credenciales expuestas

**Parámetros:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `projectPath` | string | ✅ | Ruta absoluta al proyecto |
| `patterns` | string[] | ❌ | Patrones glob de archivos |

**Qué detecta:**

| Secret | Patrón | Ejemplo |
|--------|--------|---------|
| API Key de Stripe | `sk_live_*`, `pk_live_*` | `"sk_live_abc123..."` |
| API Key de Google | `AIza*` | `"AIzaSyAbc123..."` |
| Token de GitHub | `ghp_*` | `"ghp_abc123..."` |
| Token de Slack | `xoxb-*`, `xoxp-*` | `"xoxb-123-456-abc"` |
| Contraseñas | `password = "..."` | `const password = "secret123"` |
| API Keys genéricas | `api_key = "..."` | `const apiKey = "abc123..."` |
| Claves privadas | `-----BEGIN PRIVATE KEY-----` | PEM keys |
| MongoDB URI | `mongodb://user:pass@` | Connection strings |
| PostgreSQL URI | `postgres://user:pass@` | Connection strings |

---

### 4.4 `generate_security_report`

**Propósito:** Generar un reporte completo consolidando todos los escaneos

**Parámetros:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `projectPath` | string | ✅ | Ruta absoluta al proyecto |
| `outputDir` | string | ❌ | Directorio de salida (default: ./reports) |
| `projectName` | string | ❌ | Nombre para el título del reporte |

**Qué genera:**
- Archivo Markdown con todas las vulnerabilidades
- Resumen ejecutivo con métricas
- Vulnerabilidades ordenadas por severidad
- Soluciones detalladas para cada problema
- Tabla de dependencias a actualizar
- Comandos de remediación

---

## 5. Ejemplos de Uso

### Ejemplo 1: Escaneo rápido de dependencias

**Prompt en tu IDE:**
```
Escanea las vulnerabilidades en las dependencias del proyecto D:/mi-proyecto
```

**Resultado esperado:**
```markdown
## 📦 Escaneo de Dependencias

**Total de vulnerabilidades:** 5

### Por Severidad
🔴 Críticas: 1
🟠 Altas: 2
🟡 Medias: 2

### Vulnerabilidades Encontradas

#### 🔴 Prototype Pollution en lodash
- **Paquete:** `lodash`
- **Versión actual:** 4.17.15
- **Versión segura:** 4.17.21
...
```

---

### Ejemplo 2: Buscar secrets expuestos

**Prompt en tu IDE:**
```
Busca secrets expuestos en el código del proyecto D:/mi-proyecto
```

---

### Ejemplo 3: Generar reporte completo

**Prompt en tu IDE:**
```
Genera un reporte de seguridad completo para el proyecto "Frontend App" ubicado en D:/mi-proyecto
```

**Resultado:**
- Se crea archivo `reports/REPORTE_SEGURIDAD_2024-12-09.md`
- Se muestra resumen en el chat

---

### Ejemplo 4: Escanear solo ciertos archivos

**Prompt en tu IDE:**
```
Escanea vulnerabilidades en el código, pero solo en los archivos de la carpeta src/components del proyecto D:/mi-proyecto
```

El MCP usará el parámetro `patterns: ["src/components/**/*.{ts,tsx}"]`

---

## 6. Interpretación del Reporte

### Estructura del Reporte Generado

```markdown
# 🔒 Reporte de Seguridad - Mi Proyecto

## 📊 Resumen Ejecutivo
| Métrica | Valor |
|---------|-------|
| Total de vulnerabilidades | 12 |
| 🔴 Críticas | 2 |
| 🟠 Altas | 3 |
| 🟡 Medias | 5 |
| 🟢 Bajas | 2 |

## 🔴 VULNERABILIDADES CRÍTICAS
### 1. [Título de la vulnerabilidad]
- **Tipo:** Dependencia / Código / Secret
- **Ubicación:** archivo:línea
- **Descripción:** Explicación del problema
- **Solución:** Código o comando para resolver

## 📦 Dependencias a Actualizar
| Paquete | Versión Actual | Versión Segura | Severidad |
|---------|---------------|----------------|-----------|
| lodash  | 4.17.15       | 4.17.21        | 🔴 CRÍTICO |

## ✅ Comandos de Remediación Rápida
```

### Priorización de Acciones

1. **🔴 CRÍTICAS** - Resolver inmediatamente
   - Pueden ser explotadas remotamente
   - Riesgo de pérdida de datos o acceso no autorizado

2. **🟠 ALTAS** - Resolver en 24 horas
   - Riesgo significativo pero requiere condiciones específicas

3. **🟡 MEDIAS** - Resolver en 1 semana
   - Impacto limitado o difícil de explotar

4. **🟢 BAJAS** - Resolver en próximo sprint
   - Mejores prácticas, bajo riesgo real

---

## 7. Solución de Problemas

### Error: "No se encontró package.json"

**Causa:** La ruta del proyecto es incorrecta o no existe package.json

**Solución:**
1. Verificar que la ruta sea absoluta (ej: `D:/proyectos/mi-app`)
2. Verificar que exista `package.json` en esa ruta

---

### Error: "No se encontró package-lock.json"

**Causa:** No se ha ejecutado `npm install` en el proyecto

**Solución:**
```bash
cd /ruta/al/proyecto
npm install
```

---

### El escaneo de código no encuentra nada

**Causa:** Los patrones de archivos no coinciden

**Solución:**
1. Verificar que exista la carpeta `src/`
2. Especificar patrones personalizados si tu estructura es diferente:
   ```
   patterns: ["app/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"]
   ```

---

### El servidor MCP no se conecta

**Causa:** Configuración incorrecta o dependencias no instaladas

**Solución:**
1. Verificar que se ejecutó `npm install`
2. Verificar la ruta en la configuración MCP
3. Reiniciar el IDE después de cambiar la configuración

---

## 📞 Soporte

Si encuentras problemas o tienes sugerencias:
1. Revisa esta guía de solución de problemas
2. Verifica los logs del servidor MCP
3. Contacta al equipo de desarrollo

---

*Documentación actualizada: Diciembre 2024*
