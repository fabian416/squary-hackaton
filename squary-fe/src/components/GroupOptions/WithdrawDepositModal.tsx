import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WithdrawDepositModalProps {
  show: boolean;
  handleClose: () => void;
  actionType: "Withdraw" | "Deposit";
  handleAction: (amount: number) => void;
}

const WithdrawDepositModal: React.FC<WithdrawDepositModalProps> = ({
  show,
  handleClose,
  actionType,
  handleAction,
}) => {
  const [amount, setAmount] = useState<string>("");

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive amount");
      return;
    }
    handleAction(parsedAmount);
    handleClose();
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-medium text-gray-800">{actionType} Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-lg font-medium text-gray-700">
              Enter the amount to {actionType.toLowerCase()}:
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (/^-/.test(value)) return; // Prevent typing negative numbers
                setAmount(value);
              }}
              className="text-lg p-3.5 h-12"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-lg py-3.5 h-14"
          >
            {actionType}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDepositModal;

