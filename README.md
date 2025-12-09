# 🧪 Test Vulnerable App

**⚠️ PROYECTO DE PRUEBA - NO USAR EN PRODUCCIÓN**

Este proyecto contiene vulnerabilidades intencionales para probar el MCP Security Scanner.

## Vulnerabilidades incluidas

### 📦 Dependencias vulnerables
- `lodash@4.17.15` - Prototype Pollution (CVE-2020-8203)
- `axios@0.21.0` - SSRF vulnerability
- `minimist@1.2.5` - Prototype Pollution
- `node-fetch@2.6.0` - Vulnerabilidades conocidas

### 💻 Código vulnerable (`src/`)
- **XSS** - `dangerouslySetInnerHTML` sin sanitizar
- **XSS** - `innerHTML` directo
- **eval()** - Ejecución de código arbitrario
- **new Function()** - Creación de funciones dinámicas
- **localStorage** - Tokens almacenados inseguramente
- **Redirecciones abiertas** - `window.location` sin validar
- **ReDoS** - RegExp con entrada de usuario

### 🔑 Secrets expuestos (`src/config/secrets.ts`)
- API Keys de Stripe, Google, GitHub
- Tokens de Slack
- Contraseñas hardcodeadas
- Connection strings de MongoDB y PostgreSQL

## Cómo probar

1. Abre el MCP Inspector del security-scanner
2. Usa `generate_security_report` con:
   ```
   projectPath: D:/ruta-proyecto/test-vulnerable-app
   ```
3. Revisa el reporte generado

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
