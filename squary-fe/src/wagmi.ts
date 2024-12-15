
import { zksyncSepoliaTestnet } from 'wagmi/chains';
import { http } from 'viem';

import { zksyncSsoConnector, callPolicy } from "zksync-sso/connector";

import { createConfig, connect } from "@wagmi/core";
import { erc20Abi } from "viem";
import { ethers } from 'ethers';

const ssoConnector = zksyncSsoConnector({
  // Configuración de la sesión opcional
  session: {
    expiry: "1 day",

    // Límite de gastos en gas fees
    feeLimit: ethers.parseEther("0.1"),

    transfers: [
      // Permitir transferencias de hasta 0.1 ETH a una dirección específica
      {
        to: "0xC0aafBb677761D3Fc66ee86f6B06A2d3548d7DC2",
        valueLimit: ethers.parseEther("0.1"),
      },
    ],

    // Permitir llamadas a contratos inteligentes
    contractCalls: [
      callPolicy({
        address: "0x04F2993B25AFDee6d9020d42cBAaD667FD35f458", // Dirección del contrato USDT
        abi: erc20Abi,
        functionName: "approve", // Permitir llamadas a la función "approve"
        constraints: [
          // Restringir el primer argumento a una dirección específica
          {
            index: 0, // Primer argumento de la función "approve" (spender)
            value: "0xC0aafBb677761D3Fc66ee86f6B06A2d3548d7DC2", // Reemplaza con la dirección de tu contrato Squary
          },
          // Límite máximo de aprobación de 300 tokens por día
          {
            index: 1, // Segundo argumento de la función "approve" (amount)
            limit: {
              limit: ethers.parseUnits("300", 18), // 300 tokens con 6 decimales (USDT típicamente usa 6 decimales)
              period: "1 day", // Límite diario
            },
          },
        ],
      }),
      // Política para USDC
  callPolicy({
    address: "0x7Bf4dC86937EB387807d09f935D3a5c3A2888119", // Dirección del contrato USDC
    abi: erc20Abi,
    functionName: "approve", // Permitir llamadas a la función "approve"
    constraints: [
      {
        index: 0, // Spender (primer argumento)
        value: "0xC0aafBb677761D3Fc66ee86f6B06A2d3548d7DC2", // Dirección del contrato Squary
      },
      {
        index: 1, // Amount (segundo argumento)
        limit: {
          limit: ethers.parseUnits("300", 18), // Límite de 300 USDC por día
          period: "1 day",
        },
      },
    ],
    }),
    ],
  },
});

export const connectWithSSO = () => {
  connect(wagmiConfig, {
    connector: ssoConnector,
    chainId: zksyncSepoliaTestnet.id, // or another chain id that has SSO support
  });
};

export const wagmiConfig = createConfig({
  connectors: [ssoConnector],
  chains: [zksyncSepoliaTestnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [zksyncSepoliaTestnet.id]: http()
  },
});