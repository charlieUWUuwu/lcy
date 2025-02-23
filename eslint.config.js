import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
    // https://stackoverflow.com/questions/72780296/warning-react-version-not-specified-in-eslint-plugin-react-settings-while-run
    {
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
        ignores: ['dist/**/*'],
        ...reactRecommended,
        settings: {
            react: {
                version: 'detect',
            },
        },
        // extends: [
        //   // ...,
        //   "plugin:react-hooks/recommended",
        //   'eslint:recommended',
        //   'plugin:@typescript-eslint/recommended',
        //   'plugin:prettier/recommended',
        //   'prettier'
        // ],
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021,
                ...globals.node,
            },
        },
        rules: {
            // https://coreui.io/blog/how-to-fix-react-must-be-in-scope-when-using-jsx/
            'react/react-in-jsx-scope': 'off', // 避免 {} 才視為一組
            'react/jsx-uses-react': 'off',
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    // https://qiita.com/masafumi1073/items/703f2af253f6c3971883
    prettier,
];
