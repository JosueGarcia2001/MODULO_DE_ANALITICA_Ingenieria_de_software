import { useState, useEffect } from "react";
import Login from "./pages/Login";
import DashboardGerente from "./pages/DashboardGerente";
import DashboardSupervisor from "./pages/DashboardSupervisor";
import DashboardVendedor from "./pages/DashboardVendedor";
import "./App.css";

export default function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("crm_usuario");
    if (stored) setUsuario(JSON.parse(stored));
  }, []);

  const handleLogin = (user) => {
    sessionStorage.setItem("crm_usuario", JSON.stringify(user));
    setUsuario(user);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("crm_usuario");
    setUsuario(null);
  };

  if (!usuario) return <Login onLogin={handleLogin} />;

  const rol = usuario.rol;

  return (
    <div className="app-wrapper">
      {rol === "Gerente" && <DashboardGerente usuario={usuario} onLogout={handleLogout} />}
      {rol === "Supervisor" && <DashboardSupervisor usuario={usuario} onLogout={handleLogout} />}
      {rol === "Vendedor" && <DashboardVendedor usuario={usuario} onLogout={handleLogout} />}
      {rol !== "Gerente" && rol !== "Supervisor" && rol !== "Vendedor" && (
        <div className="error-rol">
          <p>Rol no reconocido: <strong>{rol}</strong></p>
          <button onClick={handleLogout}>Volver</button>
        </div>
      )}
    </div>
  );
}
