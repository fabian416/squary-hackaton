
import { zksyncSepoliaTestnet } from 'wagmi/chains';
import { http } from 'viem';

import { createConfig } from "@wagmi/core";

export const wagmiConfig = createConfig({
  chains: [zksyncSepoliaTestnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [zksyncSepoliaTestnet.id]: http()
  },
});