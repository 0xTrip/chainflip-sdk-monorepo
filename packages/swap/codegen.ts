import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://indexer-perseverance.chainflip.io/graphql',
  documents: ['src/gql/query.ts'],
  generates: {
    'src/gql/generated/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
};

export default config;
