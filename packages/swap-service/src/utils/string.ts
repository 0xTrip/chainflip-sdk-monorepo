import type { SupportedAsset } from '@chainflip-io/sdk-shared/assets';
import type { RpcAsset } from './RpcClient';

export const transformAsset = (asset: SupportedAsset): RpcAsset =>
  (asset[0] + asset.slice(1).toLowerCase()) as Capitalize<
    Lowercase<SupportedAsset>
  >;
