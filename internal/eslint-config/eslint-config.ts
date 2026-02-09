import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { importX } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import globals from 'globals';

const baseConfig: Parameters<typeof defineConfig>[0] = {
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    importX.configs.typescript
  ],
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    'import-x': importX as typeof tseslint.plugin,
  },
  settings: {
    'import-x/resolver-next': [
      createTypeScriptImportResolver({
        alwaysTryTypes: true,
        project: import.meta.dirname,
      }),
    ]
  },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  ignores: ['**/dist/**'],
  rules: {
    eqeqeq: 'error',
    'no-prototype-builtins': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    '@typescript-eslint/unbound-method': 'off',
    'import-x/no-self-import': ['error'],
    'import-x/no-useless-path-segments': ['error'],
    'import-x/first': ['error'],
    'import-x/no-extraneous-dependencies': ['error', {
      devDependencies: true,
      includeInternal: true,
      includeTypes: true,
    }],
    'import-x/extensions': ['error', 'always', {
      fix: true,
      ignorePackages: true,
    }],
    'import-x/no-unresolved': ['error', {
      caseSensitiveStrict: true,
    }],
  }
};

export default defineConfig([
  {
    ...baseConfig,
    files: ['**/*.{js,ts,tsx}'],
    rules: {
      ...baseConfig.rules,
      'import-x/no-commonjs': ['error'],
    },
  },
  {
    ...baseConfig,
    files: ['**/bin/*.cjs'],
    languageOptions: {
      ...baseConfig.languageOptions,
      globals: globals.node,
    },
    rules: {
      ...baseConfig.rules,
      'import-x/no-commonjs': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  }
]);
