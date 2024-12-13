import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEnsName } from 'wagmi';
import { useUser } from '../../../utils/UserContext';
import { sepolia } from 'viem/chains';

interface ExpenseModalProps {
  show: boolean;
  handleClose: () => void;
  addExpense: (amount: number, description: string, sharedWith: string[], paidBy: string) => void;
  groupMembers: string[];
  paidBy: string; // Dirección del miembro que propone el gasto
}

// Componente auxiliar para resolver nombres con prioridad ENS > Alias > Dirección abreviada
const ENSName: React.FC<{ address: string }> = ({ address }) => {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: sepolia.id,
  });
  const { aliases } = useUser();

  const resolveName = (): string => {
    if (ensName) return ensName; // If ENS name exists
    if (aliases[address.toLowerCase()]) return aliases[address.toLowerCase()]; // If alias exists
    return `${address.substring(0, 6)}...${address.slice(-4)}`; // Shortened address
  };

  return resolveName();
};

const ExpenseModal: React.FC<ExpenseModalProps> = ({ show, handleClose, addExpense, groupMembers, paidBy }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [payer, setPayer] = useState(paidBy);

  useEffect(() => {
    if (show) {
      setPayer(paidBy); // Inicializa el pagador al abrir el modal
      console.log("PAYER IS: ", paidBy);
      console.log("Members are: ", groupMembers);
      setSelectedMembers(groupMembers.filter(member => member !== paidBy)); // Excluye al pagador
  
    }
  }, [show, groupMembers, paidBy]);

  // Maneja el cambio de pagador
  const handlePayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPayer = e.target.value;
    setPayer(newPayer);
    // Actualiza los miembros compartidos excluyendo al nuevo pagador
    setSelectedMembers(groupMembers.filter(member => member !== newPayer));
  };

  // Maneja la selección de miembros con quienes compartir
  const handleMemberSelect = (member: string) => {
    if (selectedMembers.includes(member)) {
      setSelectedMembers(selectedMembers.filter(m => m !== member));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  // Maneja cambios en el campo de descripción
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d+$/.test(value) || value === '') {
      setDescription(value);
    } else {
      alert('Description cannot be only numbers.');
    }
  };

  // Maneja cambios en el campo de cantidad
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };

  // Maneja la validación y el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!description || /^\d+$/.test(description)) {
      alert('Description cannot be empty or only numbers.');
      return;
    }

    if (!parsedAmount || parsedAmount <= 0 || selectedMembers.length === 0) {
      alert('Please fill in all fields with valid values.');
      return;
    }

    addExpense(parsedAmount, description, selectedMembers, payer); // Incluye el pagador en el gasto
    handleClose();
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-medium text-black-600">Add Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-lg font-medium text-gray-700">
              Description:
            </label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Enter description"
              className="text-lg p-3.5 h-12"
            />
          </div>
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-lg font-medium text-gray-700">
              Amount:
            </label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              className="text-lg p-3.5 h-12"
            />
          </div>
  
          {/* Paid By Dropdown */}
          <div>
            <label htmlFor="paidBy" className="block text-lg font-medium text-gray-700">
              Paid By:
            </label>
            <select
              id="paidBy"
              value={payer}
              onChange={handlePayerChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-3 h-12 truncate"
            >
              {groupMembers.map((member, index) => (
                <option key={index} value={member} className="text-base text-gray-700">
                  {ENSName({ address: member })} {/* Plain text output */}
                </option>
              ))}
            </select>
          </div>
  
          {/* Share With Buttons */}
          <div>
            <label htmlFor="shareWith" className="block text-lg font-medium text-gray-700">
              Share With:
            </label>
            <div className="mt-2 flex flex-wrap gap-4">
              {groupMembers
                .filter((member) => member !== payer) // Exclude the payer
                .map((member, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant={selectedMembers.includes(member) ? 'default' : 'outline'}
                    onClick={() => handleMemberSelect(member)}
                    className={`${
                      selectedMembers.includes(member) ? 'bg-green-500 text-white' : ''
                    } text-lg py-3 px-6`}
                  >
                    <ENSName address={member} />
                  </Button>
                ))}
            </div>
          </div>
  
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              !description ||
              /^\d+$/.test(description) ||
              parseFloat(amount) <= 0 ||
              selectedMembers.length === 0
            }
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-lg py-4 h-14 "
          >
            Add Expense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseModal;