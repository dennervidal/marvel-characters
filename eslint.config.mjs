// @ts-check
import eslintPluginAstro from 'eslint-plugin-astro'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import testingLibrary from 'eslint-plugin-testing-library'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      '.astro/**',
      'node_modules/**',
      'public/**',
      'design/**'
    ]
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: tseslint.configs.recommended,
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    extends: [testingLibrary.configs['flat/react']]
  },
  ...eslintPluginAstro.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  prettierConfig
)
