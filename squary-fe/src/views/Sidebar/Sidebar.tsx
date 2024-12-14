import { Calendar, ChevronDown, Home, Inbox, Search, Settings } from "lucide-react"
import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible"
import { useUserGroups } from '../../hooks/useUserGroups'; // Importa tu hook
import { Link } from "react-router-dom";
 
 
export function AppSidebar() {
  const { groups, fetchGroups } = useUserGroups(); // Usa tu hook para obtener los grupos
  console.log(groups);

  useEffect(() => {
    fetchGroups(); // Carga los grupos cuando el componente se monta
  }, [fetchGroups]);

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
            {groups.map(group => (
               <CollapsibleContent>
                <SidebarGroupContent>
                  <Link to={`/dashboard/grupos/${group.id}/${group.name}`}>{group.name}</Link>
                </SidebarGroupContent>
             </CollapsibleContent>
          ))}
          </SidebarGroup>
        </Collapsible>

        {/* Collapsible for Friends */}
        <Collapsible className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Friends
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>asdasdd</SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  )
}