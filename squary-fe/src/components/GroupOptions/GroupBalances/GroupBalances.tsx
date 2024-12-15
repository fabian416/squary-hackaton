import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { ethers } from 'ethers';
import { useEnsName } from 'wagmi';
import { useUser } from '../../../utils/UserContext';
import { sepolia } from 'viem/chains';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
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
import { calculateSimplifiedDebts } from '../SettleModal/SettleModal';
import { firestore } from '../../../firebaseConfig';
import { ENSName } from '../ExpenseModal/ExpenseModal';

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
  groupId: string;
}

interface Balance {
  id: string;
  member: string;
  balance: string; // Manejo como string para BigNumber
}

// Nuevo tipo extendido para incluir las propiedades calculadas
interface ProcessedBalance extends Balance {
  rawBalance: number;
}


interface Expense {
  amount: number;
  description: string;
  paidBy: string;
  sharedWith: string[];
  settled: boolean;
  timestamp: any;
}

interface Debt {
  debtor: string;
  creditor: string;
  amount: number;
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

const GroupBalances: React.FC<GroupBalancesProps> = ({ balances, groupId }) => {
  const [processedBalances, setProcessedBalances] = useState<ProcessedBalance[]>([]);
  const [simplifiedDebts, setSimplifiedDebts] = useState<Debt[]>([]);

  useEffect(() => {
    console.log("Balances received in GroupBalances:", balances);
    const formattedBalances = balances.map((balance) => {
      const rawBalance = parseFloat(ethers.formatUnits(balance.balance, 6));
      return {
        ...balance,
        rawBalance,
      };
    });
    setProcessedBalances(formattedBalances);
    console.log("Processed balances updated:", formattedBalances);
  }, [balances]);

  useEffect(() => {
    const fetchExpensesAndCalculateDebts = async () => {
      const expensesSnapshot = await getDocs(collection(firestore, 'groups', groupId, 'expenses'));
      const expenses: Expense[] = expensesSnapshot.docs.map(doc => doc.data() as Expense);

      const debts = calculateSimplifiedDebts(expenses);
      setSimplifiedDebts(debts);
    };

    fetchExpensesAndCalculateDebts();
  }, [groupId]);
  
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">Balances</h2>
      <Tabs defaultValue="debts" className="w-full mx-auto">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="debts">Debts</TabsTrigger>
        </TabsList>

        {/* Debts Section */}
        <TabsContent value="debts">
          {simplifiedDebts.length > 0 ? (
            simplifiedDebts.map((balance) => (
              <Card key={`${balance.debtor}-${balance.amount}`} className="border-red-500 mb-4">
                <CardHeader>
                  <CardTitle className="text-red-700">
                    <ENSName address={balance.debtor} /> owes <ENSName address={balance.creditor} />:
                  </CardTitle>
                  <CardDescription>
                    ${Math.abs(balance.amount).toFixed(2)}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          ) : (
            <div className="grid place-items-center h-full m-3">
              <p className="text-muted-foreground">No debts found for this group.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupBalances;