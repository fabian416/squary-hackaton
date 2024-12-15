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
import GroupModal from '@/components/GroupModal/GroupModal';
import FriendsModal from '@/components/FriendsModal/FriendsModal';
import { useCreateGroup } from "@/hooks/useCreateGroup";

interface SidebarProps {
  currentUser: string | null;
}

export function AppSidebar({ currentUser }: SidebarProps) {
  const { groups, fetchGroups } = useUserGroups(); // Usa tu hook para obtener los grupos
  const createGroup = useCreateGroup();
  const { aliases } = useUser();

  useEffect(() => {
    fetchGroups(); // Carga los grupos cuando el componente se monta
  }, [fetchGroups]);


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
                  <GroupModal createGroup={createGroup} onGroupCreated={handleGroupCreated} />
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
                <FriendsModal currentUser={currentUser} />
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
        
      </SidebarContent>
    </Sidebar>
  )
}