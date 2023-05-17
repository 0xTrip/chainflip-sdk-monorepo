// eslint-disable-next-line import/no-relative-packages
import baseConfig from '../../jest.config.mjs';

export default {
  ...baseConfig,
  rootDir: '../../',
  roots: ['<rootDir>/packages/swap/src'],
  globalSetup: '<rootDir>/packages/swap/jest.setup.mjs',
};
