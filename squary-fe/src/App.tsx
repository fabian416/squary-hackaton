import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserProvider } from "./utils/UserContext";
import { Toaster } from "react-hot-toast";
import Home from "./views/Home/Home";
import Dashboard from "./views/Dashboard/Dashboard";
import GroupDetails from "./views/GroupDetails/GroupDetails";
import FriendDetails from "./views/FriendDetails/FriendDetails";
import { initializeAppKit } from "./appiKitConfig";
import { Layout } from "./layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "dashboard",
    element: <Layout />, // Renderiza el Layout aquí
    children: [
      { index: true, element: <Dashboard /> }, // Página inicial del dashboard
      { path: "grupos/:groupId/:groupName", element: <GroupDetails /> }, // Detalles de un grupo específico con nombre
      { path: "amigos/:friendId", element: <FriendDetails /> }, // Detalles de un amigo específico
    ],
  },
]);

function App() {
  initializeAppKit();

  return (
    <UserProvider>
      <Toaster />
      <RouterProvider router={router} />
    </UserProvider>
  );
}

export default App;
