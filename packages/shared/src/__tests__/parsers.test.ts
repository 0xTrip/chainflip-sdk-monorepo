import { btcString } from '../parsers';

describe('btc parser', () => {
  it.each([
    ['bc1qxy2kgdygjrsqtzq2n0yrf249', true],
    ['br1qxy2kgdygjrsqtzq2n0yrf249', false],
    ['tb1', true],
    ['bcrt112345', true],
    ['1GX28yLjVWux7ws4UQ9FB4MnLH4UKTPK2z', true],
    ['5F4M7vprNKutaneCmtuPjAc2YYS58t8kGVXC3iA2pvXdsiua', false],
    ['bcrt1pj5pjkur59zl9yg3q5d33dxvgndw6967hf5zmt2er9xec6wya754s8vjtd9', true],
    ['', false],
  ])(`validates btc address %s`, (a, expected) => {
    expect(btcString.safeParse(a).success).toBe(expected);
  });
});
