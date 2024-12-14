import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Outlet, useNavigate } from "react-router-dom";
import { UserProvider, useUser } from "./utils/UserContext";
import { SidebarTrigger, Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { useAccount } from "wagmi";
import { AppSidebar } from "./views/Sidebar/Sidebar";

export const Layout = () => {
    const navigate = useNavigate();
    const { currentUser } = useUser(); // Usa el contexto para obtener el estado de conexión y el usuario actual
    const { isConnected } = useAccount();
  
    useEffect(() => {
      if (!isConnected) {
        navigate("/"); // Navega al login si no está conectado
      }
    }, [isConnected, navigate]);
  
    if (!isConnected) return null;
  
    return (
      <div className="flex h-screen">
      <SidebarProvider>
        <AppSidebar currentUser={currentUser} />
        <SidebarTrigger />
        <main className="flex-grow overflow-auto">
          <Outlet />

          <div className="absolute top-4 right-4 z-10">
            <appkit-button />
          </div>
        </main>
      </SidebarProvider>
      </div>);
};