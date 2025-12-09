/**
 * CÓDIGO CON VULNERABILIDADES INTENCIONALES
 * Solo para pruebas del MCP Security Scanner
 * ⚠️ NO USAR EN PRODUCCIÓN
 */

// 🔴 VULNERABILIDAD CRÍTICA: eval() con entrada de usuario
export function executeUserCode(userCode: string): unknown {
  // ⚠️ VULNERABLE: Ejecuta código arbitrario
  return eval(userCode);
}

// 🔴 VULNERABILIDAD CRÍTICA: new Function() con entrada de usuario
export function createDynamicFunction(code: string): () => unknown {
  // ⚠️ VULNERABLE: Crea función con código arbitrario
  return new Function(code) as () => unknown;
}

// 🟠 VULNERABILIDAD: Token almacenado en localStorage
export function saveAuthToken(token: string): void {
  // ⚠️ VULNERABLE: Los tokens en localStorage son accesibles por XSS
  localStorage.setItem('token', token);
  localStorage.setItem('auth_token', token);
  localStorage.setItem('jwt', token);
}

// 🟠 VULNERABILIDAD: Token en sessionStorage
export function saveSessionToken(token: string): void {
  // ⚠️ VULNERABLE: También vulnerable a XSS
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('access_token', token);
}

// 🟡 VULNERABILIDAD: Redirección abierta
export function redirectUser(url: string): void {
  // ⚠️ VULNERABLE: Permite redirección a cualquier URL
  window.location = url as unknown as Location;
}

// 🟡 VULNERABILIDAD: RegExp con entrada de usuario (ReDoS)
export function searchWithRegex(userPattern: string, text: string): boolean {
  // ⚠️ VULNERABLE: Patrones maliciosos pueden causar ReDoS
  const regex = new RegExp(userPattern);
  return regex.test(text);
}

// 🟡 VULNERABILIDAD: Console.log con información sensible
export function debugAuth(password: string, token: string): void {
  // ⚠️ VULNERABLE: Expone información sensible en consola
  console.log('Password del usuario:', password);
  console.log('Token de autenticación:', token);
  console.debug('Credenciales:', { password, token });
}

// 🟢 VULNERABILIDAD: Fetch con URL dinámica
export async function fetchData(userUrl: string): Promise<unknown> {
  // ⚠️ POTENCIALMENTE VULNERABLE: URL no validada
  const response = await fetch(userUrl);
  return response.json();
}
