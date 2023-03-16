module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint'],
  env: {
    jest: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  rules: {
    '@typescript-eslint/array-type': 'error',

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'default-param-last': 'off',
    '@typescript-eslint/default-param-last': ['error'],
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': ['error'],
    'lines-between-class-members': 'off',
    '@typescript-eslint/lines-between-class-members': ['error'],
    // regenerator-runtime on use of for/of
    'no-restricted-syntax': 'off',

    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'import/no-unresolved': 'off',
    'import/order': [
      'error',
      {
        pathGroups: [
          { pattern: '@/**', group: 'internal' },
          { pattern: 'react', group: 'external', position: 'before' },
          { pattern: 'next/**', group: 'external', position: 'before' },
        ],
        groups: [
          ['external', 'builtin'],
          'internal',
          ['sibling', 'parent'],
          'index',
        ],
        pathGroupsExcludedImportTypes: ['internal'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './packages/shared',
            from: './packages',
            except: ['./shared'],
          },
        ],
      },
    ],
    camelcase: 'off',
  },
  ignorePatterns: ['**/dist', '**/generated'],
  settings: {
    'import/resolver': {
      alias: {
        extensions: ['.ts', '.js'],
      },
    },
  },
  globals: {
    jest: true,
  },
  reportUnusedDisableDirectives: true,
  root: true,
};
