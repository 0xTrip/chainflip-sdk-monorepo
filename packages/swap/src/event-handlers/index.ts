import type { Prisma } from '.prisma/client';
import networkBatchBroadcastRequested from './networkBatchBroadcastRequested';
import networkBroadcastSuccess from './networkBroadcastSuccess';
import networkEgressScheduled from './networkEgressScheduled';
import newSwapIntent from './newSwapIntent';
import swapEgressScheduled from './swapEgressScheduled';
import swapExecuted from './swapExecuted';
import swapIngressReceived from './swapIngressReceived';
import swapIntentExpired from './swapIntentExpired';
import type { Block, Event } from '../gql/generated/graphql';

export enum Swapping {
  NewSwapIntent = 'Swapping.NewSwapIntent',
  SwapIngressReceived = 'Swapping.SwapIngressReceived',
  SwapExecuted = 'Swapping.SwapExecuted',
  SwapEgressScheduled = 'Swapping.SwapEgressScheduled',
  SwapIntentExpired = 'Swapping.SwapIntentExpired',
}

export enum BitcoinIngressEgress {
  EgressScheduled = 'BitcoinIngressEgress.EgressScheduled',
  BatchBroadcastRequested = 'BitcoinIngressEgress.BatchBroadcastRequested',
}

export enum BitcoinBroadcaster {
  BroadcastSuccess = 'BitcoinBroadcaster.BroadcastSuccess',
}

export enum EthereumIngressEgress {
  EgressScheduled = 'EthereumIngressEgress.EgressScheduled',
  BatchBroadcastRequested = 'EthereumIngressEgress.BatchBroadcastRequested',
}

export enum EthereumBroadcaster {
  BroadcastSuccess = 'EthereumBroadcaster.BroadcastSuccess',
}

export enum PolkadotIngressEgress {
  EgressScheduled = 'PolkadotIngressEgress.EgressScheduled',
  BatchBroadcastRequested = 'PolkadotIngressEgress.BatchBroadcastRequested',
}

export enum PolkadotBroadcaster {
  BroadcastSuccess = 'PolkadotBroadcaster.BroadcastSuccess',
}

export type SwappingEventName =
  | BitcoinIngressEgress
  | BitcoinBroadcaster
  | EthereumBroadcaster
  | EthereumIngressEgress
  | PolkadotBroadcaster
  | PolkadotIngressEgress
  | Swapping;

export type EventHandlerArgs = {
  prisma: Prisma.TransactionClient;
  event: Pick<Event, 'args' | 'name'>;
  block: Pick<Block, 'height' | 'timestamp'>;
};

export const eventHandlers: Record<
  SwappingEventName,
  (args: EventHandlerArgs) => Promise<void>
> = {
  [Swapping.NewSwapIntent]: newSwapIntent,
  [Swapping.SwapIngressReceived]: swapIngressReceived,
  [Swapping.SwapExecuted]: swapExecuted,
  [Swapping.SwapEgressScheduled]: swapEgressScheduled,
  [BitcoinIngressEgress.EgressScheduled]: networkEgressScheduled,
  [BitcoinIngressEgress.BatchBroadcastRequested]:
    networkBatchBroadcastRequested,
  [BitcoinBroadcaster.BroadcastSuccess]: networkBroadcastSuccess('Bitcoin'),
  [EthereumIngressEgress.EgressScheduled]: networkEgressScheduled,
  [EthereumIngressEgress.BatchBroadcastRequested]:
    networkBatchBroadcastRequested,
  [EthereumBroadcaster.BroadcastSuccess]: networkBroadcastSuccess('Ethereum'),
  [PolkadotIngressEgress.EgressScheduled]: networkEgressScheduled,
  [PolkadotIngressEgress.BatchBroadcastRequested]:
    networkBatchBroadcastRequested,
  [PolkadotBroadcaster.BroadcastSuccess]: networkBroadcastSuccess('Polkadot'),
  [Swapping.SwapIntentExpired]: swapIntentExpired,
};
