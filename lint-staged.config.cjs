// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-var-requires
const { ESLint } = require('eslint');

module.exports = {
  '*.{ts,js}': [
    async (files) => {
      const eslint = new ESLint();
      const isIgnored = await Promise.all(
        files.map((file) => eslint.isPathIgnored(file)),
      );
      const filteredFiles = files.filter((_, i) => !isIgnored[i]);
      return [`eslint --max-warnings=0 ${filteredFiles.join(' ')}`];
    },
    'prettier --check',
  ],
};
