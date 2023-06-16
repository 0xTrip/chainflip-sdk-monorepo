import type { BigNumber, ContractReceipt, Signer } from 'ethers';
import { StateChainGateway__factory } from '../abis';
import {
  getStateChainGatewayContractAddress,
  getTokenContractAddress,
  requestApproval,
} from '../contracts';
import { ChainflipNetwork } from '../enums';

type SignerOptions =
  | { cfNetwork: ChainflipNetwork; signer: Signer }
  | {
      cfNetwork: 'localnet';
      signer: Signer;
      stateChainGatewayContractAddress: string;
    };

type ExtendLocalnetOptions<T, U> = T extends { cfNetwork: 'localnet' }
  ? T & U
  : T;

export type FundStateChainAccountOptions = ExtendLocalnetOptions<
  SignerOptions,
  { flipContractAddress: string }
>;

export const getStateChainGateway = (options: SignerOptions) => {
  const stateChainGatewayContractAddress =
    options.cfNetwork === 'localnet'
      ? options.stateChainGatewayContractAddress
      : getStateChainGatewayContractAddress(options.cfNetwork);

  return StateChainGateway__factory.connect(
    stateChainGatewayContractAddress,
    options.signer,
  );
};

export const fundStateChainAccount = async (
  accountId: `0x${string}`,
  amount: string,
  options: FundStateChainAccountOptions,
): Promise<ContractReceipt> => {
  const flipContractAddress =
    options.cfNetwork === 'localnet'
      ? options.flipContractAddress
      : getTokenContractAddress('FLIP', options.cfNetwork);

  const stateChainGateway = getStateChainGateway(options);

  await requestApproval(
    flipContractAddress,
    stateChainGateway.address,
    amount,
    options.signer,
  );

  const transaction = await stateChainGateway.fundStateChainAccount(
    accountId,
    amount,
  );

  return transaction.wait(1);
};

export const executeRedemption = async (
  accountId: `0x${string}`,
  options: SignerOptions,
): Promise<ContractReceipt> => {
  const stateChainGateway = getStateChainGateway(options);

  const transaction = await stateChainGateway.executeRedemption(accountId);

  return transaction.wait(1);
};

export const getMinimumFunding = (
  options: SignerOptions,
): Promise<BigNumber> => {
  const stateChainGateway = getStateChainGateway(options);

  return stateChainGateway.getMinimumFunding();
};

export const getRedemptionDelay = (options: SignerOptions): Promise<number> => {
  const stateChainGateway = getStateChainGateway(options);

  return stateChainGateway.REDEMPTION_DELAY();
};
