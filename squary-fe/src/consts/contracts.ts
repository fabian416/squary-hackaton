import DEV_SQUARY_ABI from "../../src/abi/dev/SQUARY.json"
import DEV_ERC20_ABI from "../../src/abi/dev/ERC20.json"

const DEVELOPMENT_CONFIGURATION = {
    contracts: {
      SQUARY_CONTRACT: {
        address: "0xFC5208079683746b88F792333159CF631e63fF80", // BASE Test address
        abi: DEV_SQUARY_ABI
      },
      USDT_CONTRACT: {
        address: "0xd0602be1b9c3ED0715Be5786AD34114D9Da737BD",
        abi: DEV_ERC20_ABI
      },
      USDC_CONTRACT: {
        address: "0x87B6F2A7A9e371f93bBbE75926400699202B8a58",
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
    chainPolygon: {
      chainId: 137,
      name: "Polygon Mainnet",
      currency: "Matic",
      explorerUrl: "https://polygon-mainnet.infura.io",
      rpcUrl: "https://polygon-mainnet.infura.io"
    },
    baseTestnet: {
      chainId: 84532,
      name: "Base Testnet",
      currency: "ETH",
      explorerUrl: "https://sepolia.basescan.org/",
      rpcUrl: "https://api.developer.coinbase.com/rpc/v1/base-sepolia/aOcbTxSy4UW-rAet6Qc7EQg3cM_enXfH"
    }
  };

  export const APPLICATION_CONFIGURATION = DEVELOPMENT_CONFIGURATION;