import { createConfig } from 'wagmi';
import { zksync, zksyncSepoliaTestnet } from 'wagmi/chains';
import { http } from 'viem';

export const wagmiConfig = createConfig({
  chains: [zksyncSepoliaTestnet, zksync],
  multiInjectedProviderDiscovery: false,
  transports: {
    [zksyncSepoliaTestnet.id]: http(),
    [zksync.id]: http(),
  },
});