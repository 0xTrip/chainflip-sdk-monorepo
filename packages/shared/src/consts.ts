import { Asset, Assets, ChainflipNetwork, ChainflipNetworks } from './enums';

// TODO: fetch minimum deposit amounts via rpc from the state chain
const MINIMUM_DEPOSIT_AMOUNTS: Partial<
  Record<ChainflipNetwork, Record<Asset, string>>
> = {
  [ChainflipNetworks.partnernet]: {
    [Assets.ETH]: '0',
    [Assets.FLIP]: '0',
    [Assets.USDC]: '0',
    [Assets.BTC]: '0',
    [Assets.DOT]: '0',
  },
};
export const getMinimumDepositAmount = (
  network: ChainflipNetwork,
  asset: Asset,
) => MINIMUM_DEPOSIT_AMOUNTS[network]?.[asset] ?? '0';

// TODO: fetch minimum swap amounts via rpc from the state chain
const MINIMUM_SWAP_AMOUNTS: Partial<
  Record<ChainflipNetwork, Record<Asset, string>>
> = {
  [ChainflipNetworks.partnernet]: {
    [Assets.ETH]: '580000000000000',
    [Assets.FLIP]: '1000000000000000000',
    [Assets.USDC]: '1000000',
    [Assets.BTC]: '390000',
    [Assets.DOT]: '2000000000',
  },
};
export const getMinimumSwapAmount = (network: ChainflipNetwork, asset: Asset) =>
  MINIMUM_SWAP_AMOUNTS[network]?.[asset] ?? '0';

export const ADDRESSES = {
  [ChainflipNetworks.sisyphos]: {
    FLIP_CONTRACT_ADDRESS: '0x2FD78122663A07672e9ac63486573A99EB00125d',
    VAULT_CONTRACT_ADDRESS: '0xd498606dcb9F440CD9F06B397C40fd3327FC2550',
    STATE_CHAIN_MANAGER_CONTRACT_ADDRESS:
      '0xCCF267Bc5B709F1A1738122f3b76Cd01F0d9f947',
  },
  [ChainflipNetworks.partnernet]: {
    FLIP_CONTRACT_ADDRESS: '0x1Ea4F05a319A8f779F05E153974605756bB13D4F',
    VAULT_CONTRACT_ADDRESS: '0xAfD0C34E6d25F707d931F8b7EE9cf0Ff52160A46',
    STATE_CHAIN_MANAGER_CONTRACT_ADDRESS:
      '0x07B3Bef16c640B072085BF83C24b6C43000aE056',
  },
  [ChainflipNetworks.perseverance]: {
    FLIP_CONTRACT_ADDRESS: '0x1194C91d47Fc1b65bE18db38380B5344682b67db',
    VAULT_CONTRACT_ADDRESS: '0xF1B061aCCDAa4B7c029128b49aBc047F89D5CB8d',
    STATE_CHAIN_MANAGER_CONTRACT_ADDRESS:
      '0xC960C4eEe4ADf40d24374D85094f3219cf2DD8EB',
  },
} as const;

// https://developers.circle.com/developer/docs/usdc-on-testnet#usdc-on-ethereum-goerli
export const GOERLI_USDC_CONTRACT_ADDRESS =
  '0x07865c6E87B9F70255377e024ace6630C1Eaa37F';
