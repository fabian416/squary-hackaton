import { useState, useEffect, useCallback } from "react";
import { useEthersProvider } from "./ethersHooks";
import { APPLICATION_CONFIGURATION } from "../consts/contracts";
import { ethers } from "ethers";
import { getChainId } from '@wagmi/core'
import { wagmiConfig } from '../wagmi';
import { useAccount } from 'wagmi';

export const useUserGroups = () => {
  const provider = useEthersProvider(); // Obtiene el proveedor de ethers.js
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const { address } = useAccount();
  const chainId = getChainId(wagmiConfig);
  const fetchGroups = useCallback(async () => {
    if (!provider) {
      return console.error("Provider no encontrado");
    }
    
    const contract = new ethers.Contract(
      APPLICATION_CONFIGURATION.contracts[chainId].SQUARY_CONTRACT.address,
      APPLICATION_CONFIGURATION.contracts[chainId].SQUARY_CONTRACT.abi,
      provider
    );
    
    const groupIds = await contract.getUserGroups(address);
    const groupDetails = await Promise.all(
      groupIds.map(async (groupId: string) => {
        const [name] = await contract.getGroupDetails(groupId);
        return { id: groupId, name };
      })
    );
    setGroups(groupDetails);

  }, [provider]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, fetchGroups };
};