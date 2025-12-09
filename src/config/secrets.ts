/**
 * ARCHIVO CON SECRETS EXPUESTOS INTENCIONALES
 * Solo para pruebas del MCP Security Scanner
 * ⚠️ NO USAR EN PRODUCCIÓN - ESTOS SON VALORES FALSOS
 */

// 🔴 VULNERABILIDAD CRÍTICA: API Key de Stripe hardcodeada
export const STRIPE_SECRET_KEY = "FAKE_stripe_sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX";
export const STRIPE_PUBLIC_KEY = "FAKE_stripe_pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX";

// 🔴 VULNERABILIDAD CRÍTICA: API Key de Google
export const GOOGLE_API_KEY = "FAKE_google_AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX";

// 🔴 VULNERABILIDAD CRÍTICA: Token de GitHub
export const GITHUB_TOKEN = "FAKE_github_ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

// 🔴 VULNERABILIDAD CRÍTICA: Contraseña hardcodeada
const password = "SuperSecretPassword123!";
const dbPassword = "admin123456";
export const API_PASSWORD = "my_secret_api_password";

// 🔴 VULNERABILIDAD CRÍTICA: API Key genérica
export const api_key = "abcdef123456789ghijklmnopqrstuvwxyz";
export const apiSecret = "secret_key_1234567890abcdefghij";

// 🔴 VULNERABILIDAD CRÍTICA: Connection string de MongoDB
export const MONGODB_URI = "mongodb+srv://admin:password123@cluster0.abc123.mongodb.net/mydb";

// 🔴 VULNERABILIDAD CRÍTICA: Connection string de PostgreSQL
export const DATABASE_URL = "postgres://admin:secretpass@localhost:5432/myapp";

// 🔴 VULNERABILIDAD CRÍTICA: Token de Slack
export const SLACK_TOKEN = "FAKE_slack_xoxb_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

// 🔴 VULNERABILIDAD CRÍTICA: Secret key
export const secret_key = "my_super_secret_key_12345678";
export const clientSecret = "client_secret_abcdefghijklmnop";

// Función que usa los secrets (para que no den warning de unused)
export function getConfig() {
  return {
    stripe: STRIPE_SECRET_KEY,
    google: GOOGLE_API_KEY,
    github: GITHUB_TOKEN,
    password,
    dbPassword,
    mongodb: MONGODB_URI,
    postgres: DATABASE_URL,
    slack: SLACK_TOKEN,
  };
}
