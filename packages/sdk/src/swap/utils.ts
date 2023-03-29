export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export const unreachable = (x: never, message: string): never => {
  throw new Error(`${message}: ${x}`);
};
