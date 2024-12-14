import { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserProvider, useUser } from './utils/UserContext'; 
import { Toaster } from "react-hot-toast";
import Home from './views/Home/Home';
import Dashboard from './views/Dashboard/Dashboard';
import GeneralPanel from './views/GeneralPanel/GeneralPanel';
import GroupDetails from './views/GroupDetails/GroupDetails';
import FriendDetails from './views/FriendDetails/FriendDetails';
import { initializeAppKit } from './appiKitConfig';
import { SidebarTrigger, Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { useAccount } from 'wagmi';
import { AppSidebar } from './views/Sidebar/Sidebar';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: 'dashboard',
    element: <Dashboard />, // Pasar createGroup directamente aquí
    children: [
      { index: true, element: <GeneralPanel /> }, // La página inicial del dashboard
      { path: 'grupos/:groupId/:groupName', element: <GroupDetails /> }, // Detalles de un grupo específico con nombre
      { path: 'amigos/:friendId', element: <FriendDetails /> }, // Detalles de un amigo específico
    ],
  },
]);

function App() {
  const { isConnected } = useAccount();
  initializeAppKit();
  
  return (
      <UserProvider>
        <Toaster/>
        <RouterProvider router={router} />
        {isConnected &&
          <SidebarProvider>
            <Sidebar />
            <main>
              <SidebarTrigger />
              <AppSidebar />
            </main>
          </SidebarProvider>
        }
      </UserProvider>
  );
}

export default App;
