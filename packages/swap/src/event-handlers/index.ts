import type { Prisma } from '.prisma/client';
import { Chains } from '@/shared/enums';
import ccmDepositReceived from './ccmDepositReceived';
import depositIgnored from './depositIgnored';
import depositIgnoredV120 from './depositIgnoredV120';
import liquidityDepositAddressReady from './liquidityDepositChannelReady';
import networkBatchBroadcastRequested from './networkBatchBroadcastRequested';
import networkBroadcastAborted from './networkBroadcastAborted';
import networkBroadcastSuccess from './networkBroadcastSuccess';
import networkCcmBroadcastRequested from './networkCcmBroadcastRequested';
import chainStateUpdated from './networkChainStateUpdated';
import { networkDepositReceived } from './networkDepositReceived';
import networkEgressScheduled from './networkEgressScheduled';
import newPoolCreated from './newPoolCreated';
import poolFeeSet from './poolFeeSet';
import swapAmountTooLow from './swapAmountTooLow';
import swapDepositAddressReady from './swapDepositAddressReady';
import swapEgressIgnored from './swapEgressIgnored';
import swapEgressScheduled from './swapEgressScheduled';
import swapExecuted from './swapExecuted';
import swapScheduled from './swapScheduled';
import { networkDepositReceived as networkDepositReceivedV120 } from './v120/networkDepositReceived';
import type { Block, Event } from '../gql/generated/graphql';
import { buildHandlerMap, getDispatcher } from '../utils/handlers';

export const events = {
  LiquidityPools: {
    NewPoolCreated: 'LiquidityPools.NewPoolCreated',
    PoolFeeSet: 'LiquidityPools.PoolFeeSet',
  },
  LiquidityProvider: {
    LiquidityDepositAddressReady:
      'LiquidityProvider.LiquidityDepositAddressReady',
  },
  Swapping: {
    SwapScheduled: 'Swapping.SwapScheduled',
    SwapExecuted: 'Swapping.SwapExecuted',
    SwapEgressIgnored: 'Swapping.SwapEgressIgnored',
    SwapEgressScheduled: 'Swapping.SwapEgressScheduled',
    SwapAmountTooLow: 'Swapping.SwapAmountTooLow',
    SwapDepositAddressReady: 'Swapping.SwapDepositAddressReady',
    CcmDepositReceived: 'Swapping.CcmDepositReceived',
  },
  BitcoinIngressEgress: {
    EgressScheduled: 'BitcoinIngressEgress.EgressScheduled',
    BatchBroadcastRequested: 'BitcoinIngressEgress.BatchBroadcastRequested',
    CcmBroadcastRequested: 'BitcoinIngressEgress.CcmBroadcastRequested',
    DepositReceived: 'BitcoinIngressEgress.DepositReceived',
    DepositIgnored: 'BitcoinIngressEgress.DepositIgnored',
  },
  BitcoinBroadcaster: {
    BroadcastSuccess: 'BitcoinBroadcaster.BroadcastSuccess',
    BroadcastAborted: 'BitcoinBroadcaster.BroadcastAborted',
  },
  EthereumIngressEgress: {
    EgressScheduled: 'EthereumIngressEgress.EgressScheduled',
    BatchBroadcastRequested: 'EthereumIngressEgress.BatchBroadcastRequested',
    CcmBroadcastRequested: 'EthereumIngressEgress.CcmBroadcastRequested',
    DepositReceived: 'EthereumIngressEgress.DepositReceived',
    DepositIgnored: 'EthereumIngressEgress.DepositIgnored',
  },
  EthereumBroadcaster: {
    BroadcastSuccess: 'EthereumBroadcaster.BroadcastSuccess',
    BroadcastAborted: 'EthereumBroadcaster.BroadcastAborted',
  },
  PolkadotIngressEgress: {
    EgressScheduled: 'PolkadotIngressEgress.EgressScheduled',
    BatchBroadcastRequested: 'PolkadotIngressEgress.BatchBroadcastRequested',
    CcmBroadcastRequested: 'PolkadotIngressEgress.CcmBroadcastRequested',
    DepositReceived: 'PolkadotIngressEgress.DepositReceived',
    DepositIgnored: 'PolkadotIngressEgress.DepositIgnored',
  },
  PolkadotBroadcaster: {
    BroadcastSuccess: 'PolkadotBroadcaster.BroadcastSuccess',
    BroadcastAborted: 'PolkadotBroadcaster.BroadcastAborted',
  },
  BitcoinChainTracking: {
    ChainStateUpdated: 'BitcoinChainTracking.ChainStateUpdated',
  },
  EthereumChainTracking: {
    ChainStateUpdated: 'EthereumChainTracking.ChainStateUpdated',
  },
  PolkadotChainTracking: {
    ChainStateUpdated: 'PolkadotChainTracking.ChainStateUpdated',
  },
} as const;

export const swapEventNames = Object.values(events).flatMap((pallets) =>
  Object.values(pallets),
);

export type EventHandlerArgs = {
  prisma: Prisma.TransactionClient;
  event: Pick<Event, 'args' | 'name' | 'indexInBlock'>;
  block: Pick<Block, 'height' | 'hash' | 'timestamp' | 'specId'>;
};

const handlers = [
  {
    spec: 0,
    handlers: [
      { name: events.LiquidityPools.NewPoolCreated, handler: newPoolCreated },
      { name: events.LiquidityPools.PoolFeeSet, handler: poolFeeSet },
      { name: events.Swapping.SwapScheduled, handler: swapScheduled },
      { name: events.Swapping.SwapExecuted, handler: swapExecuted },
      { name: events.Swapping.SwapAmountTooLow, handler: swapAmountTooLow },
      {
        name: events.Swapping.CcmDepositReceived,
        handler: ccmDepositReceived,
      },
      {
        name: events.Swapping.SwapDepositAddressReady,
        handler: swapDepositAddressReady,
      },
      {
        name: events.Swapping.SwapEgressScheduled,
        handler: swapEgressScheduled,
      },
      {
        name: events.LiquidityProvider.LiquidityDepositAddressReady,
        handler: liquidityDepositAddressReady,
      },
      ...Object.values(Chains).flatMap((chain) => [
        {
          name: events[`${chain}IngressEgress`].EgressScheduled,
          handler: networkEgressScheduled,
        },
        {
          name: events[`${chain}IngressEgress`].BatchBroadcastRequested,
          handler: networkBatchBroadcastRequested,
        },
        {
          name: events[`${chain}IngressEgress`].CcmBroadcastRequested,
          handler: networkCcmBroadcastRequested,
        },
        {
          name: events[`${chain}IngressEgress`].DepositReceived,
          handler: networkDepositReceived(chain),
        },
        {
          name: events[`${chain}Broadcaster`].BroadcastSuccess,
          handler: networkBroadcastSuccess(chain),
        },
        {
          name: events[`${chain}Broadcaster`].BroadcastAborted,
          handler: networkBroadcastAborted(chain),
        },
        {
          name: events[`${chain}ChainTracking`].ChainStateUpdated,
          handler: chainStateUpdated(chain),
        },
      ]),
    ],
  },
  {
    spec: 114,
    handlers: [
      ...Object.values(Chains).flatMap((chain) => [
        {
          name: events[`${chain}IngressEgress`].DepositIgnored,
          handler: depositIgnored(chain),
        },
      ]),
    ],
  },
  {
    spec: 120,
    handlers: [
      {
        name: events.Swapping.SwapEgressIgnored,
        handler: swapEgressIgnored,
      },
      ...Object.values(Chains).flatMap((chain) => [
        {
          name: events[`${chain}IngressEgress`].DepositIgnored,
          handler: depositIgnoredV120(chain),
        },
        {
          name: events[`${chain}IngressEgress`].DepositReceived,
          handler: networkDepositReceivedV120,
        },
      ]),
    ],
  },
];

const eventHandlerMap = buildHandlerMap(handlers);

export const getEventHandler = getDispatcher(eventHandlerMap);
