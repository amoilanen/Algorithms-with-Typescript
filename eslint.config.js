import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  prettier,
  {
    ignores: [
      'dist/',
      'build/',
      'coverage/',
      'node_modules/',
      'book/',
      'scripts/',
      // Legacy JS files (will be removed after porting to TypeScript)
      'src/**/*.js',
      'spec/',
    ],
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
);
