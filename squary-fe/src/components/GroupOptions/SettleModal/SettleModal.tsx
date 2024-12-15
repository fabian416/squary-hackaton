import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "../../../lib/utils";
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { ethers } from 'ethers';
import { useEthersSigner } from '../../../hooks/ethersHooks'; 
import { APPLICATION_CONFIGURATION } from '../../../consts/contracts';
import { ENSName } from '../ExpenseModal/ExpenseModal';
import { getChainId } from '@wagmi/core'
import { wagmiConfig } from '../../../wagmi';
import { useAccount } from 'wagmi';
import { loading, remove } from '@/utils/notificationUtils';
import { useEthersProvider } from '@/hooks/ethersHooks';

interface Debt {
  debtor: string;
  creditor: string;
  amount: number;
}

interface Expense {
  amount: number;
  description: string;
  paidBy: string;
  sharedWith: string[];
  settled: boolean;
  timestamp: any;
}

interface SettleModalProps {
  show: boolean;
  handleClose: () => void;
  groupId: string;
  currentUser: string;
}

Modal.setAppElement('#root');

const calculateSimplifiedDebts = (expenses: Expense[]): Debt[] => {
  const balances: { [key: string]: number } = {};

  // Calcular los balances
  expenses.forEach(expense => {
    if (!expense.settled) {
      const totalParticipants = expense.sharedWith.length + 1; // Incluye al pagador
      const share = expense.amount / totalParticipants;

      expense.sharedWith.forEach(member => {
        if (!balances[member]) balances[member] = 0;
        balances[member] -= share; // Los participantes deben una parte del gasto
      });

      if (!balances[expense.paidBy]) balances[expense.paidBy] = 0;
      balances[expense.paidBy] += share * expense.sharedWith.length; // El pagador asume el gasto restante
    }
  });

  // Simplificar las deudas
  const simplifiedDebts: Debt[] = [];
  for (const [debtor, debt] of Object.entries(balances)) {
    if (debt < 0) {
      for (const [creditor, credit] of Object.entries(balances)) {
        if (credit > 0) {
          const amount = Math.min(-debt, credit);
          if (amount > 0) {
            simplifiedDebts.push({ debtor, creditor, amount });
            balances[debtor] += amount;
            balances[creditor] -= amount;
          }
        }
      }
    }
  }

  return simplifiedDebts;
};

const SettleModal: React.FC<SettleModalProps> = ({
  show,
  handleClose,
  groupId,
  currentUser,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [simplifiedDebts, setSimplifiedDebts] = useState<Debt[]>([]);
  const [totalDebt, setTotalDebt] = useState(0n);
  const signer = useEthersSigner(); 
  const chainId = getChainId(wagmiConfig);
  const { address } = useAccount();

  // Obtener y calcular las deudas simplificadas al abrir el modal
  useEffect(() => {
    const fetchExpensesAndCalculateDebts = async () => {
      const expensesSnapshot = await getDocs(collection(firestore, 'groups', groupId, 'expenses'));
      const expenses: Expense[] = expensesSnapshot.docs.map(doc => doc.data() as Expense);
      const provider = useEthersProvider(); // Obtiene el proveedor de ethers.js

      const debts = calculateSimplifiedDebts(expenses);
      setSimplifiedDebts(debts);

      const contract = new ethers.Contract(
        APPLICATION_CONFIGURATION.contracts[chainId].SQUARY_CONTRACT.address,
        APPLICATION_CONFIGURATION.contracts[chainId].SQUARY_CONTRACT.abi,
        provider
      );

      const finalDebts = await Promise.all(
        debts.map(async (debt) => {
          const isPaid = await contract.paid(groupId, debt.debtor, debt.creditor);
          return { debt, isPaid };
        })
      );
      const unpaidDebts = finalDebts.filter(({ isPaid }) => !isPaid).map(({ debt }) => debt);

      console.log({unpaidDebts});
      setSimplifiedDebts(unpaidDebts);

      // Convertir las deudas simplificadas a BigNumber
      const formattedDebts = debts.map(debt => ({
        debtor: ethers.getAddress(debt.debtor),
        creditor: ethers.getAddress(debt.creditor),
        amount: ethers.parseUnits(Number(debt.amount).toFixed(18), 18),
      }));
    

      const favorAmount = formattedDebts.reduce(
        (sum, debt) => (debt.creditor === address ? sum + debt.amount : sum),
        0n // Valor inicial como `bigint`
      );
      
      const contraAmount = formattedDebts.reduce(
        (sum, debt) => (debt.debtor === address ? sum + debt.amount : sum),
        0n // Valor inicial como `bigint`
      );

      const debtAmount = contraAmount - favorAmount;
      console.log(debtAmount);
      setTotalDebt(debtAmount);
      console.log("Total Debt Amount:", debtAmount);

      // Imprimir las deudas simplificadas
      console.log('Simplified debts:', debts);
    };

    if (show) {
      fetchExpensesAndCalculateDebts();
    }
  }, [show, groupId]);
  console.log({groupId});
    
  const handleProposeSettle = async () => {
    if (!signer) {
      console.error('Signer not found. Please connect a wallet.');
      return;
    }
    
    setIsLoading(true);
    let loadTx = loading("Loading, please wait...");
    try {
      const contract = new ethers.Contract(
        APPLICATION_CONFIGURATION.contracts[chainId].SQUARY_CONTRACT.address,
        APPLICATION_CONFIGURATION.contracts[chainId].SQUARY_CONTRACT.abi,
        signer
      );
    
      const isMember = await contract.isMember(groupId, currentUser);
      if (!isMember) {
        console.error('Current user is not a member of the group');
        return;
      }
    
      // Convertir las deudas simplificadas a BigNumber
      const formattedDebts = simplifiedDebts.map(debt => ({
        debtor: ethers.getAddress(debt.debtor),
        creditor: ethers.getAddress(debt.creditor),
        amount: ethers.parseUnits(Number(debt.amount).toFixed(18), 18),
      }));
    
      console.log("Formated Debts:", formattedDebts); // Imprimir las deudas simplificadas en consola

      // Sumar los valores utilizando `bigint`
      const finalAmount = formattedDebts.reduce(
        (sum, debt) => sum + debt.amount, // Suma directa con `bigint`
        0n // Valor inicial como `bigint`
      );

      const parsedAmount = ethers.parseUnits(Number(finalAmount).toFixed(0), 0);
      console.log("Total Debt Amount:", parsedAmount);

      // Llamar al contrato para realizar el settle
      try {

        const groupDoc = await getDoc(doc(firestore, 'groups', groupId));
        const groupData = groupDoc.data();
        const tokenAddress = groupData?.tokenAddress;
        console.log({tokenAddress});
        const erc20Contract = new ethers.Contract(
          tokenAddress,
          APPLICATION_CONFIGURATION.contracts[chainId].USDT_CONTRACT.abi,
          signer
        );

        const tx1 = await erc20Contract.approve(APPLICATION_CONFIGURATION.contracts[chainId].SQUARY_CONTRACT.address, parsedAmount);
        console.log('Transaction sent:', tx1.hash);
        // Esperar confirmación
        await tx1.wait();
        console.log('Transaction confirmed successfully.');

        console.log({groupId});
        console.log({formattedDebts});
        const hexGroupId = ethers.zeroPadValue(ethers.hexlify(groupId), 32);
        const tx2 = await contract.settleDebts(hexGroupId, formattedDebts);
        console.log('Transaction sent:', tx2.hash);
    
        // Esperar confirmación
        await tx2.wait();
        console.log('Transaction confirmed successfully.');

        // Reiniciar estado del botón a "Start Settle"
        setSimplifiedDebts([]);
      } catch (error) {
        console.error('Error during settle transaction:', error);
      }
    } catch (error) {
      console.error('Error during settle transaction:', error);
    }
    // Cierra el modal automáticamente
    handleClose();
    setIsLoading(false);
    remove(loadTx);
  }

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-medium text-black-600">
            Settle Debts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* List of Debts */}
          <ul className="space-y-4">
            {simplifiedDebts.map((debt, index) => (
              <li
                key={index}
                className="flex justify-between items-center border-b pb-3 text-lg"
              >
                <span className="text-gray-700">
                  <ENSName address={debt.debtor} /> owes{" "}
                  <ENSName address={debt.creditor} />:
                </span>
                <span className="text-black font-semibold">
                  ${debt.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          {/* Action Button */}
          <Button
            onClick={handleProposeSettle}
            className={cn(
              "w-full py-4 text-lg h-14 font-medium transition-all duration-200", // Base styles
            )}
            disabled={totalDebt <= 0 || isLoading}
          >
            Pay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettleModal;
export {calculateSimplifiedDebts}