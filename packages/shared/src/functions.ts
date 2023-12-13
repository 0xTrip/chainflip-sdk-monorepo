import EventEmitter, { once } from 'events';

export const onceWithTimeout = async (
  eventEmitter: EventEmitter,
  event: string | symbol,
  timeout: number,
): Promise<void> => {
  await once(eventEmitter, event, { signal: AbortSignal.timeout(timeout) });
};

export const bigintMax = (...args: bigint[]): bigint =>
  args.reduce((max, current) => (current > max ? current : max));
