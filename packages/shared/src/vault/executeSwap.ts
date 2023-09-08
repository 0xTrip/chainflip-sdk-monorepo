import { ContractReceipt } from 'ethers';
import {
  type ExecuteSwapParams,
  executeSwapParamsSchema,
  type NativeSwapParams,
  type TokenSwapParams,
  NativeCallParams,
  TokenCallParams,
} from './schemas';
import { Vault__factory } from '../abis';
import {
  checkAllowance,
  extractOverrides,
  getTokenContractAddress,
  getVaultManagerContractAddress,
  TransactionOptions,
} from '../contracts';
import { assetContractIds, chainContractIds } from '../enums';
import { assert, isTokenCall, isTokenSwap } from '../guards';
import { SwapNetworkOptions } from './index';

const swapNative = async (
  { destChain, destAsset, destAddress, amount }: NativeSwapParams,
  networkOpts: SwapNetworkOptions,
  txOpts: TransactionOptions,
): Promise<ContractReceipt> => {
  const vaultContractAddress =
    networkOpts.network === 'localnet'
      ? networkOpts.vaultContractAddress
      : getVaultManagerContractAddress(networkOpts.network);

  const vault = Vault__factory.connect(
    vaultContractAddress,
    networkOpts.signer,
  );

  const transaction = await vault.xSwapNative(
    chainContractIds[destChain],
    destAddress,
    assetContractIds[destAsset],
    [],
    { value: amount, ...extractOverrides(txOpts) },
  );

  return transaction.wait(txOpts.wait);
};

const swapToken = async (
  params: TokenSwapParams,
  networkOpts: SwapNetworkOptions,
  txOpts: TransactionOptions,
): Promise<ContractReceipt> => {
  const vaultContractAddress =
    networkOpts.network === 'localnet'
      ? networkOpts.vaultContractAddress
      : getVaultManagerContractAddress(networkOpts.network);

  const erc20Address =
    networkOpts.network === 'localnet'
      ? networkOpts.srcTokenContractAddress
      : getTokenContractAddress(params.srcAsset, networkOpts.network);

  assert(erc20Address !== undefined, 'Missing ERC20 contract address');

  const { isAllowable } = await checkAllowance(
    params.amount,
    vaultContractAddress,
    erc20Address,
    networkOpts.signer,
  );
  assert(isAllowable, 'Swap amount exceeds allowance');

  const vault = Vault__factory.connect(
    vaultContractAddress,
    networkOpts.signer,
  );

  const transaction = await vault.xSwapToken(
    chainContractIds[params.destChain],
    params.destAddress,
    assetContractIds[params.destAsset],
    erc20Address,
    params.amount,
    [],
    extractOverrides(txOpts),
  );

  return transaction.wait(txOpts.wait);
};

const callNative = async (
  params: NativeCallParams,
  networkOpts: SwapNetworkOptions,
  txOpts: TransactionOptions,
): Promise<ContractReceipt> => {
  const vaultContractAddress =
    networkOpts.network === 'localnet'
      ? networkOpts.vaultContractAddress
      : getVaultManagerContractAddress(networkOpts.network);

  const vault = Vault__factory.connect(
    vaultContractAddress,
    networkOpts.signer,
  );

  const transaction = await vault.xCallNative(
    chainContractIds[params.destChain],
    params.destAddress,
    assetContractIds[params.destAsset],
    params.ccmMetadata.message,
    params.ccmMetadata.gasBudget,
    [],
    { value: params.amount, ...extractOverrides(txOpts) },
  );

  return transaction.wait(txOpts.wait);
};

const callToken = async (
  params: TokenCallParams,
  networkOpts: SwapNetworkOptions,
  txOpts: TransactionOptions,
): Promise<ContractReceipt> => {
  const vaultContractAddress =
    networkOpts.network === 'localnet'
      ? networkOpts.vaultContractAddress
      : getVaultManagerContractAddress(networkOpts.network);

  const erc20Address =
    networkOpts.network === 'localnet'
      ? networkOpts.srcTokenContractAddress
      : getTokenContractAddress(params.srcAsset, networkOpts.network);

  assert(erc20Address !== undefined, 'Missing ERC20 contract address');

  const { isAllowable } = await checkAllowance(
    params.amount,
    vaultContractAddress,
    erc20Address,
    networkOpts.signer,
  );
  assert(isAllowable, 'Swap amount exceeds allowance');

  const vault = Vault__factory.connect(
    vaultContractAddress,
    networkOpts.signer,
  );

  const transaction = await vault.xCallToken(
    chainContractIds[params.destChain],
    params.destAddress,
    assetContractIds[params.destAsset],
    params.ccmMetadata.message,
    params.ccmMetadata.gasBudget,
    erc20Address,
    params.amount,
    [],
    extractOverrides(txOpts),
  );

  return transaction.wait(txOpts.wait);
};

const executeSwap = async (
  params: ExecuteSwapParams,
  networkOpts: SwapNetworkOptions,
  txOpts: TransactionOptions,
): Promise<ContractReceipt> => {
  const parsedParams = executeSwapParamsSchema.parse(params);

  if ('ccmMetadata' in parsedParams) {
    return isTokenCall(parsedParams)
      ? callToken(parsedParams, networkOpts, txOpts)
      : callNative(parsedParams, networkOpts, txOpts);
  }

  return isTokenSwap(parsedParams)
    ? swapToken(parsedParams, networkOpts, txOpts)
    : swapNative(parsedParams, networkOpts, txOpts);
};

export default executeSwap;
