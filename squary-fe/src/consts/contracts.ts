import DEV_SQUARY_ABI from "../../src/abi/dev/SQUARY.json"
import DEV_ERC20_ABI from "../../src/abi/dev/ERC20.json"

const DEVELOPMENT_CONFIGURATION = {
    contracts: {
      300: {
        SQUARY_CONTRACT: {
          address: "0xc9963B02bF18678D5a76910F9BF8B32d50C55EE1", // zk sync sepolia test Address
          abi: DEV_SQUARY_ABI
        },
        USDT_CONTRACT: {
          address: "0x04F2993B25AFDee6d9020d42cBAaD667FD35f458",
          abi: DEV_ERC20_ABI
        },
        USDC_CONTRACT: {
          address: "0x7Bf4dC86937EB387807d09f935D3a5c3A2888119",
          abi: DEV_ERC20_ABI
        }
      },
      324: {
        SQUARY_CONTRACT: {
          address: "0xc9963B02bF18678D5a76910F9BF8B32d50C55EE1", // zk sync sepolia test Address
          abi: DEV_SQUARY_ABI
        },
        USDT_CONTRACT: {
          address: "0x04F2993B25AFDee6d9020d42cBAaD667FD35f458",
          abi: DEV_ERC20_ABI
        },
        USDC_CONTRACT: {
          address: "0x7Bf4dC86937EB387807d09f935D3a5c3A2888119",
          abi: DEV_ERC20_ABI
        }
      }
    },
    chainzkSyncTestnet: {
      chainId: 300,
      name: "zksyncSepoliaTestnet",
      currency: "ETH",
      explorerUrl: "",
      rpcUrl: "https://sepolia.era.zksync.dev",
    },
    chainMain: {
      chainId: 324,
      name: "zksync",
      currency: "ETH",
      explorerUrl: "https://mainnet.era.zksync.io",
      rpcUrl: "",
    },
  };

  export const APPLICATION_CONFIGURATION = DEVELOPMENT_CONFIGURATION;