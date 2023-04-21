import assert from 'assert';
import { GraphQLClient } from 'graphql-request';
import prisma from './client';
import { SwappingEventName, eventHandlers } from './event-handlers';
import type {
  GetBatchQuery,
  GetBatchQueryVariables,
} from './gql/generated/graphql';
import { GET_BATCH } from './gql/query';
import { handleExit, isTruthy } from './utils/function';
import logger from './utils/logger';

const { INGEST_GATEWAY_USERNAME, INGEST_GATEWAY_PASSWORD, INGEST_GATEWAY_URL } =
  process.env;

const createGraphQLClient = () => {
  assert(INGEST_GATEWAY_URL, 'INGEST_GATEWAY_URL is not defined');
  const client = new GraphQLClient(INGEST_GATEWAY_URL);
  if (INGEST_GATEWAY_USERNAME && INGEST_GATEWAY_PASSWORD) {
    client.requestConfig.headers = {
      Authorization: `Basic ${Buffer.from(
        `${INGEST_GATEWAY_USERNAME}:${INGEST_GATEWAY_PASSWORD}`,
      ).toString('base64')}`,
    };
  }
  return client;
};

export default async function processBlocks() {
  const client = createGraphQLClient();
  logger.info('processing blocks');

  let run = true;

  handleExit(() => {
    logger.info('stopping processing of blocks');
    run = false;
  });

  const swapEvents = Object.keys(eventHandlers) as SwappingEventName[];
  let { height: lastBlock } = await prisma.state.upsert({
    where: { id: 1 },
    create: { id: 1, height: 0 },
    update: {},
  });

  while (run) {
    logger.info(
      `processing blocks from ${lastBlock + 1} to ${lastBlock + 50}...`,
    );

    const batch = await client.request<GetBatchQuery, GetBatchQueryVariables>(
      GET_BATCH,
      { height: lastBlock + 1, limit: 50, swapEvents },
    );

    const blocks = batch.blocks?.nodes;

    assert(blocks !== undefined, 'blocks is undefined');

    for (const { events, ...block } of blocks.filter(isTruthy)) {
      const state = await prisma.state.findUniqueOrThrow({ where: { id: 1 } });

      assert(
        state.height === lastBlock,
        'state height is not equal to lastBlock maybe another process is running',
      );

      assert(lastBlock < block.height, 'block height is not increasing');
      await prisma.$transaction(async (txClient) => {
        for (const event of events.nodes.filter(isTruthy)) {
          await eventHandlers[event.name as SwappingEventName]({
            block,
            event,
            prisma: txClient,
          });
        }
        const result = await prisma.state.updateMany({
          where: { id: 1, height: block.height - 1 },
          data: { height: block.height },
        });
        assert(
          result.count === 1,
          'failed to update state, maybe another process is running',
        );
      });
      lastBlock = block.height;
    }
  }
}
