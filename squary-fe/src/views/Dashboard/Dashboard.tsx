import { useEffect } from "react";
import Sidebar from "../../components/SideBar/SideBar";
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../../utils/UserContext"; 
import { useCreateGroup } from "../../hooks/useCreateGroup";
import styles from '../Home/Home.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isConnected, currentUser } = useUser(); // Usa el contexto para obtener el estado de conexión y el usuario actual
  const createGroup = useCreateGroup(); // Hook para manejar la creación de grupos

  useEffect(() => {
    if (!isConnected) {
      navigate("/"); // Navega al login si no está conectado
    }
  }, [isConnected, navigate]);

  return ( 
  <div>
 
    <div className="flex h-screen w-screen bg-[#F3D9B1]">
    {/* Sidebar */}
   
    {/* Main Content */}
    <div className="flex flex-col flex-grow overflow-auto">
      {/* Top Bar */}
      <div className="flex justify-end p-4">
      <appkit-button />
      </div>
    </div>
  </div></div>
  );
};

export default Dashboard;