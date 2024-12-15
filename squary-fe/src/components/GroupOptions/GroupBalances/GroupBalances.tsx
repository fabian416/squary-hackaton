import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { collection, DocumentData, QuerySnapshot, onSnapshot } from 'firebase/firestore';
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
import { useAccount } from 'wagmi';

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

const GroupBalances: React.FC<GroupBalancesProps> = ({ groupId }) => {
  const [simplifiedDebts, setSimplifiedDebts] = useState<Debt[]>([]);
  const { address } = useAccount();

  // Obtener gastos desde Firestore
  useEffect(() => {
    const expensesRef = collection(firestore, 'groups', groupId, 'expenses');
    const unsubscribe = onSnapshot(expensesRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const fetchedExpenses: Expense[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          amount: data.amount,
          description: data.description,
          paidBy: data.paidBy,
          sharedWith: data.sharedWith,
          settled: data.settled,
          timestamp: data.timestamp,
        } as Expense;
      });

      const debts = calculateSimplifiedDebts(fetchedExpenses);
      setSimplifiedDebts(debts);
    });

    return () => unsubscribe(); // Cleanup on unmount
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
              <Card key={`${balance.debtor}-${balance.amount}`} className={balance.debtor == address ? "border-red-500 mb-4" : "border-green-500 mb-4"}>
                <CardHeader>
                  <CardTitle className={balance.debtor == address ? "border-red-700" : "border-green-700"}>
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