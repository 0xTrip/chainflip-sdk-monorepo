/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable max-classes-per-file */
import { VoidSigner } from 'ethers';
import { ERC20 } from '../../abis';
import { checkAllowance } from '../../contracts';
import {
  executeRedemption,
  fundStateChainAccount,
  getMinimumFunding,
  getRedemptionDelay,
} from '../index';

class MockGateway {
  constructor(readonly address: string) {}
  async getAddress(): Promise<any> {
    return this.address;
  }
  async fundStateChainAccount(): Promise<any> {}
  async executeRedemption(): Promise<any> {}
  async getMinimumFunding(): Promise<any> {}
  async REDEMPTION_DELAY(): Promise<any> {}
}

jest.mock('../../abis/factories/StateChainGateway__factory', () => ({
  StateChainGateway__factory: class {
    static connect: (address: string) => MockGateway = jest.fn(
      (address: string) => new MockGateway(address),
    );
  },
}));

jest.mock('../../contracts', () => ({
  ...jest.requireActual('../../contracts'),
  checkAllowance: jest.fn(),
}));

const signerOptions = {
  network: 'sisyphos',
  signer: new VoidSigner('0x0'),
} as const;

describe(fundStateChainAccount, () => {
  it('approves the gateway and funds the account', async () => {
    const checkSpy = jest.mocked(checkAllowance).mockResolvedValue({
      allowance: 100000n,
      isAllowable: true,
      erc20: {} as unknown as ERC20,
    });
    const waitMock = jest.fn().mockResolvedValue({ status: 1 });
    const fundSpy = jest
      .spyOn(MockGateway.prototype, 'fundStateChainAccount')
      .mockResolvedValue({ wait: waitMock });

    await fundStateChainAccount('0x1234', 1000n, signerOptions, {});

    expect(checkSpy).toHaveBeenCalled();
    expect(waitMock).toHaveBeenCalledWith(undefined);
    expect(fundSpy).toHaveBeenCalledWith('0x1234', 1000n, {
      nonce: undefined,
    });
  });
});

describe(executeRedemption, () => {
  it('executes the redemption', async () => {
    const waitMock = jest.fn().mockResolvedValue({ status: 1 });
    const executeSpy = jest
      .spyOn(MockGateway.prototype, 'executeRedemption')
      .mockResolvedValue({ wait: waitMock });
    await executeRedemption('0x1234', signerOptions, { nonce: 1 });
    expect(executeSpy.mock.lastCall).toMatchSnapshot();
  });
});

describe(getMinimumFunding, () => {
  it('retrieves minimum funding amount', async () => {
    jest
      .spyOn(MockGateway.prototype, 'getMinimumFunding')
      .mockResolvedValue(1234n);
    expect(await getMinimumFunding(signerOptions)).toEqual(1234n);
  });
});

describe(getRedemptionDelay, () => {
  it('retrieves the redemption delay', async () => {
    jest
      .spyOn(MockGateway.prototype, 'REDEMPTION_DELAY')
      .mockResolvedValue(1234);
    expect(await getRedemptionDelay(signerOptions)).toEqual(1234);
  });
});
