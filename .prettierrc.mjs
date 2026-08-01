// @ts-check
/** @type {import('prettier').Config} */
export default {
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  tabWidth: 2,
  jsxSingleQuote: true,
  bracketSpacing: true,
  arrowParens: 'avoid',
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: { parser: 'astro' }
    }
  ]
}
