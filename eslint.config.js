import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.vercel', 'tools/**/node_modules', 'tools/**/public']),
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['tools/**', 'scripts/poster/**'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // tools/split-plate-poster — CommonJS Node server + helpers. Different
  // globals (require/process/module/__dirname) + sourceType: commonjs.
  // Keeps these linted, not silenced.
  {
    files: ['tools/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.node },
      sourceType: 'commonjs',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // scripts/ — Node ES modules (build helpers, validators, review tools).
  // Need Node globals for process/Buffer; keep browser globals available
  // for scripts that run inline in a page.evaluate() (e.g. contact sheets).
  {
    files: ['scripts/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.node, ...globals.browser },
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
