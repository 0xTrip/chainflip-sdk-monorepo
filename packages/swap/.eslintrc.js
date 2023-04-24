module.exports = {
  extends: '../../.eslintrc.json',
  rules: {
    'no-await-in-loop': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: [__dirname],
      },
    ],
  },
};
