import DEV_SQUARY_ABI from "../../src/abi/dev/SQUARY.json"
import DEV_ERC20_ABI from "../../src/abi/dev/ERC20.json"

const DEVELOPMENT_CONFIGURATION = {
    contracts: {
      SQUARY_CONTRACT: {
        address: "0x89B30D7807E2AC1Fad9de819d26C5A5f49d42ab6", // zk sync sepolia test Address
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
    chainId: 80002,
    chainAmoy: {
      chainId: 80002,
      name: "Amoy",
      currency: "MATIC",
      explorerUrl: "https://www.oklink.com/amoy",
      rpcUrl: "https://rpc-amoy.polygon.technology/",
    },
  };

  export const APPLICATION_CONFIGURATION = DEVELOPMENT_CONFIGURATION;