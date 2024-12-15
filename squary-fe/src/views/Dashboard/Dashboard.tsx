import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../utils/UserContext"; 

const Dashboard = () => {
  const navigate = useNavigate();
  const { isConnected } = useUser(); // Usa el contexto para obtener el estado de conexión y el usuario actual
 
  useEffect(() => {
    if (!isConnected) {
      navigate("/"); // Navega al login si no está conectado
    }
  }, [isConnected, navigate]);

  return ( 
  <div>
  </div>
  );
};

export default Dashboard;