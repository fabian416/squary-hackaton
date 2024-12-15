import React, { useEffect, useState } from 'react';
import { firestore } from '../../../firebaseConfig';
import { collection, onSnapshot, DocumentData, QuerySnapshot, Timestamp } from 'firebase/firestore';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { ENSName } from '../ExpenseModal/ExpenseModal';

interface GroupExpensesProps {
  groupId: string;
}

interface Expense {
  amount: number;
  description: string;
  paidBy: string;
  sharedWith: string[];
  settled: boolean;
  timestamp: Timestamp; // Puedes usar Date si conviertes los timestamps a Date
}

const GroupExpenses: React.FC<GroupExpensesProps> = ({ groupId }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

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

      setExpenses(fetchedExpenses);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [groupId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Expenses</h2>
        <span className="text-yellow-500 font-medium">• Pending</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Paid By</TableHead>
            <TableHead>Shared With</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-black">
          {expenses.map((expense, index) => (
            <TableRow key={index}>
              <TableCell>{expense.description}</TableCell>
              <TableCell>${expense.amount}</TableCell>
              <TableCell>
                <ENSName address={expense.paidBy} shrink={true} />
              </TableCell>
              <TableCell>
                {expense.sharedWith.map((member, idx) => (
                  <span key={idx} className="block">
                    <ENSName address={member} shrink={true} />
                  </span>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GroupExpenses;