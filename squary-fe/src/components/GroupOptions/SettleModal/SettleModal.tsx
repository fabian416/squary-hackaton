import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "../../../lib/utils";
import { addDoc, updateDoc, doc, arrayUnion, getDoc, collection, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { ethers } from 'ethers';
import { useEthersSigner } from '../../../hooks/ethersHooks'; 
import { APPLICATION_CONFIGURATION } from '../../../consts/contracts';
import { useEnsName } from 'wagmi';
import { useUser } from '../../../utils/UserContext';
import { sepolia } from 'viem/chains';

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

interface Signature {
  signer: string;
  signature: string;
}

interface SettleModalProps {
  show: boolean;
  handleClose: () => void;
  groupId: string;
  currentUser: string;
  hasActiveProposal: boolean;
  userHasSigned: boolean;
  settleProposalId: string;
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

const SettleModal: React.FC<SettleModalProps> = ({
  show,
  handleClose,
  groupId,
  currentUser,
  hasActiveProposal,
  userHasSigned,
  settleProposalId
}) => {
  const [simplifiedDebts, setSimplifiedDebts] = useState<Debt[]>([]);
  const [hasActiveProposalState, setHasActiveProposalState] = useState(hasActiveProposal);
  const signer = useEthersSigner(); 
  
  console.log('Has Active Proposal State:', hasActiveProposalState);

  useEffect(() => {
    setHasActiveProposalState(hasActiveProposal);
  }, [hasActiveProposal]);

  // Obtener y calcular las deudas simplificadas al abrir el modal
  useEffect(() => {
    const fetchExpensesAndCalculateDebts = async () => {
      const expensesSnapshot = await getDocs(collection(firestore, 'groups', groupId, 'expenses'));
      const expenses: Expense[] = expensesSnapshot.docs.map(doc => doc.data() as Expense);

      const debts = calculateSimplifiedDebts(expenses);
      setSimplifiedDebts(debts);

      // Imprimir las deudas simplificadas
      console.log('Simplified debts:', debts);
    };

    if (show) {
      fetchExpensesAndCalculateDebts();
    }
  }, [show, groupId]);
    
  const handleProposeSettle = async () => {
    if (!signer) {
      console.error('Signer not found. Please connect a wallet.');
      return;
    }
    
    try {
    const contract = new ethers.Contract(
      APPLICATION_CONFIGURATION.contracts.SQUARY_CONTRACT.address,
      APPLICATION_CONFIGURATION.contracts.SQUARY_CONTRACT.abi,
      signer
    );
  
    const isMember = await contract.isMember(groupId, currentUser);
    if (!isMember) {
      console.error('Current user is not a member of the group');
      return;
    }
  
    const group = await contract.groups(groupId);
    const groupNonce = group.nonce;
  
    // Convertir las deudas simplificadas a BigNumber
    const formattedDebts = simplifiedDebts.map(debt => ({
      debtor: ethers.getAddress(debt.debtor),
      creditor: ethers.getAddress(debt.creditor),
      amount: ethers.parseUnits(Number(debt.amount).toFixed(6), 6).toString(),
    }));
  
    console.log("Simplified Debts:", simplifiedDebts); // Imprimir las deudas simplificadas en consola
  
    const calculateActionHash = (groupId: string, debts: typeof formattedDebts, nonce: bigint) => {
      let hash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['bytes32'], [groupId]));
      for (const debt of debts) {
        hash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'address', 'address', 'uint256'],
          [hash, debt.debtor, debt.creditor, BigInt(debt.amount)]
        ));
      }
      return ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ['bytes32', 'string', 'uint256'],
        [hash, 'settleDebts', nonce]
      ));
    };
  
    const actionHashScript = calculateActionHash(groupId, formattedDebts, groupNonce);
    const signature = await signer.signMessage(ethers.getBytes(actionHashScript));
  
    if (!hasActiveProposal) {
      // Crear una nueva propuesta de settle
      const settleProposal = {
        groupId,
        debts: formattedDebts,
        proposer: currentUser,
        signatures: [{ signer: currentUser, signature }]
      };
  
      await addDoc(collection(firestore, 'groups', groupId, 'settleProposals'), settleProposal);
      console.log('Settle proposal created and signed successfully');
      handleClose();
    } else if (!userHasSigned) {
      // Agregar la firma del usuario a una propuesta activa
      const proposalRef = doc(firestore, 'groups', groupId, 'settleProposals', settleProposalId);
      await updateDoc(proposalRef, {
        signatures: arrayUnion({ signer: currentUser, signature })
      });
  
      // Verificar si se alcanzó el umbral de firmas
      const groupDoc = await getDoc(doc(firestore, 'groups', groupId));
      const groupData = groupDoc.data();
      const signatureThreshold = groupData?.signatureThreshold;
  
      const updatedProposalSnap = await getDoc(proposalRef);
      const updatedProposalData = updatedProposalSnap.data();
      if (updatedProposalData && updatedProposalData.signatures.length >= signatureThreshold) {
        console.log('Signatures:', updatedProposalData.signatures);
      
        // Llamar al contrato para realizar el settle
        try {
          const tx = await contract.settleDebtsWithSignatures(
            groupId,
            formattedDebts,
            updatedProposalData.signatures.map((sig: Signature) => sig.signature)
          );
          console.log('Transaction sent:', tx.hash);
      
          // Esperar confirmación
          await tx.wait();
          console.log('Transaction confirmed successfully.');
      
          // Marcar las expenses como settled en Firestore
          const expensesRef = collection(firestore, 'groups', groupId, 'expenses');
          const snapshot = await getDocs(expensesRef);
      
          const batch = writeBatch(firestore);
          snapshot.forEach(doc => {
            const data = doc.data();
            if (!data.settled) {
              const expenseRef = doc.ref;
              batch.update(expenseRef, { settled: true });
            }
          });
      
          await batch.commit();
          console.log('Expenses marked as settled successfully.');
              
          // Eliminar la propuesta de Firestore
        const proposalRef = doc(firestore, 'groups', groupId, 'settleProposals', settleProposalId);
        await deleteDoc(proposalRef);
        console.log('Proposal deleted successfully.');

        // Reiniciar estado del botón a "Start Settle"
        setSimplifiedDebts([]);
        setHasActiveProposalState(false); // Actualizar el estado después de eliminar la propuesta
        } catch (error) {
          console.error('Error during settle transaction:', error);
        }
      }
      else {
        console.log('Signed settle proposal successfully.');
      }
    
      // Cierra el modal automáticamente
      handleClose();
    }
    handleClose()
  } catch (error) {
    console.error('Error during the operation:', error);
  }
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
          disabled={hasActiveProposalState && userHasSigned} // Use state to manage button interactivity
          className={cn(
            "w-full py-4 text-lg h-14 font-medium transition-all duration-200", // Base styles
            hasActiveProposalState && userHasSigned
              ? "bg-gray-400 cursor-not-allowed" // Disabled state
              : "bg-yellow-500 hover:bg-yellow-600 text-white" // Active state
          )}
        >
          {hasActiveProposalState
            ? userHasSigned
              ? "Signed" // Button text when signed
              : "Sign" // Button text when signature is needed
            : "Propose Settle"} // Default text when no active proposal
        </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettleModal;