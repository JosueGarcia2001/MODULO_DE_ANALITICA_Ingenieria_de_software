import { useState, useEffect } from "react";
import { getDashboardVendedor, getExportUrl } from "../services/api";
import { KPICard, FiltroFechas, Navbar, LoadingState, ErrorState, Tabla } from "../components";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "./Dashboard.css";

const fmt = (n) => `Q${Number(n || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
const COLORS = ["#10b981", "#f59e0b", "#0ea5e9", "#6366f1", "#ef4444"];

export default function DashboardVendedor({ usuario, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inicio, setInicio] = useState("2026-04-01");
  const [fin, setFin] = useState("2026-04-30");

  const cargar = async (i, f) => {
    setLoading(true); setError("");
    try {
      const d = await getDashboardVendedor(usuario.id, i, f);
      setData(d);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(inicio, fin); }, []);

  const handleFechaChange = (campo, val) => {
    if (campo === "inicio") setInicio(val);
    else setFin(val);
  };

  const handleExportar = () => {
    if (!inicio || !fin) { alert("Selecciona ambas fechas para exportar"); return; }
    window.open(getExportUrl("Vendedor", usuario.id, inicio, fin));
  };

  const progreso = data ? Math.min(Number(data.porcentajeProgreso || 0), 100) : 0;

  return (
    <div className="dash-layout">
      <Navbar usuario={usuario} onLogout={onLogout} />

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Mi Dashboard</h1>
            <p className="dash-subtitle">{data?.mensajeInformativo || "Tu rendimiento personal"}</p>
          </div>
          <FiltroFechas
            inicio={inicio} fin={fin}
            onChange={handleFechaChange}
            onAplicar={() => cargar(inicio, fin)}
            onExportar={handleExportar}
            showExport={true}
          />
        </div>

        {loading && <LoadingState />}
        {error && <ErrorState mensaje={error} onRetry={() => cargar(inicio, fin)} />}

        {!loading && !error && data && (
          <>
            {/* KPIs */}
            <div className="kpi-grid">
              <KPICard
                label="Mis Ventas Ganadas"
                value={fmt(data.misVentasGanadas)}
                sub={`Meta: ${fmt(data.metaPersonal)}`}
                color="#10b981"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
              />
              <KPICard
                label="Mi CSAT"
                value={`${Number(data.miCsat || 0).toFixed(1)} / 5`}
                sub="Satisfacción de clientes"
                color="#6366f1"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>}
              />
              <KPICard
                label="Falta para Meta"
                value={fmt(data.faltaParaMeta)}
                sub={data.faltaParaMeta <= 0 ? "🎉 ¡Meta alcanzada!" : "Sigue adelante"}
                color={data.faltaParaMeta <= 0 ? "#10b981" : "#f59e0b"}
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              />
              <div className="kpi-card" style={{ "--accent": "#0ea5e9" }}>
                <div className="kpi-label">Progreso de Meta</div>
                <div className="kpi-value">{Number(data.porcentajeProgreso || 0).toFixed(1)}%</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progreso}%`, background: "#0ea5e9" }} />
                </div>
                <div className="kpi-sub">{data.prospectosNuevos} prospectos nuevos</div>
              </div>
            </div>

            <div className="charts-grid-2">
              {/* Mi embudo */}
              <div className="chart-card">
                <h3 className="chart-title">Mi Embudo de Ventas</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data.miEmbudoVentas || []} dataKey="valor" nameKey="etiqueta" cx="50%" cy="50%" outerRadius={90} label={({ etiqueta, valor }) => `${etiqueta}: ${valor}`}>
                      {(data.miEmbudoVentas || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                    <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Tareas prioritarias */}
              <div className="chart-card">
                <h3 className="chart-title">Tareas Prioritarias</h3>
                {(data.tareasPrioritarias || []).length === 0
                  ? <div className="empty-tasks">
                      <span>✅</span>
                      <p>Sin tareas urgentes pendientes</p>
                    </div>
                  : <div className="tareas-list">
                      {data.tareasPrioritarias.map((t, i) => (
                        <div key={i} className="tarea-item">
                          <div className={`tarea-prioridad ${t.prioridad?.toLowerCase()}`}>{t.prioridad}</div>
                          <div className="tarea-info">
                            <div className="tarea-titulo">{t.titulo}</div>
                            <div className="tarea-sub">{t.subtitulo}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                }
              </div>
            </div>

            {/* Mis negociaciones */}
            <div className="chart-card">
              <h3 className="chart-title">Mis Negociaciones y Ventas</h3>
              <Tabla
                columnas={[
                  { key: "proyecto", label: "Proyecto" },
                  { key: "cliente", label: "Cliente" },
                  { key: "monto", label: "Monto", render: (v) => fmt(v) },
                  { key: "etapa", label: "Etapa", render: (v) => <span className={`badge-etapa ${v?.toLowerCase()}`}>{v}</span> },
                  { key: "csat", label: "CSAT", render: (v) => v > 0 ? `${v} ★` : "—" },
                  { key: "origen", label: "Campaña" },
                  { key: "fechaVenta", label: "Fecha" },
                  { key: "fechaUltimoContacto", label: "Último Contacto" },
                  { key: "diasInactivo", label: "Inactivo", render: (v) => (
                    <span className={v >= 3 ? "badge-red" : ""}>{v}d</span>
                  )},
                ]}
                datos={data.misNegociacionesYVentas || []}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
