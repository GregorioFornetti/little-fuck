import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default [
  { languageOptions:
    {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: tseslint.parser
      }
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'capitalized-comments': ['warn'],
      'eol-last': ['error', 'always'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'require-atomic-updates': 'off',
      'no-console': 'off',
      'no-trailing-spaces': ['error'],
      'no-multi-spaces': ['error'],
      'no-multiple-empty-lines': ['error', { 'max': 1 }],
      'comma-spacing': ['error'],
      'arrow-spacing': ['error'],
      'space-infix-ops': ['error'],
      'block-spacing': ['error'],
      'object-curly-spacing': ['error', 'always'],
      'spaced-comment': ['error', 'always'],
      'space-before-blocks': ['error', 'always'],
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
];
