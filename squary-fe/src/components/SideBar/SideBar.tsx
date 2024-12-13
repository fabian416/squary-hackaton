import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './SideBar.module.css';
import GroupModal from '../GroupModal/GroupModal';
import FriendsModal from '../FriendsModal/FriendsModal';
import { useUserGroups } from '../../hooks/useUserGroups'; // Importa tu hook
import { doc, setDoc } from 'firebase/firestore';
import { firestore,  } from '../../firebaseConfig';

interface SidebarProps {
  createGroup: (groupName: string, members: string[], tokenAddress: string, signatureThreshold: string) => Promise<void>;
  currentUser: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ createGroup, currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { groups, fetchGroups } = useUserGroups(); // Usa tu hook para obtener los grupos
  const [showFriendsModal, setShowFriendsModal] = useState(false); // New state for Friends modal

  const handleOpenFriendsModal = () => setShowFriendsModal(true);
  const handleCloseFriendsModal = () => setShowFriendsModal(false);
  const handleAddFriend = async (address: string, nickname: string) => {
    if (!currentUser) {
      console.error("currentUser is null. Cannot add friend.");
      return;
    }
  
    try {
      const userRef = doc(firestore, 'friends', currentUser); // currentUser es seguro aquí
      await setDoc(userRef, { [address]: { nickname } }, { merge: true });
      alert('Friend added successfully!');
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };


  useEffect(() => {
    fetchGroups(); // Carga los grupos cuando el componente se monta
  }, [fetchGroups]);

  const handlePanelClick = () => {
    navigate('/dashboard');
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleGroupCreated = () => {
    fetchGroups(); // Actualiza la lista de grupos cuando se crea un nuevo grupo
  };

  return (
    <div className={styles.sidebar}>
      <h1 className={styles.logo}>Squary</h1>
      <div className={styles.section}>
        <div className={`${styles.sectionTitle} ${styles.sectionTitleButton}`} onClick={handlePanelClick}>Dashboard</div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Groups</div>
        <div className={styles.subSection} onClick={handleOpenModal}>+</div>
        <ul>
          {groups.map(group => (
            <li key={group.id}>
              <Link to={`/dashboard/grupos/${group.id}/${group.name}`}>{group.name}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Friends</div>
        <div className={styles.subSection} onClick={handleOpenFriendsModal}>+</div>
      </div>
      <GroupModal show={showModal} handleClose={handleCloseModal} createGroup={createGroup} onGroupCreated={handleGroupCreated} />
      <FriendsModal
        show={showFriendsModal}
        handleClose={handleCloseFriendsModal}
        addFriend={handleAddFriend}
      />
    </div>
  );
};

export default Sidebar;
