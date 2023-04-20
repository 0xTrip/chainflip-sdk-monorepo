import { gql } from 'graphql-request';

export const GET_BATCH = gql`
  query GetBatch($height: Int!, $limit: Int!, $swapEvents: [String!]!) {
    blocks: allBlocks(
      filter: { height: { greaterThanOrEqualTo: $height } }
      first: $limit
      orderBy: HEIGHT_ASC
    ) {
      nodes {
        height
        timestamp
        events: eventsByBlockId(filter: { name: { in: $swapEvents } }) {
          nodes {
            args
            name
          }
        }
      }
    }
  }
`;
