import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import styles from './GroupModal.module.css';
import { useAccount } from 'wagmi'; 

interface GroupModalProps {
  show: boolean;
  handleClose: () => void;
  createGroup: (groupName: string, members: string[], tokenAddress: string, signatureThreshold: string) => Promise<void>;
  onGroupCreated: () => void;
}

const GroupModal: React.FC<GroupModalProps> = ({ show, handleClose, createGroup, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [membersInput, setMembersInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [tokenAddress, setTokenAddress] = useState('');
  const [signatureThreshold, setSignatureThreshold] = useState('');
  const { address } = useAccount();

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleAddMembers = () => {
    const newMembers = membersInput
      .split(',')
      .map(member => member.trim())
      .filter(member => isValidAddress(member));

    if (newMembers.length > 0) {
      setMembers([...members, ...newMembers]);
      setMembersInput('');
    } else {
      alert('Please enter valid Ethereum addresses.');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!groupName || !tokenAddress || !signatureThreshold || members.length === 0) {
      alert('Please fill in all fields and add at least one member.');
      return;
    }

    const allMembers = [address, ...members].filter(Boolean) as string[];
    await createGroup(groupName, allMembers, tokenAddress, signatureThreshold);
    onGroupCreated();
    handleModalClose();
  };

  const handleModalClose = () => {
    setGroupName('');
    setMembersInput('');
    setMembers([]);
    setTokenAddress('');
    setSignatureThreshold('');
    handleClose();
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSignatureThreshold(e.target.value);
  };

  useEffect(() => {
    if (Number(signatureThreshold) > members.length + 1) {
      setSignatureThreshold('');
    }
  }, [members, signatureThreshold]);

  return (
    <Modal
      isOpen={show}
      onRequestClose={handleModalClose}
      shouldCloseOnOverlayClick={false}
      className={styles.modal}
      overlayClassName={styles.modalOverlay}
    >
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Create a New Group</h2>
        <button className={styles.closeButton} onClick={handleModalClose}>×</button>
      </div>
      <form onSubmit={handleSubmit} className={styles.modalBody}>
        <div>
          <label>Group Name:</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
        <div>
          <label>Members:</label>
          <div className={styles.membersInputContainer}>
            <input
              type="text"
              value={membersInput}
              onChange={(e) => setMembersInput(e.target.value)}
              placeholder="Enter wallet addresses separated by commas"
            />
            <button type="button" className={styles.addButton} onClick={handleAddMembers}>+</button>
          </div>
          <ul className={styles.memberList}>
            {members.map((member, index) => (
              <li key={index}>{member}</li>
            ))}
          </ul>
        </div>
        <div>
          <label>Currency:</label>
          <select
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          >
            <option value="">Select a currency</option>
            <option value="0x87B6F2A7A9e371f93bBbE75926400699202B8a58">USDC</option>
            <option value="0xd0602be1b9c3ED0715Be5786AD34114D9Da737BD">USDT</option>
            <option value="0x6B175474E89094C44Da98b954EedeAC495271d0F">DAI</option>
          </select>
        </div>
        <div>
          <label>Signature Threshold:</label>
          <select
            value={signatureThreshold}
            onChange={handleThresholdChange}
          >
            <option value="">Select threshold</option>
            {Array.from({ length: members.length + 1 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
        <button type="submit" className={styles.createButton}>Create Group</button>
      </form>
    </Modal>
  );
};

export default GroupModal;
