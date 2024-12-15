import { createConfig } from 'wagmi';
import { zksyncSepoliaTestnet } from 'wagmi/chains';
import { http } from 'viem';

export const wagmiConfig = createConfig({
  chains: [zksyncSepoliaTestnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [zksyncSepoliaTestnet.id]: http()
  },
});