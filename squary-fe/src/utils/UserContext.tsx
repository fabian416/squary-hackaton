import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { fetchAliases } from '../utils/fireBaseService';

interface UserContextType {
  currentUser: string | null; // Address of the connected wallet (or null if disconnected)
  isConnected: boolean; // Indicates if a wallet is connected
  aliases: Record<string, string>; // Aliases fetched from Firebase
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  isConnected: false,
  aliases: {}
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected, status } = useAccount(); // Wagmi's `useAccount` hook
  const [aliases, setAliases] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'connected' && address) {
      setCurrentUser(address); // Set the current user's address
      // Fetch aliases from Firebase
      const loadAliases = async () => {
        try {
          const aliasData = await fetchAliases(address);
          console.log('Fetched aliases (raw):', aliasData);

          // Normalizar las direcciones a minúsculas
          const normalizedAliases = Object.keys(aliasData).reduce((acc, key) => {
            acc[key.toLowerCase().trim()] = aliasData[key];
            return acc;
          }, {} as Record<string, string>);

          console.log('Normalized aliases:', normalizedAliases);
          setAliases(normalizedAliases);
        } catch (error) {
          console.error('Error fetching aliases:', error);
        }
      };
      loadAliases();
    } else if (status === 'disconnected') {
      setCurrentUser(null);
      setAliases({});
    }
  }, [status, address]);

  return (
    <UserContext.Provider value={{ currentUser, isConnected, aliases }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);