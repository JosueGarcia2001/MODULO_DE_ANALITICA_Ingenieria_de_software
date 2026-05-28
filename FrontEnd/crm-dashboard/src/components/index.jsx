// ─── KPI Card ───────────────────────────────────────────────
export function KPICard({ label, value, sub, color = "#0ea5e9", icon }) {
  return (
    <div className="kpi-card" style={{ "--accent": color }}>
      {icon && <div className="kpi-icon">{icon}</div>}
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

// ─── Filtro de Fechas ────────────────────────────────────────
export function FiltroFechas({ inicio, fin, onChange, onAplicar, onExportar, showExport = false, exportDisabled = false }) {
  return (
    <div className="filtro-bar">
      <div className="filtro-group">
        <label>Desde</label>
        <input
          type="date"
          value={inicio}
          onChange={(e) => onChange("inicio", e.target.value)}
        />
      </div>
      <div className="filtro-group">
        <label>Hasta</label>
        <input
          type="date"
          value={fin}
          onChange={(e) => onChange("fin", e.target.value)}
        />
      </div>
      <button className="btn-aplicar" onClick={onAplicar}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Aplicar
      </button>
      {showExport && (
        <button className="btn-exportar" onClick={onExportar} disabled={exportDisabled}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar CSV
        </button>
      )}
    </div>
  );
}

// ─── Alerta de Caída ─────────────────────────────────────────
export function AlertaBanner({ porcentaje }) {
  return (
    <div className="alerta-banner">
      <div className="alerta-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <div>
        <strong>⚠️ Alerta de Caída de Ventas</strong>
        <p>Las ventas cayeron un <strong>{Math.abs(porcentaje).toFixed(1)}%</strong> respecto al periodo anterior. Se requiere acción inmediata.</p>
      </div>
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────
export function Navbar({ usuario, onLogout }) {
  const rolColors = { Gerente: "#f59e0b", Supervisor: "#8b5cf6", Vendedor: "#10b981" };
  const color = rolColors[usuario.rol] || "#0ea5e9";

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#0ea5e9"/>
            <path d="M8 22 L16 10 L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="16" cy="10" r="2" fill="white"/>
          </svg>
        </div>
        <span>CRM <strong>Analítica</strong></span>
      </div>
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar" style={{ background: color }}>
            {usuario.nombre?.charAt(0)}
          </div>
          <div>
            <div className="navbar-name">{usuario.nombre}</div>
            <div className="navbar-rol" style={{ color }}>{usuario.rol}</div>
          </div>
        </div>
        <button className="navbar-logout" onClick={onLogout} title="Cerrar sesión">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  );
}

// ─── Loading / Error ─────────────────────────────────────────
export function LoadingState() {
  return (
    <div className="state-center">
      <div className="loading-ring" />
      <p>Cargando datos...</p>
    </div>
  );
}

export function ErrorState({ mensaje, onRetry }) {
  return (
    <div className="state-center">
      <div className="error-icon">✕</div>
      <p>{mensaje}</p>
      {onRetry && <button className="btn-aplicar" onClick={onRetry}>Reintentar</button>}
    </div>
  );
}

// ─── Tabla Genérica ──────────────────────────────────────────
export function Tabla({ columnas, datos, emptyMsg = "Sin datos para mostrar" }) {
  return (
    <div className="tabla-wrapper">
      <table className="tabla">
        <thead>
          <tr>{columnas.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {datos.length === 0
            ? <tr><td colSpan={columnas.length} className="tabla-empty">{emptyMsg}</td></tr>
            : datos.map((row, i) => (
              <tr key={i}>
                {columnas.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
