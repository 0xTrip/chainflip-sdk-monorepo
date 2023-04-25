import { validateAddress } from '../assets';

describe(validateAddress, () => {
  it.each([
    ['DOT', '13NZffZRSQFdg5gYLJBdj5jVtkeDPqF3czLdJ9m6fyHcMjki'],
    ['ETH', '0x02679b10f7b94fc4f273569cc2e5c49eefa5c0f1'],
    ['USDC', '0x02679b10f7b94fc4f273569cc2e5c49eefa5c0f1'],
    ['FLIP', '0x02679b10f7b94fc4f273569cc2e5c49eefa5c0f1'],
  ])("doesn't throw for %s address %s", (asset, address) => {
    expect(() => validateAddress(asset, address)).not.toThrow();
  });

  it.each([
    ['DOT', '0x02679b10f7b94fc4f273569cc2e5c49eefa5c0f1'],
    ['ETH', '13NZffZRSQFdg5gYLJBdj5jVtkeDPqF3czLdJ9m6fyHcMjki'],
    ['USDC', '13NZffZRSQFdg5gYLJBdj5jVtkeDPqF3czLdJ9m6fyHcMjki'],
    ['FLIP', '13NZffZRSQFdg5gYLJBdj5jVtkeDPqF3czLdJ9m6fyHcMjki'],
  ])('throws for %s address %s', (asset, address) => {
    expect(() => validateAddress(asset, address)).toThrow();
  });
});
