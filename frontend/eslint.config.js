// import globals from 'globals';

// import prettier from 'eslint-config-prettier';
// import pluginReact from 'eslint-plugin-react';
// import tseslint from 'typescript-eslint';

// import pluginJs from '@eslint/js';

const globals = require('globals');
const prettier = require('eslint-config-prettier');
const pluginReact = require('eslint-plugin-react');
const tseslint = require('typescript-eslint');
const pluginJs = require('@eslint/js');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  { ignores: ['dist', 'build'] },
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  prettier,
];
