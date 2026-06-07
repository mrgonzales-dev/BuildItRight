import { defineConfig } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs,jsx}'] },
  { files: ['**/*.{js,mjs,cjs,jsx}'], languageOptions: { globals: globals.browser } },
  { files: ['**/*.{js,mjs,cjs,jsx}'], rules: { 'react/prop-types': 'off' } },
])
