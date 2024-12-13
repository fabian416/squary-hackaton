import { useState, useEffect, useCallback } from "react";
import { useEthersProvider } from "./ethersHooks";
import { APPLICATION_CONFIGURATION } from "../consts/contracts";
import { ethers } from "ethers";
import { useUser } from '../utils/UserContext'; 

export const useUserGroups = () => {
  const provider = useEthersProvider(); // Obtiene el proveedor de ethers.js
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const { currentUser } = useUser(); 
  const fetchGroups = useCallback(async () => {
    if (!provider) {
      console.error("Provider no encontrado");
      return;
    }
    
    try {
      const contract = new ethers.Contract(
        APPLICATION_CONFIGURATION.contracts.SQUARY_CONTRACT.address,
        APPLICATION_CONFIGURATION.contracts.SQUARY_CONTRACT.abi,
        provider
      );
      const groupIds = await contract.getUserGroups(currentUser);
      const groupDetails = await Promise.all(
        groupIds.map(async (groupId: string) => {
          const [name] = await contract.getGroupDetails(groupId);
          return { id: groupId, name };
        })
      );
      setGroups(groupDetails);
    } catch (error) {
      console.error("Error obteniendo grupos:", error);
    }
  }, [provider]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, fetchGroups };
};