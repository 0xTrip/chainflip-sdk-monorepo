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
    'class-methods-use-this': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      { ts: 'never', js: 'never' },
    ],
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
