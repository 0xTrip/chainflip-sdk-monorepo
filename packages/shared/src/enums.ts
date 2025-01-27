type ArrayToMap<T extends readonly string[]> = {
  [K in T[number]]: K;
};

const arrayToMap = <const T extends readonly string[]>(
  array: T,
): ArrayToMap<T> =>
  Object.fromEntries(array.map((key) => [key, key])) as ArrayToMap<T>;

export const Chains = arrayToMap(['Bitcoin', 'Ethereum', 'Polkadot']);
export type Chain = (typeof Chains)[keyof typeof Chains];

export const Assets = arrayToMap(['FLIP', 'USDC', 'DOT', 'ETH', 'BTC']);
export type Asset = (typeof Assets)[keyof typeof Assets];

export const ChainflipNetworks = arrayToMap([
  'backspin',
  'sisyphos',
  'perseverance',
  'mainnet',
]);

export type ChainflipNetwork =
  (typeof ChainflipNetworks)[keyof typeof ChainflipNetworks];

export const isTestnet = (network: ChainflipNetwork): boolean =>
  network !== ChainflipNetworks.mainnet;

export const assetChains = {
  [Assets.ETH]: Chains.Ethereum,
  [Assets.FLIP]: Chains.Ethereum,
  [Assets.USDC]: Chains.Ethereum,
  [Assets.BTC]: Chains.Bitcoin,
  [Assets.DOT]: Chains.Polkadot,
} satisfies Record<Asset, Chain>;

export const assetDecimals = {
  [Assets.DOT]: 10,
  [Assets.ETH]: 18,
  [Assets.FLIP]: 18,
  [Assets.USDC]: 6,
  [Assets.BTC]: 8,
} satisfies Record<Asset, number>;

// https://github.com/chainflip-io/chainflip-backend/blob/a2a3c2e447e7b629c4b96797d9eed22eb5b87a0b/state-chain/primitives/src/chains/assets.rs#L51-L59
export const assetContractIds: Record<Asset, number> = {
  // 0 is reservered for particular cross chain messaging scenarios where we want to pass
  // through a message without making a swap.
  [Assets.ETH]: 1,
  [Assets.FLIP]: 2,
  [Assets.USDC]: 3,
  [Assets.DOT]: 4,
  [Assets.BTC]: 5,
};

export const chainAssets = {
  [Chains.Ethereum]: [Assets.ETH, Assets.USDC, Assets.FLIP],
  [Chains.Bitcoin]: [Assets.BTC],
  [Chains.Polkadot]: [Assets.DOT],
} satisfies Record<Chain, Asset[]>;

export const chainNativeAssets = {
  [Chains.Ethereum]: Assets.ETH,
  [Chains.Bitcoin]: Assets.BTC,
  [Chains.Polkadot]: Assets.DOT,
} satisfies Record<Chain, Asset>;

// https://github.com/chainflip-io/chainflip-backend/blob/a2a3c2e447e7b629c4b96797d9eed22eb5b87a0b/state-chain/primitives/src/chains.rs#L52-L56
export const chainContractIds: Record<Chain, number> = {
  [Chains.Ethereum]: 1,
  [Chains.Polkadot]: 2,
  [Chains.Bitcoin]: 3,
};

export type AssetAndChain = {
  [A in Asset]: { asset: A; chain: (typeof assetChains)[A] };
}[Asset];

export type UncheckedAssetAndChain = {
  asset: Asset;
  chain: Chain;
};

function assertAsset(asset: string): asserts asset is Asset {
  if (!(asset in Assets)) throw new Error('invalid asset');
}

export function assertIsValidAssetAndChain(
  assetAndChain: UncheckedAssetAndChain,
): asserts assetAndChain is AssetAndChain {
  const { asset, chain } = assetAndChain;
  assertAsset(asset);
  if (chain !== assetChains[asset]) {
    throw new Error('invalid asset and chain combination');
  }
}
