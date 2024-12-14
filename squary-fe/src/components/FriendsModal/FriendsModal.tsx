import React, { useState } from 'react';
import styles from '../GroupOptions/SettleModal/SettleModal.module.css'; // Reuse styles
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface FriendsModalProps {
  show: boolean;
  handleClose: () => void;
  addFriend: (address: string, nickname: string) => void;
}

const FriendsModal: React.FC<FriendsModalProps> = ({ show, handleClose, addFriend }) => {
  const [nickname, setNickname] = useState('');
  const [address, setAddress] = useState('');

  const handleAddFriend = () => {
    if (!nickname || !address) {
      alert('Both nickname and address are required.');
      return;
    }

    // Validate Ethereum address (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim().toLowerCase())) {
      console.log(address);
      alert('Invalid Ethereum address.');
      return;
    }

    addFriend(address, nickname);
    setNickname('');
    setAddress('');
    handleClose();
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button className="w-full">Add</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
              <Label htmlFor="nickname"></Label>
              <Input
                id="nickname"
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter Nickname"
                className="my-4"
              />
              <Label htmlFor="address"></Label>
              <Input
                id="address"
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Ethereum address"
                className="my-4"
              />
              <Button onClick={handleAddFriend} className="w-full">
                Add Friend
              </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
};

export default FriendsModal;