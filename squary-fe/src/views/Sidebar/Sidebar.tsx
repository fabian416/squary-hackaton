import { Calendar, ChevronDown, Home, Inbox, MoreHorizontal, Search, Settings } from "lucide-react"
import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible"
import { useUserGroups } from '../../hooks/useUserGroups'; // Importa tu hook
import { Link } from "react-router-dom";
import { useUser } from "@/utils/UserContext";
import { Button } from "@/components/ui/button";
import GroupModal from '@/components/GroupModal/GroupModal';
import FriendsModal from '@/components/FriendsModal/FriendsModal';
import { doc, setDoc } from 'firebase/firestore';
import { firestore,  } from '../../firebaseConfig';
import { useCreateGroup } from "@/hooks/useCreateGroup";

interface SidebarProps {
  currentUser: string | null;
}

export function AppSidebar({ currentUser }: SidebarProps) {
  const [showModal, setShowModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false); // New state for Friends modal
  const { groups, fetchGroups } = useUserGroups(); // Usa tu hook para obtener los grupos
  const createGroup = useCreateGroup();
  const { aliases } = useUser();

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
    <Sidebar>
      <SidebarContent>
        {/* Collapsible for Groups */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Groups
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>


            <CollapsibleContent>
                <SidebarGroupContent>
                <Button className="w-full mt-1 mb-1" onClick={handleOpenModal}>Add</Button>
                </SidebarGroupContent>
             </CollapsibleContent>

            {groups.map(group => (
               <CollapsibleContent key={group.id}>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <Link to={`/dashboard/grupos/${group.id}/${group.name}`}>{group.name}</Link>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
             </CollapsibleContent>
          ))}
          </SidebarGroup>
        </Collapsible>

        {/* Collapsible for Friends */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Friends
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>


            <CollapsibleContent>
                <SidebarGroupContent className="w-full">
                <FriendsModal
                  show={showFriendsModal}
                  handleClose={handleCloseFriendsModal}
                  addFriend={handleAddFriend}
                />
                </SidebarGroupContent>
             </CollapsibleContent>

            {aliases &&
              Object.entries(aliases).map(([key, value]: [string, any]) => (
                <CollapsibleContent key={key}>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>{value}</SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              ))}
          </SidebarGroup>
        </Collapsible>
        <GroupModal show={showModal} handleClose={handleCloseModal} createGroup={createGroup} onGroupCreated={handleGroupCreated} />
        
      </SidebarContent>
    </Sidebar>
  )
}