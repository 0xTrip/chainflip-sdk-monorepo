import 'dotenv/config';
import {
  BatchBlock,
  BatchContext,
  BatchProcessorEventItem,
  BatchProcessorItem,
  SubstrateBatchProcessor,
} from '@subsquid/substrate-processor';
import { TypeormDatabase } from '@subsquid/typeorm-store';
import {
  EthereumBroadcaster,
  EthereumIngressEgress,
  PolkadotBroadcaster,
  PolkadotIngressEgress,
  Swapping,
  SwappingEventName,
} from './event-handlers';
import { processBlock } from './hooks/processBlock';
import logger from './utils/logger';

// Processor Config
const processor = new SubstrateBatchProcessor()
  .addEvent('*', { data: { event: true } })
  .addEvent(Swapping.SwapIngressReceived, { data: { event: true } })
  .addEvent(Swapping.SwapExecuted, { data: { event: true } })
  .addEvent(Swapping.SwapEgressScheduled, { data: { event: true } })
  .addEvent(PolkadotIngressEgress.EgressScheduled, { data: { event: true } })
  .addEvent(PolkadotIngressEgress.BatchBroadcastRequested, {
    data: { event: true },
  })
  .addEvent(PolkadotBroadcaster.BroadcastSuccess, { data: { event: true } })
  .addEvent(EthereumIngressEgress.EgressScheduled, { data: { event: true } })
  .addEvent(EthereumIngressEgress.BatchBroadcastRequested, {
    data: { event: true },
  })
  .addEvent(EthereumBroadcaster.BroadcastSuccess, { data: { event: true } })
  .addEvent(Swapping.SwapIntentExpired, { data: { event: true } });

export type Item = BatchProcessorItem<typeof processor>;
export type Block = BatchBlock<Item>;
export type Context = BatchContext<unknown, Item>;
export type SwappingEventItem = Extract<
  BatchProcessorEventItem<typeof processor>,
  { name: SwappingEventName }
>;
export type SwappingEvent = SwappingEventItem['event'];

processor.includeAllBlocks();
processor.setDataSource({
  archive: process.env.INGEST_GATEWAY_URL as string,
});

// start
const start = () => {
  processor.run(new TypeormDatabase(), processBlock);
  logger.info('processor started');
};

export default start;
