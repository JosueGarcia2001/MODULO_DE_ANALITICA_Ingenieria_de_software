import { useState } from "react";
import { loginUsuario } from "../services/api";
import "./Login.css";

export default function Login({ onLogin }) {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id || isNaN(id)) { setError("Ingresa un ID válido"); return; }
    setLoading(true);
    setError("");
    try {
      const user = await loginUsuario(id);
      onLogin(user);
    } catch {
      setError("Usuario no encontrado. Verifica el ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0ea5e9"/>
              <path d="M8 22 L16 10 L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="16" cy="10" r="2" fill="white"/>
            </svg>
          </div>
          <span className="login-logo-text">CRM <strong>Analítica</strong></span>
        </div>

        <h1 className="login-title">Bienvenido</h1>
        <p className="login-subtitle">Ingresa tu ID de usuario para continuar</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="userId">ID de Usuario</label>
            <input
              id="userId"
              type="number"
              placeholder="Ej: 1, 2, 6..."
              value={id}
              onChange={(e) => setId(e.target.value)}
              min="1"
              autoFocus
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="login-spinner" /> : "Ingresar al sistema"}
          </button>
        </form>

        <div className="login-hints">
          <p>IDs de prueba disponibles:</p>
          <div className="login-chips">
            <span onClick={() => setId("1")}>1 — Gerente</span>
            <span onClick={() => setId("2")}>2 — Supervisor</span>
            <span onClick={() => setId("6")}>6 — Vendedor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
