import { z } from 'zod';
import { Asset, assetChains } from '@/shared/enums';
import { chainflipChain, unsignedInteger } from '@/shared/parsers';
import { Environment, getEnvironment } from '@/shared/rpc';
import { readAssetValue } from '@/shared/rpc/utils';
import { CacheMap } from '@/swap/utils/dataStructures';
import { estimateIngressEgressFeeAssetAmount } from '@/swap/utils/fees';
import type { EventHandlerArgs } from '.';

const eventArgs = z.object({
  swapId: unsignedInteger,
  egressId: z.tuple([
    z.object({ __kind: chainflipChain }).transform(({ __kind }) => __kind),
    unsignedInteger,
  ]),
});

const environmentByBlockHashCache = new CacheMap<
  string,
  Promise<Environment | null>
>(60_000);

const methodNotFoundRegExp = /Exported method .+ is not found/;
const rpcConfig = { rpcUrl: process.env.RPC_NODE_HTTP_URL as string };

const getCachedEnvironmentAtBlock = async (
  blockHash: string,
): Promise<Environment | null> => {
  const cached = environmentByBlockHashCache.get(blockHash);
  if (cached) return cached;

  const env = getEnvironment(rpcConfig, blockHash).catch((e: Error) => {
    const cause = e.cause as { message: string } | undefined;

    if (methodNotFoundRegExp.test(cause?.message ?? '')) return null;

    environmentByBlockHashCache.delete(blockHash);
    throw e;
  });

  environmentByBlockHashCache.set(blockHash, env);

  return env;
};

const assetAmountByNativeAmountAndBlockHashCache = new CacheMap<
  string,
  Promise<bigint>
>(60_000);

const getCachedAssetAmountAtBlock = async (
  asset: Asset,
  nativeAmount: bigint,
  blockHash: string,
): Promise<bigint> => {
  const cacheKey = `${asset}-${nativeAmount.toString()}-${blockHash}`;
  const cached = assetAmountByNativeAmountAndBlockHashCache.get(cacheKey);
  if (cached) return cached;

  const rate = estimateIngressEgressFeeAssetAmount(
    nativeAmount,
    asset,
    blockHash,
  ).catch((e: Error) => {
    assetAmountByNativeAmountAndBlockHashCache.delete(blockHash);
    throw e;
  });

  assetAmountByNativeAmountAndBlockHashCache.set(cacheKey, rate);

  return rate;
};

const getEgressFeeAtBlock = async (
  blockHash: string,
  asset: Asset,
): Promise<bigint> => {
  const env = await getCachedEnvironmentAtBlock(blockHash);
  if (!env) return 0n;

  const nativeFee = readAssetValue(env.ingressEgress.egressFees, {
    asset,
    chain: assetChains[asset],
  });

  return getCachedAssetAmountAtBlock(asset, nativeFee, blockHash);
};

/**
 * this event is emitted in order to correlate the egress id from a network
 * deposit/egress pallet to a swap id
 */
export default async function swapEgressScheduled({
  prisma,
  event,
  block,
}: EventHandlerArgs): Promise<void> {
  const {
    swapId,
    egressId: [chain, nativeId],
  } = eventArgs.parse(event.args);

  const swap = await prisma.swap.findUniqueOrThrow({
    where: { nativeId: swapId },
  });

  // TODO: use an accurate source for determining the egress fee once the protocol provides one
  const egressFee = await getEgressFeeAtBlock(block.hash, swap.destAsset);

  await Promise.all([
    prisma.egress.update({
      where: { nativeId_chain: { chain, nativeId } },
      data: {
        amount: swap.destAmount?.sub(egressFee.toString()),
      },
    }),
    prisma.swap.update({
      where: { nativeId: swapId },
      data: {
        egress: { connect: { nativeId_chain: { chain, nativeId } } },
        fees: {
          create: {
            type: 'EGRESS',
            asset: swap.destAsset,
            amount: egressFee.toString(),
          },
        },
      },
    }),
  ]);
}
