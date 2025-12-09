/**
 * Patrones de código vulnerable para detección
 */

import type { VulnerablePattern } from '../types/index.js';

/**
 * Patrones de código vulnerable a detectar
 */
export const CODE_VULNERABILITY_PATTERNS: VulnerablePattern[] = [
  // ============================================
  // XSS (Cross-Site Scripting)
  // ============================================
  {
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:\s*(?!DOMPurify)/g,
    severity: 'high',
    type: 'code',
    title: 'XSS - dangerouslySetInnerHTML sin sanitizar',
    description:
      'El uso de dangerouslySetInnerHTML sin sanitización permite que un atacante inyecte scripts maliciosos que se ejecutarán en el navegador de los usuarios.',
    solution: `Usar DOMPurify para sanitizar el contenido:

\`\`\`tsx
import DOMPurify from 'dompurify';

// ❌ Vulnerable
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Seguro
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
\`\`\`

O mejor aún, evitar dangerouslySetInnerHTML completamente usando componentes React.`,
  },
  {
    pattern: /\.innerHTML\s*=/g,
    severity: 'high',
    type: 'code',
    title: 'XSS - Asignación directa a innerHTML',
    description:
      'Asignar contenido directamente a innerHTML sin sanitizar puede permitir ataques XSS.',
    solution: `Usar textContent para texto plano o sanitizar el HTML:

\`\`\`javascript
// ❌ Vulnerable
element.innerHTML = userInput;

// ✅ Seguro - Para texto plano
element.textContent = userInput;

// ✅ Seguro - Para HTML
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
\`\`\``,
  },

  // ============================================
  // Ejecución de código arbitrario
  // ============================================
  {
    pattern: /\beval\s*\(/g,
    severity: 'critical',
    type: 'code',
    title: 'Ejecución de código arbitrario - eval()',
    description:
      'eval() ejecuta código JavaScript arbitrario, permitiendo a un atacante ejecutar cualquier código si controla la entrada.',
    solution: `Eliminar el uso de eval() y usar alternativas seguras:

\`\`\`javascript
// ❌ Vulnerable
const result = eval(userInput);

// ✅ Seguro - Para JSON
const result = JSON.parse(jsonString);

// ✅ Seguro - Para expresiones matemáticas
// Usar una librería como mathjs
import { evaluate } from 'mathjs';
const result = evaluate(expression);
\`\`\``,
  },
  {
    pattern: /new\s+Function\s*\(/g,
    severity: 'critical',
    type: 'code',
    title: 'Ejecución de código arbitrario - new Function()',
    description:
      'El constructor Function() es similar a eval() y permite ejecutar código arbitrario.',
    solution: `Evitar el uso de new Function() y usar alternativas seguras según el caso de uso.`,
  },

  // ============================================
  // Almacenamiento inseguro
  // ============================================
  {
    pattern: /localStorage\.setItem\s*\(\s*['"`](?:token|auth|jwt|session|access_token|refresh_token)/gi,
    severity: 'moderate',
    type: 'code',
    title: 'Token de autenticación en localStorage',
    description:
      'Almacenar tokens de autenticación en localStorage los expone a ataques XSS. Si un atacante logra ejecutar JavaScript en tu sitio, puede robar estos tokens.',
    solution: `Usar cookies httpOnly para tokens de autenticación:

\`\`\`javascript
// ❌ Vulnerable - Token accesible por JavaScript
localStorage.setItem('token', authToken);

// ✅ Seguro - Configurar en el backend
// Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict

// En el frontend, las cookies httpOnly se envían automáticamente
// No necesitas manejar el token manualmente
\`\`\``,
  },
  {
    pattern: /sessionStorage\.setItem\s*\(\s*['"`](?:token|auth|jwt|session|access_token|refresh_token)/gi,
    severity: 'moderate',
    type: 'code',
    title: 'Token de autenticación en sessionStorage',
    description:
      'Almacenar tokens en sessionStorage también los expone a ataques XSS.',
    solution: `Usar cookies httpOnly para tokens de autenticación en lugar de sessionStorage.`,
  },

  // ============================================
  // Console logs en producción
  // ============================================
  {
    pattern: /console\.(log|debug|info|warn|error)\s*\([^)]*(?:password|token|secret|key|credential|auth)/gi,
    severity: 'moderate',
    type: 'code',
    title: 'Información sensible en console.log',
    description:
      'Los console.log que imprimen información sensible pueden exponer datos confidenciales en las herramientas de desarrollo del navegador.',
    solution: `Eliminar console.log con información sensible o usar un logger configurable:

\`\`\`javascript
// ❌ Vulnerable
console.log('Token:', userToken);
console.log('Password:', password);

// ✅ Seguro - Usar logger configurable
import { logger } from '@/lib/logger';

// El logger solo imprime en desarrollo
if (process.env.NODE_ENV === 'development') {
  logger.debug('Auth state:', { isAuthenticated: true });
}
\`\`\``,
  },

  // ============================================
  // URLs y redirecciones
  // ============================================
  {
    pattern: /window\.location\s*=\s*(?!['"`])/g,
    severity: 'moderate',
    type: 'code',
    title: 'Redirección abierta potencial',
    description:
      'Asignar una variable a window.location sin validar puede permitir redirecciones a sitios maliciosos (Open Redirect).',
    solution: `Validar URLs antes de redirigir:

\`\`\`javascript
// ❌ Vulnerable
window.location = userProvidedUrl;

// ✅ Seguro - Validar que sea una URL interna
const isInternalUrl = (url: string) => {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
};

if (isInternalUrl(redirectUrl)) {
  window.location = redirectUrl;
}
\`\`\``,
  },

  // ============================================
  // Expresiones regulares
  // ============================================
  {
    pattern: /new\s+RegExp\s*\(\s*(?!['"`])/g,
    severity: 'moderate',
    type: 'code',
    title: 'RegExp con entrada de usuario - ReDoS potencial',
    description:
      'Crear expresiones regulares con entrada de usuario puede causar ataques de denegación de servicio (ReDoS) con patrones maliciosos.',
    solution: `Evitar crear RegExp con entrada de usuario o sanitizar la entrada:

\`\`\`javascript
// ❌ Vulnerable
const regex = new RegExp(userInput);

// ✅ Seguro - Escapar caracteres especiales
const escapeRegex = (str: string) => 
  str.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

const regex = new RegExp(escapeRegex(userInput));
\`\`\``,
  },

  // ============================================
  // Fetch/HTTP sin validación
  // ============================================
  {
    pattern: /fetch\s*\(\s*(?!['"`])/g,
    severity: 'low',
    type: 'code',
    title: 'Fetch con URL dinámica',
    description:
      'Usar fetch con URLs dinámicas sin validación puede permitir SSRF (Server-Side Request Forgery) si la URL proviene del usuario.',
    solution: `Validar URLs antes de hacer fetch:

\`\`\`javascript
// ❌ Potencialmente vulnerable
fetch(userProvidedUrl);

// ✅ Seguro - Usar URLs predefinidas
const API_ENDPOINTS = {
  users: '/api/users',
  products: '/api/products',
};

fetch(API_ENDPOINTS[endpoint]);

// ✅ Seguro - Validar contra whitelist
const ALLOWED_DOMAINS = ['api.midominio.com'];
const url = new URL(userUrl);
if (ALLOWED_DOMAINS.includes(url.hostname)) {
  fetch(userUrl);
}
\`\`\``,
  },
];

/**
 * Patrones para detectar secrets expuestos
 */
export const SECRET_PATTERNS: VulnerablePattern[] = [
  {
    pattern: /['"`](?:sk|pk)[-_](?:live|test)[-_][a-zA-Z0-9]{24,}['"`]/g,
    severity: 'critical',
    type: 'secret',
    title: 'API Key de Stripe expuesta',
    description: 'Se detectó una API key de Stripe hardcodeada en el código fuente.',
    solution: `Mover la API key a variables de entorno:

\`\`\`bash
# .env
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx  # Solo en backend
\`\`\`

\`\`\`javascript
// En el código
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
\`\`\``,
  },
  {
    pattern: /['"`]AIza[0-9A-Za-z-_]{35}['"`]/g,
    severity: 'critical',
    type: 'secret',
    title: 'API Key de Google expuesta',
    description: 'Se detectó una API key de Google hardcodeada en el código fuente.',
    solution: `Mover la API key a variables de entorno y restringir su uso en la consola de Google Cloud.`,
  },
  {
    pattern: /['"`]ghp_[a-zA-Z0-9]{36}['"`]/g,
    severity: 'critical',
    type: 'secret',
    title: 'Token de GitHub expuesto',
    description: 'Se detectó un Personal Access Token de GitHub hardcodeado.',
    solution: `Usar GitHub Actions secrets o variables de entorno. Revocar el token expuesto inmediatamente.`,
  },
  {
    pattern: /['"`]xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}['"`]/g,
    severity: 'critical',
    type: 'secret',
    title: 'Token de Slack expuesto',
    description: 'Se detectó un token de Slack hardcodeado en el código fuente.',
    solution: `Mover el token a variables de entorno y rotarlo inmediatamente.`,
  },
  {
    pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"`][^'"`]{4,}['"`]/gi,
    severity: 'critical',
    type: 'secret',
    title: 'Contraseña hardcodeada',
    description: 'Se detectó una contraseña hardcodeada en el código fuente.',
    solution: `Nunca hardcodear contraseñas. Usar variables de entorno o un gestor de secretos:

\`\`\`javascript
// ❌ Vulnerable
const password = "mi_password_123";

// ✅ Seguro
const password = process.env.DB_PASSWORD;
\`\`\``,
  },
  {
    pattern: /(?:api[_-]?key|apikey|api[_-]?secret)\s*[:=]\s*['"`][a-zA-Z0-9_-]{16,}['"`]/gi,
    severity: 'high',
    type: 'secret',
    title: 'API Key hardcodeada',
    description: 'Se detectó una API key genérica hardcodeada en el código fuente.',
    solution: `Mover todas las API keys a variables de entorno:

\`\`\`bash
# .env
VITE_API_KEY=tu_api_key
\`\`\`

\`\`\`javascript
const apiKey = import.meta.env.VITE_API_KEY;
\`\`\``,
  },
  {
    pattern: /(?:secret[_-]?key|secretkey|client[_-]?secret)\s*[:=]\s*['"`][a-zA-Z0-9_-]{16,}['"`]/gi,
    severity: 'critical',
    type: 'secret',
    title: 'Secret Key hardcodeada',
    description: 'Se detectó una secret key hardcodeada en el código fuente.',
    solution: `Las secret keys NUNCA deben estar en el frontend. Moverlas al backend y usar variables de entorno.`,
  },
  {
    pattern: /['"`]-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    severity: 'critical',
    type: 'secret',
    title: 'Clave privada expuesta',
    description: 'Se detectó una clave privada hardcodeada en el código fuente.',
    solution: `Eliminar inmediatamente la clave privada del código. Generar una nueva clave y almacenarla de forma segura.`,
  },
  {
    pattern: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@/g,
    severity: 'critical',
    type: 'secret',
    title: 'Credenciales de MongoDB expuestas',
    description: 'Se detectó una connection string de MongoDB con credenciales.',
    solution: `Mover la connection string a variables de entorno:

\`\`\`bash
# .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
\`\`\``,
  },
  {
    pattern: /postgres(?:ql)?:\/\/[^:]+:[^@]+@/g,
    severity: 'critical',
    type: 'secret',
    title: 'Credenciales de PostgreSQL expuestas',
    description: 'Se detectó una connection string de PostgreSQL con credenciales.',
    solution: `Mover la connection string a variables de entorno.`,
  },
];
