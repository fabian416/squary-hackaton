import React, { useState } from 'react';
import Modal from 'react-modal';
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
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
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
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Nickname:</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter nickname"
                  className="m-3 text-black"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Ethereum Address:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter Ethereum address"
                  className="m-3 text-black"
                />
              </div>
              <div className="m-3"></div>
              <Button onClick={handleAddFriend}>
                Add Friend
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
};

export default FriendsModal;