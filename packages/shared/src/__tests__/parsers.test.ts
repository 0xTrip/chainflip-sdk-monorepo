import { ChainflipNetwork } from '../enums';
import { btcAddress, dotAddress, u128, unsignedInteger } from '../parsers';
import bitcoinAddresses from '../validation/__tests__/bitcoinAddresses.json' assert { type: 'json' };

describe('btc parser', () => {
  it.each([
    [Object.values(bitcoinAddresses.mainnet).flat(), 'mainnet', 'sisyphos'],
    [Object.values(bitcoinAddresses.testnet).flat(), 'sisyphos', 'mainnet'],
    [Object.values(bitcoinAddresses.testnet).flat(), 'perseverance', 'mainnet'],
    [Object.values(bitcoinAddresses.testnet).flat(), 'partnernet', 'mainnet'],
    [Object.values(bitcoinAddresses.regtest).flat(), 'sisyphos', 'mainnet'],
    [Object.values(bitcoinAddresses.regtest).flat(), 'perseverance', 'mainnet'],
    [Object.values(bitcoinAddresses.regtest).flat(), 'partnernet', 'mainnet'],
    [Object.values(bitcoinAddresses.regtest).flat(), 'backspin', 'mainnet'],
    [Object.values(bitcoinAddresses.regtest).flat(), undefined, 'mainnet'],
  ])(
    'validates btc address %s to be true for the right network',
    (address, network, wrongNetwork) => {
      address.forEach((addr) =>
        expect(
          btcAddress(network as ChainflipNetwork).safeParse(addr).success,
        ).toBeTruthy(),
      );
      address.forEach((addr) =>
        expect(
          btcAddress(wrongNetwork as ChainflipNetwork).safeParse(addr).success,
        ).toBeFalsy(),
      );
    },
  );
  const wrongAddresses = [
    'br1qxy2kgdygjrsqtzq2n0yrf249',
    '',
    '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    '5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX',
  ];
  it.each([
    [wrongAddresses, 'mainnet'],
    [wrongAddresses, 'sisyphos'],
    [wrongAddresses, 'partnernet'],
    [wrongAddresses, 'perseverance'],
  ])(`validates btc address %s to be false`, (address, network) => {
    expect(
      btcAddress(network as ChainflipNetwork).safeParse(address).success,
    ).toBeFalsy();
  });
});

describe('dotAddress', () => {
  it('validates dot address and transforms a dot address', async () => {
    expect(dotAddress.parse('0x0')).toBe('F7Hs');
    expect(
      dotAddress.parse(
        '0x9999999999999999999999999999999999999999999999999999999999999999',
      ),
    ).toBe('5FY6p4faNbTZeuEZat5QtPXhjUHvjopmqUCbQibdKpvyPbww');
  });
});

describe('u128', () => {
  it('handles numeric strings', () => {
    expect(u128.parse('123')).toBe(123n);
  });

  it('handles hex strings', () => {
    expect(u128.parse('0x123')).toBe(291n);
  });

  it('rejects invalid hex string', () => {
    expect(() => u128.parse('0x123z')).toThrow();
    expect(() => u128.parse('0x')).toThrow();
  });
});

describe('unsignedInteger', () => {
  it('handles numeric strings', () => {
    expect(unsignedInteger.parse('123')).toBe(123n);
  });

  it('handles hex strings', () => {
    expect(unsignedInteger.parse('0x123')).toBe(291n);
  });

  it('handles numbers', () => {
    expect(unsignedInteger.parse(123)).toBe(123n);
  });

  it('rejects invalid hex string', () => {
    expect(() => u128.parse('0x123z')).toThrow();
    expect(() => u128.parse('0x')).toThrow();
  });
});
