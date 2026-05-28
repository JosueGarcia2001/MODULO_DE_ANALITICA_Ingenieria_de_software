import { useState, useEffect } from "react";
import { getDashboardSupervisor, getExportUrl } from "../services/api";
import { KPICard, FiltroFechas, Navbar, LoadingState, ErrorState, Tabla } from "../components";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import "./Dashboard.css";

const fmt = (n) => `Q${Number(n || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
const pct = (n) => `${Number(n || 0).toFixed(1)}%`;

export default function DashboardSupervisor({ usuario, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inicio, setInicio] = useState("2026-04-01");
  const [fin, setFin] = useState("2026-04-30");

  const cargar = async (i, f) => {
    setLoading(true); setError("");
    try {
      const d = await getDashboardSupervisor(usuario.id, i, f);
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
    window.open(getExportUrl("Supervisor", usuario.id, inicio, fin));
  };

  const progreso = data ? Math.min((data.ventasGanadasEquipo / data.metaEquipo) * 100, 100) : 0;

  return (
    <div className="dash-layout">
      <Navbar usuario={usuario} onLogout={onLogout} />

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard de Supervisor</h1>
            <p className="dash-subtitle">{data?.mensajeInformativo || "Rendimiento de tu equipo"}</p>
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
                label="Ventas del Equipo"
                value={fmt(data.ventasGanadasEquipo)}
                sub={`Meta: ${fmt(data.metaEquipo)}`}
                color="#10b981"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
              />
              <KPICard
                label="Vendedor Estrella"
                value={data.vendedorEstrella}
                sub="Mejor rendimiento"
                color="#f59e0b"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
              />
              <KPICard
                label="Prospectos Nuevos"
                value={data.prospectosNuevos}
                sub="En el embudo del equipo"
                color="#0ea5e9"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              />
              <div className="kpi-card" style={{ "--accent": "#8b5cf6" }}>
                <div className="kpi-label">Progreso de Meta</div>
                <div className="kpi-value">{pct(progreso)}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progreso}%`, background: "#8b5cf6" }} />
                </div>
                <div className="kpi-sub">{fmt(data.ventasGanadasEquipo)} / {fmt(data.metaEquipo)}</div>
              </div>
            </div>

            {/* Ranking + Tendencia CSAT */}
            <div className="charts-grid-2">
              <div className="chart-card">
                <h3 className="chart-title">Ranking de Vendedores</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.rankingVendedores || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="vendedor" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      formatter={(v) => [fmt(v), "Monto"]}
                    />
                    <Bar dataKey="montoTotal" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">Tendencia CSAT (últimos meses)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.tendenciaCsat || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="etiqueta" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <YAxis domain={[0, 5]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      formatter={(v) => [Number(v).toFixed(2), "CSAT"]}
                    />
                    <Line type="monotone" dataKey="valor" stroke="#0ea5e9" strokeWidth={2.5} dot={{ fill: "#0ea5e9", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabla detalle de vendedores */}
            <div className="chart-card">
              <h3 className="chart-title">Detalle por Vendedor</h3>
              <Tabla
                columnas={[
                  { key: "vendedor", label: "Vendedor" },
                  { key: "cantidadVentas", label: "Ventas" },
                  { key: "montoTotal", label: "Monto Total", render: (v) => <span className="badge-green">{fmt(v)}</span> },
                  { key: "promedioCsat", label: "CSAT", render: (v) => <span className="badge-blue">{Number(v).toFixed(1)} ★</span> },
                  { key: "metaCumplidaPorcentaje", label: "Meta Cumplida", render: (v) => (
                    <div className="mini-progress">
                      <div className="mini-bar" style={{ width: `${Math.min(v, 100)}%` }} />
                      <span>{pct(v)}</span>
                    </div>
                  )},
                ]}
                datos={data.rankingVendedores || []}
              />
            </div>

            {/* Detalle de ventas filtradas */}
            <div className="chart-card">
              <h3 className="chart-title">Detalle de Ventas del Equipo</h3>
              <Tabla
                columnas={[
                  { key: "proyecto", label: "Proyecto" },
                  { key: "cliente", label: "Cliente" },
                  { key: "vendedor", label: "Vendedor" },
                  { key: "monto", label: "Monto", render: (v) => fmt(v) },
                  { key: "etapa", label: "Etapa", render: (v) => <span className={`badge-etapa ${v?.toLowerCase()}`}>{v}</span> },
                  { key: "csat", label: "CSAT", render: (v) => v > 0 ? `${v} ★` : "—" },
                  { key: "fechaVenta", label: "Fecha" },
                  { key: "diasInactivo", label: "Días Inactivo", render: (v) => (
                    <span className={v >= 5 ? "badge-red" : ""}>{v}d</span>
                  )},
                ]}
                datos={data.detalleVentasFiltradas || []}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
