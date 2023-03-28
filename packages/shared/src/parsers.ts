import { z, ZodErrorMap } from 'zod';

const errorMap: ZodErrorMap = (issue, context) => ({
  message: `received: ${JSON.stringify(context.data)}`,
});

export const string = z.string({ errorMap });
export const number = z.number({ errorMap });
export const numericString = string.regex(/^[0-9]+$/);
export const hexString = string.regex(/^0x[0-9a-f]+$/i);
export const bareHexString = string.regex(/^[0-9a-f]+$/);

export const u128 = z
  .union([numericString, hexString])
  .transform((arg) => BigInt(arg));

export const unsignedInteger = z.union([
  u128,
  z.number().transform((n) => BigInt(n)),
]);
