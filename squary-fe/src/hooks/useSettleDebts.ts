import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { ethers } from 'ethers';
import { APPLICATION_CONFIGURATION } from '../consts/contracts';

const SQUARY_V2_CONTRACT_ADDRESS = APPLICATION_CONFIGURATION.contracts.SQUARY_CONTRACT.address;
const SQUARY_V2_CONTRACT_ABI = APPLICATION_CONFIGURATION.contracts.SQUARY_CONTRACT.abi;

// Función para obtener las deudas simplificadas de Firestore
export const fetchSimplifiedDebts = async (groupId: string) => {
  try {
    const debtsCollectionRef = collection(firestore, 'groups', groupId, 'simplifiedDebts');
    const debtsSnapshot = await getDocs(debtsCollectionRef);
    return debtsSnapshot.docs.map(doc => doc.data() as { debtor: string; creditor: string; amount: number });
  } catch (error) {
    console.error('Error fetching debts:', error);
    throw new Error('Failed to fetch debts');
  }
};

// Función para liquidar deudas usando ethers v6
export const settleDebts = async (
  walletProvider: ethers.BrowserProvider,
  groupId: string,
  signatures: string[]
) => {
  try {
    // Obtener el signer
    const signer = await walletProvider.getSigner();
    if (!signer) {
      throw new Error('Signer not found. Please connect your wallet.');
    }

    // Crear la instancia del contrato
    const contract = new ethers.Contract(SQUARY_V2_CONTRACT_ADDRESS, SQUARY_V2_CONTRACT_ABI, signer);

    // Obtener las deudas desde Firestore
    const debts = await fetchSimplifiedDebts(groupId);

    // Formatear las deudas para adaptarlas al contrato
    const formattedDebts = debts.map(debt => ({
      debtor: ethers.getAddress(debt.debtor),
      creditor: ethers.getAddress(debt.creditor),
      amount: ethers.parseUnits(debt.amount.toString(), 6).toString(), // Convertir a uint256
    }));

    // Llamar al método settleDebtsWithSignatures del contrato
    const tx = await contract.settleDebtsWithSignatures(groupId, formattedDebts, signatures);

    console.log('Transaction sent:', tx.hash);
    await tx.wait();
    console.log('Debts settled successfully');
  } catch (error) {
    console.error('Error settling debts:', error);
    throw new Error('Failed to settle debts');
  }
};