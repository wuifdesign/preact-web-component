import js from '@eslint/js'
// eslint-disable-next-line import/default
import tsParser from '@typescript-eslint/parser'
import eslintImport from 'eslint-plugin-import'
import eslintPrettier from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import { configs as tsConfigs } from 'typescript-eslint'

export default [
  js.configs.recommended,
  ...tsConfigs.recommended,
  eslintImport.flatConfigs.recommended,
  eslintImport.flatConfigs.typescript,
  eslintPrettier,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parser: tsParser,
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          named: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      'prefer-template': 'warn',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'warn',
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowWithName: 'Props$',
        },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
  },
  {
    ignores: ['dist/*'],
  },
]
