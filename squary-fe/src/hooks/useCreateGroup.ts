import { ethers } from 'ethers';
import { setDoc, doc } from 'firebase/firestore';
import { APPLICATION_CONFIGURATION } from '../consts/contracts';
import { firestore } from '../firebaseConfig';
import { useEthersSigner } from './ethersHooks'; // Importa tu hook

export const useCreateGroup = () => {
  const signer = useEthersSigner(); // Obtén el signer del hook
  const SQUARY_V2_CONTRACT_ADDRESS = APPLICATION_CONFIGURATION.contracts.SQUARY_CONTRACT.address;
  const SQUARY_V2_CONTRACT_ABI = APPLICATION_CONFIGURATION.contracts.SQUARY_CONTRACT.abi;

  const createGroup = async (groupName: string, members: string[], tokenAddress: string, signatureThreshold: string) => {
    if (!signer) {
      console.error('Signer is not available. Please connect a wallet.');
      return;
    }

    try {
      // Inicializa el contrato con el signer
      const contract = new ethers.Contract(SQUARY_V2_CONTRACT_ADDRESS, SQUARY_V2_CONTRACT_ABI, signer);

      // Crear el grupo en el smart contract
      const tx = await contract.createGroup(groupName, members, signatureThreshold, tokenAddress);
      const receipt = await tx.wait(); // Esperar a que la transacción sea confirmada
      console.log('Grupo creado con éxito en el smart contract:', receipt);

      // Obtener el ID del grupo del evento
      const event = receipt.logs
        ?.map((log: ethers.Log) => contract.interface.parseLog(log))
        .find((parsed: ethers.LogDescription) => parsed?.name === 'GroupCreated');

      if (!event || !event.args) {
        throw new Error('Event GroupCreated not found');
      }

      const groupId = event.args.id;

      // Crear el grupo en Firestore
      const groupData = {
        groupName,
        members,
        signatureThreshold,
        tokenAddress,
      };
      await setDoc(doc(firestore, 'groups', groupId.toString()), groupData);
      console.log('Grupo creado con éxito en Firestore:', groupData);

    } catch (error) {
      console.error('Error al crear el grupo:', error);
    }
  };

  return createGroup;
};