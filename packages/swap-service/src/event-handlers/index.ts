import { Prisma } from '.prisma/client';
import networkBatchBroadcastRequested from './networkBatchBroadcastRequested';
import networkBroadcastSuccess from './networkBroadcastSuccess';
import networkEgressScheduled from './networkEgressScheduled';
import swapEgressScheduled from './swapEgressScheduled';
import swapExecuted from './swapExecuted';
import swapIngressReceived from './swapIngressReceived';
import type {
  Block,
  Item,
  SwappingEvent,
  SwappingEventItem,
} from '../processor';

export enum Swapping {
  SwapIngressReceived = 'Swapping.SwapIngressReceived',
  SwapExecuted = 'Swapping.SwapExecuted',
  SwapEgressScheduled = 'Swapping.SwapEgressScheduled',
}

export enum PolkadotIngressEgress {
  EgressScheduled = 'PolkadotIngressEgress.EgressScheduled',
  BatchBroadcastRequested = 'PolkadotIngressEgress.BatchBroadcastRequested',
}

export enum PolkadotBroadcaster {
  BroadcastSuccess = 'PolkadotBroadcaster.BroadcastSuccess',
}

export enum EthereumIngressEgress {
  EgressScheduled = 'EthereumIngressEgress.EgressScheduled',
  BatchBroadcastRequested = 'EthereumIngressEgress.BatchBroadcastRequested',
}

export enum EthereumBroadcaster {
  BroadcastSuccess = 'EthereumBroadcaster.BroadcastSuccess',
}

export type SwappingEventName =
  | EthereumBroadcaster
  | EthereumIngressEgress
  | PolkadotBroadcaster
  | PolkadotIngressEgress
  | Swapping;

export type EventHandlerArgs = {
  prisma: Prisma.TransactionClient;
  event: SwappingEvent;
  block: Block;
};

export const eventHandlers: Record<
  SwappingEventName,
  (args: EventHandlerArgs) => Promise<void>
> = {
  [Swapping.SwapIngressReceived]: swapIngressReceived,
  [Swapping.SwapExecuted]: swapExecuted,
  [Swapping.SwapEgressScheduled]: swapEgressScheduled,
  [PolkadotIngressEgress.EgressScheduled]: networkEgressScheduled,
  [PolkadotIngressEgress.BatchBroadcastRequested]:
    networkBatchBroadcastRequested,
  [PolkadotBroadcaster.BroadcastSuccess]: networkBroadcastSuccess('Polkadot'),
  [EthereumIngressEgress.EgressScheduled]: networkEgressScheduled,
  [EthereumIngressEgress.BatchBroadcastRequested]:
    networkBatchBroadcastRequested,
  [EthereumBroadcaster.BroadcastSuccess]: networkBroadcastSuccess('Ethereum'),
};

export const isSwapEvent = (item: Item): item is SwappingEventItem =>
  item.kind === 'event' && item.name in eventHandlers;
