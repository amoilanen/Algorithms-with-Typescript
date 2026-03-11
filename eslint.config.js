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
      'src/**/*.js',
    ],
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      // Allow non-null assertions: noUncheckedIndexedAccess makes array
      // element access return T | undefined, but algorithm code with
      // known-valid indices needs `!` to assert definedness.
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
);
