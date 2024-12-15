import React, { useState, useEffect } from 'react';
import ExpenseModal from './ExpenseModal/ExpenseModal';
import SettleModal from './SettleModal/SettleModal';
import { firestore } from '../../firebaseConfig';
import { doc, getDoc, collection, addDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { useEthersSigner } from '../../hooks/ethersHooks'; 
import { useUser } from '../../utils/UserContext';
import { Button } from "@/components/ui/button";
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
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const { currentUser } = useUser(); // Usa el contexto
  const [hasActiveProposal, setHasActiveProposal] = useState<boolean>(false);
  const [userHasSigned, setUserHasSigned] = useState<boolean>(false);
  const [settleProposalId, setSettleProposalId] = useState<string>('');
  const signer = useEthersSigner(); // Signer desde Viem

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
            className="w-full"
            onClick={handleOpenExpenseModal}
          >
            Add Expense
          </Button>

          {/* Start Settle Button */}
          <Button
            className="w-full"
            onClick={handleOpenSettleModal}
            disabled={hasActiveProposal && userHasSigned}
          >
          {hasActiveProposal ? (userHasSigned ? "Signed" : "Sign") : "Pay Debts"}
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
  
    </Card>
  );
};

export default GroupOptions;
