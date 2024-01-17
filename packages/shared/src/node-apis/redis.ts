import { decodeAddress } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';
import Redis from 'ioredis';
import { z } from 'zod';
import { sorter } from '../arrays';
import { assetDecimals, type Asset, type Chain } from '../enums';
import { number, u128, string } from '../parsers';

const ss58ToHex = (address: string) =>
  `0x${Buffer.from(decodeAddress(address)).toString('hex')}`;

const assetSchema = z.object({
  asset: string,
  chain: string,
});

const depositSchema = z.object({
  amount: u128,
  asset: assetSchema,
  deposit_chain_block_height: number,
});

type Deposit = z.infer<typeof depositSchema>;

const sortDepositAscending = sorter<Deposit>('deposit_chain_block_height');

const deposits = z.array(depositSchema);

const broadcastParsers = {
  Ethereum: z.object({
    tx_out_id: z.object({
      signature: z.object({
        k_times_g_address: z.array(number),
        s: z.array(number),
      }),
    }),
  }),
  Polkadot: z.object({ tx_out_id: z.object({ signature: string }) }),
  Bitcoin: z.object({ tx_out_id: z.object({ hash: string }) }),
};

type ChainBroadcast<C extends Chain> = z.infer<(typeof broadcastParsers)[C]>;

type EthereumBroadcast = ChainBroadcast<'Ethereum'>;
type PolkadotBroadcast = ChainBroadcast<'Polkadot'>;
type BitcoinBroadcast = ChainBroadcast<'Bitcoin'>;
type Broadcast = ChainBroadcast<Chain>;

const mempoolTransaction = z.object({
  confirmations: number,
  value: number.transform((value) =>
    new BigNumber(value).shiftedBy(assetDecimals.BTC).toString(),
  ),
  tx_hash: string.transform((value) => `0x${value}` as const),
});

export default class RedisClient {
  private client;

  constructor(url: `redis://${string}` | `rediss://${string}`) {
    this.client = new Redis(url);
  }

  async getBroadcast(
    chain: 'Ethereum',
    broadcastId: number | bigint,
  ): Promise<EthereumBroadcast | null>;
  async getBroadcast(
    chain: 'Polkadot',
    broadcastId: number | bigint,
  ): Promise<PolkadotBroadcast | null>;
  async getBroadcast(
    chain: 'Bitcoin',
    broadcastId: number | bigint,
  ): Promise<BitcoinBroadcast | null>;
  async getBroadcast(
    chain: Chain,
    broadcastId: number | bigint,
  ): Promise<Broadcast | null>;
  async getBroadcast(
    chain: Chain,
    broadcastId: number | bigint,
  ): Promise<Broadcast | null> {
    const key = `broadcast:${chain}:${broadcastId}`;
    const value = await this.client.get(key);
    return value ? broadcastParsers[chain].parse(JSON.parse(value)) : null;
  }

  async getDeposits(chain: Chain, asset: Asset, address: string) {
    const parsedAddress = chain === 'Polkadot' ? ss58ToHex(address) : address;
    const key = `deposit:${chain}:${parsedAddress}`;
    const value = await this.client.get(key);
    return value
      ? deposits
          .parse(JSON.parse(value))
          .filter((deposit) => deposit.asset.asset === asset)
          .sort(sortDepositAscending)
      : [];
  }

  async getMempoolTransaction(chain: 'Bitcoin', address: string) {
    const key = `confirmations:${chain}:${address}`;
    const value = await this.client.get(key);
    return value ? mempoolTransaction.parse(JSON.parse(value)) : null;
  }

  quit() {
    return this.client.quit();
  }
}