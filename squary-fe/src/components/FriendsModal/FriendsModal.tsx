import React, { useState } from 'react';
import Modal from 'react-modal';
import styles from '../GroupOptions/SettleModal/SettleModal.module.css'; // Reuse styles

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
    <Modal
      isOpen={show}
      onRequestClose={handleClose}
      className={styles.modal}
      overlayClassName={styles.modalOverlay}
    >
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Add Friend</h2>
        <button className={styles.closeButton} onClick={handleClose}>×</button>
      </div>
      <div className={styles.modalBody}>
        <div className={styles.formGroup}>
          <label>Nickname:</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter nickname"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Ethereum Address:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Ethereum address"
          />
        </div>
        <button className={styles.proposeButton} onClick={handleAddFriend}>
          Add Friend
        </button>
      </div>
    </Modal>
  );
};

export default FriendsModal;