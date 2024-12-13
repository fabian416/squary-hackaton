import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { ethers } from 'ethers';
import { useEnsName } from 'wagmi';
import { useUser } from '../../../utils/UserContext';
import { sepolia } from 'viem/chains';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Apollo Client setup
const client = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/49377/balances/v0.0.2',
  cache: new InMemoryCache(),
});

const GET_BALANCES = gql`
  query GetBalances($groupId: Bytes!) {
    balances(where: { groupId: $groupId }) {
      id
      member
      balance
    }
  }
`;

interface GroupBalancesProps {
  balances: Balance[]; // La lista de balances será pasada como prop
}

interface Balance {
  id: string;
  member: string;
  balance: string; // Manejo como string para BigNumber
}

// Nuevo tipo extendido para incluir las propiedades calculadas
interface ProcessedBalance extends Balance {
  rawBalance: number;
  available: number;
}

export const fetchBalances = async (groupId: string): Promise<Balance[]> => {

  try {
    const result = await client.query({
      query: GET_BALANCES,
      variables: { groupId },
      fetchPolicy: "no-cache",
    });

    const balances = result.data.balances || [];
    console.log('Fetched balances from subgraph:', balances);
    return balances;
  } catch (error) {
    console.error('Error fetching on-chain balances:', error);
    return [];
  }
};

const calculateNetAvailable = (balances: Balance[], memberAddress: string): number => {
  console.log(`Calculating net available for member: ${memberAddress}`);

  const userBalance = balances.find((b) => b.member === memberAddress)?.balance || '0';
  const userDeposits = parseFloat(ethers.formatUnits(userBalance, 6));

  const debtsOwedByUser = balances
    .filter((b) => parseFloat(ethers.formatUnits(b.balance, 6)) < 0)
    .reduce((sum, debt) => {
      const debtAmount = Math.abs(parseFloat(ethers.formatUnits(debt.balance, 6)));
      return sum + debtAmount;
    }, 0);

  const netAvailable = Math.max(userDeposits - debtsOwedByUser, 0);
  return netAvailable;
};

// Componente auxiliar para resolver nombres con prioridad ENS > Alias > Dirección abreviada
const ENSName: React.FC<{ address: string }> = ({ address }) => {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: sepolia.id, // Sepolia o Mainnet
  });
  const { aliases } = useUser();

  const resolveName = (): string => {
    if (ensName) return ensName; // Si hay ENS
    if (aliases[address.toLowerCase()]) return aliases[address.toLowerCase()]; // Si hay alias
    return `${address.substring(0, 6)}...${address.slice(-4)}`; // Dirección abreviada
  };

  return <>{resolveName()}</>;
};

const GroupBalances: React.FC<GroupBalancesProps> = ({ balances }) => {
  const [processedBalances, setProcessedBalances] = useState<ProcessedBalance[]>([]);

  useEffect(() => {
    console.log("Balances received in GroupBalances:", balances);
    const formattedBalances = balances.map((balance) => {
      const rawBalance = parseFloat(ethers.formatUnits(balance.balance, 6));
      const available = calculateNetAvailable(balances, balance.member);
      return {
        ...balance,
        rawBalance,
        available,
      };
    });
    setProcessedBalances(formattedBalances);
    console.log("Processed balances updated:", formattedBalances);
  }, [balances]);

  const owingBalances = processedBalances.filter((b) => b.rawBalance < 0).map((debtor) => {
    const creditor = processedBalances.find(
      (b) => b.rawBalance > 0 && b.member !== debtor.member
    );
    return {
      ...debtor,
      creditor: creditor?.member || 'Unknown',
    };
  });

  const availableBalances = processedBalances.filter((b) => b.available > 0);
  
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">Balances</h2>
      <Tabs defaultValue="available" className="w-full max-w-[600px] mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="debts">Debts</TabsTrigger>
          <TabsTrigger value="available">Available Balances</TabsTrigger>
        </TabsList>

        {/* Debts Section */}
        <TabsContent value="debts">
          {owingBalances.length > 0 ? (
            owingBalances.map((balance) => (
              <Card key={balance.id} className="border-red-500 mb-4">
                <CardHeader>
                  <CardTitle className="text-red-700">
                    <ENSName address={balance.member} /> owes:
                  </CardTitle>
                  <CardDescription>
                    ${Math.abs(balance.rawBalance).toFixed(2)}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground">No debts found for this group.</p>
          )}
        </TabsContent>

        {/* Available Balances Section */}
        <TabsContent value="available">
          {availableBalances.length > 0 ? (
            availableBalances.map((balance) => (
              <Card key={balance.id} className="border-green-500 mb-4">
                <CardHeader>
                  <CardTitle className="text-green-700">
                    <ENSName address={balance.member} /> available:
                  </CardTitle>
                  <CardDescription className="text-orange-500">
                    ${balance.available.toFixed(2)}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground">
              No available balances for this group.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupBalances;