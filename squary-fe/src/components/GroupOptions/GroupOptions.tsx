import React, { useState, useEffect } from 'react';
import ExpenseModal from './ExpenseModal/ExpenseModal';
import SettleModal from './SettleModal/SettleModal';
import WithdrawDepositModal from './WithdrawDepositModal'; // Ensure this import exists
import { firestore } from '../../firebaseConfig';
import { doc, getDoc, collection, addDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { useEthersSigner } from '../../hooks/ethersHooks'; 
import { APPLICATION_CONFIGURATION } from '../../consts/contracts';
import { ethers } from 'ethers';
import { useUser } from '../../utils/UserContext';
import { success, error, loading, remove } from '../../utils/notificationUtils.tsx';
import { Button } from "@/components/ui/button";
import { cn } from "../../lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GroupOptionsProps {
  groupId: string;
  groupName: string;
  onBalancesUpdate?: () => void; // Agrega esta propiedad
}

interface Signature {
  signer: string;
  signature: string;
}

const GroupOptions: React.FC<GroupOptionsProps> = ({ groupId, groupName, onBalancesUpdate }) => {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showWithdrawDepositModal, setShowWithdrawDepositModal] = useState(false); // Added state
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const { currentUser } = useUser(); // Usa el contexto
  const [hasActiveProposal, setHasActiveProposal] = useState<boolean>(false);
  const [userHasSigned, setUserHasSigned] = useState<boolean>(false);
  const [settleProposalId, setSettleProposalId] = useState<string>('');
  const signer = useEthersSigner(); // Signer desde Viem
  const [modalActionType, setModalActionType] = useState<
  "Deposit" | "Withdraw"
>("Deposit");



   // Obtener miembros del grupo desde Firestore
   useEffect(() => {
    const fetchGroupMembers = async () => {
      const groupDoc = await getDoc(doc(firestore, 'groups', groupId));
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        if (groupData?.members) {
          setGroupMembers(groupData.members);
        }
      } else {
        console.error('Group does not exist');
      }
    };
    fetchGroupMembers();
  }, [groupId]);

  // Escuchar cambios en las propuestas de liquidación
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, 'groups', groupId, 'settleProposals'),
      (snapshot) => {
        if (!snapshot.empty) {
          const proposalDoc = snapshot.docs[0];
          const proposalData = proposalDoc.data();
          setHasActiveProposal(true);
          setSettleProposalId(proposalDoc.id);

          if (proposalData.signatures.some((sig: Signature) => sig.signer === signer?.address)) {
            setUserHasSigned(true);
          } else {
            setUserHasSigned(false);
          }
        } else {
          setHasActiveProposal(false);
          setUserHasSigned(false);
        }
      }
    );
    return () => unsubscribe();
  }, [groupId, signer]);

  const handleWithdrawFunds = async (amount: number) => {
    if (!signer) {
      console.error('No signer found. Please connect a wallet.');
      return;
    }
    try {
      const contract = new ethers.Contract(
        APPLICATION_CONFIGURATION.contracts.SQUARY_CONTRACT.address,
        APPLICATION_CONFIGURATION.contracts.SQUARY_CONTRACT.abi,
        signer
      );
      const parsedAmount = ethers.parseUnits(amount.toString(), 6);
      const tx = await contract.withdrawFunds(groupId, parsedAmount);
      console.log('Withdraw transaction sent:', tx.hash);
      await tx.wait();
      console.log('Withdrawal confirmed.');
      onBalancesUpdate?.();
    } catch (error) {
     
      console.error('Error during withdrawal:', error);
    }
  };const handleDepositFunds = async (amount: number) => {
    if (!signer) {
      console.error('No signer found. Please connect a wallet.');
      return;
    }
  
    try {
      const erc20Contract = new ethers.Contract(
        APPLICATION_CONFIGURATION.contracts.USDT_CONTRACT.address,
        APPLICATION_CONFIGURATION.contracts.USDT_CONTRACT.abi,
        signer
      );
      const squaryContract = new ethers.Contract(
        APPLICATION_CONFIGURATION.contracts.SQUARY_CONTRACT.address,
        APPLICATION_CONFIGURATION.contracts.SQUARY_CONTRACT.abi,
        signer
      );
      const parsedAmount = ethers.parseUnits(amount.toString(), 6);
  
      // Notificación para el proceso de aprobación
      let loadApprv: string | undefined; // Declarar la variable fuera del try-catch interno
      try {
        loadApprv = loading('Awaiting user confirmation for approval...');
        const approveTx = await erc20Contract.approve(
          APPLICATION_CONFIGURATION.contracts.SQUARY_CONTRACT.address,
          parsedAmount
        );
        remove(loadApprv);
  
        const loadComplete = loading('Awaiting for transaction to be completed...');
        console.log('Approve transaction sent:', approveTx.hash);
  
        await approveTx.wait();
        remove(loadComplete);
        success('Approval completed successfully.');
      } catch (approveError) {
        if (loadApprv) remove(loadApprv); // Eliminar el spinner de aprobación si ocurre un error
        error('Error during approval. Please try again.');
        console.error('Approval failed:', approveError);
        return; // Detener ejecución si falla la aprobación
      }
  
      // Notificación para el proceso de depósito
      let depositNotification: string | undefined; // Declarar la variable fuera del try-catch interno
      try {
        depositNotification = loading('Awaiting user confirmation for deposit...');
        const depositTx = await squaryContract.depositFunds(groupId, parsedAmount);
        remove(depositNotification);
  
        const txNotification = loading('Awaiting for transaction to be completed...');
        console.log('Deposit transaction sent:', depositTx.hash);
  
        await depositTx.wait();
        remove(txNotification);
        success('Deposit completed successfully.');
        console.log('Deposit confirmed.');
        onBalancesUpdate?.();
      } catch (depositError) {
        if (depositNotification) remove(depositNotification); // Eliminar el spinner de depósito si ocurre un error
        error('Error during deposit. Please try again.');
        console.error('Deposit failed:', depositError);
      }
    } catch (generalError) {
      console.error('Unexpected error during deposit:', generalError);
      error('An unexpected error occurred. Please try again.');
    }
  };

  const handleAction = async (amount: number) => {
    if (modalActionType === 'Withdraw') {
      await handleWithdrawFunds(amount);
    } else if (modalActionType === 'Deposit') {
      await handleDepositFunds(amount);
    }
  };
  const handleAddExpense = async (amount: number, description: string, sharedWith: string[], paidBy: string) => {
    const newExpense = {
      amount,
      description,
      paidBy,
      sharedWith,
      settled: false,
      timestamp: Timestamp.fromDate(new Date())
    };
    await addDoc(collection(firestore, 'groups', groupId, 'expenses'), newExpense);
  };

  // Modal Handlers
  const handleOpenExpenseModal = () => setShowExpenseModal(true);
  const handleCloseExpenseModal = () => setShowExpenseModal(false);

  const handleOpenSettleModal = () => {
    if (!hasActiveProposal || !userHasSigned) {
      setShowSettleModal(true);
    }
  };
  const handleCloseSettleModal = () => setShowSettleModal(false);

  return (
    <Card className="mb-6">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-semibold">{groupName}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between gap-4">
          {/* Add Expense Button */}
          <Button
            variant="default"
            size="lg"
            onClick={handleOpenExpenseModal}
            className="bg-orange-400 hover:bg-orange-500 text-white w-full h-14 flex items-center justify-center font-medium rounded-md"
          >
            Add Expense
          </Button>

          {/* Start Settle Button */}
          <Button
          variant="default"
          size="lg"
          onClick={handleOpenSettleModal}
          className={cn(
            "bg-orange-400 hover:bg-orange-500 text-white w-full h-14 flex items-center justify-center font-medium rounded-md",
            hasActiveProposal ? "bg-gray-400 cursor-not-allowed" : "bg-orange-400"
          )}
          disabled={hasActiveProposal && userHasSigned}
        >
          {hasActiveProposal ? (userHasSigned ? "Signed" : "Sign") : "Start Settle"}
        </Button>

          {/* Deposit Button */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setModalActionType("Deposit");
              setShowWithdrawDepositModal(true);
            }}
            className="border-orange-500 text-orange-500 hover:bg-orange-100 hover:text-orange-600 w-full h-14 flex items-center justify-center font-medium rounded-md"
          >
            Deposit
          </Button>

          {/* Withdraw Button */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setModalActionType("Withdraw");
              setShowWithdrawDepositModal(true);
            }}
            className="border-orange-500 text-orange-500 hover:bg-orange-100 hover:text-orange-600 w-full h-14 flex items-center justify-center font-medium rounded-md"
          >
            Withdraw
          </Button>
        </CardContent>
  
      {/* Expense Modal */}
      {showExpenseModal && currentUser && (
        <ExpenseModal
          show={showExpenseModal}
          handleClose={handleCloseExpenseModal}
          addExpense={handleAddExpense}
          groupMembers={groupMembers}
          paidBy={currentUser}
        />
      )}
  
      {/* Settle Modal */}
      {showSettleModal && currentUser && (
        <SettleModal
          show={showSettleModal}
          handleClose={handleCloseSettleModal}
          groupId={groupId}
          currentUser={currentUser}
          hasActiveProposal={hasActiveProposal}
          userHasSigned={userHasSigned}
          settleProposalId={settleProposalId}
        />
      )}
  
      {/* Withdraw/Deposit Modal */}
      {showWithdrawDepositModal && (
        <WithdrawDepositModal
          show={showWithdrawDepositModal}
          handleClose={() => setShowWithdrawDepositModal(false)}
          actionType={modalActionType}
          handleAction={handleAction}
        />
      )}
    </Card>
  );
};

export default GroupOptions;
