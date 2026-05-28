import { useState, useEffect } from "react";
import { getDashboardGerente, getExportUrl } from "../services/api";
import { KPICard, FiltroFechas, AlertaBanner, Navbar, LoadingState, ErrorState, Tabla } from "../components";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import "./Dashboard.css";

const fmt = (n) => `Q${Number(n || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
const COLORS = ["#0ea5e9", "#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function DashboardGerente({ usuario, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inicio, setInicio] = useState("2026-04-01");
  const [fin, setFin] = useState("2026-04-30");

  const cargar = async (i, f) => {
    setLoading(true); setError("");
    try {
      const d = await getDashboardGerente(i, f);
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
    if (!inicio || !fin) { alert("Selecciona fechas para exportar"); return; }
    window.open(getExportUrl("Gerente", 0, inicio, fin));
  };

  return (
    <div className="dash-layout">
      <Navbar usuario={usuario} onLogout={onLogout} />

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard Gerencial</h1>
            <p className="dash-subtitle">{data?.mensajeInformativo || "Vista global del negocio"}</p>
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
            {data.alertaCaidaVentas && <AlertaBanner porcentaje={data.porcentajeCrecimiento} />}

            {/* KPIs */}
            <div className="kpi-grid">
              <KPICard
                label="Ventas Ganadas"
                value={fmt(data.ventasGanadasGlobales)}
                sub={`Meta: ${fmt(data.metaGlobal)}`}
                color="#10b981"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
              />
              <KPICard
                label="CSAT Global"
                value={`${Number(data.csatGlobal || 0).toFixed(1)} / 5`}
                sub="Satisfacción promedio"
                color="#6366f1"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
              />
              <KPICard
                label="Crecimiento"
                value={`${data.porcentajeCrecimiento > 0 ? "+" : ""}${Number(data.porcentajeCrecimiento || 0).toFixed(1)}%`}
                sub="vs periodo anterior"
                color={data.porcentajeCrecimiento >= 0 ? "#10b981" : "#ef4444"}
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
              />
              <KPICard
                label="Prospectos Nuevos"
                value={data.prospectosNuevos}
                sub="En el embudo"
                color="#f59e0b"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              />
            </div>

            {/* Gráficas fila 1 */}
            <div className="charts-grid-2">
              {/* Embudo */}
              <div className="chart-card">
                <h3 className="chart-title">Embudo de Ventas</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.embudoVentas || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                    <YAxis dataKey="etiqueta" type="category" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} width={90} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      labelStyle={{ color: "#fff" }}
                      formatter={(v, n, p) => [`${v} (${p.payload.porcentaje}%)`, "Cantidad"]}
                    />
                    <Bar dataKey="cantidad" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Ventas por canal */}
              <div className="chart-card">
                <h3 className="chart-title">Ventas por Canal / Campaña</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data.ventasPorCanal || []} dataKey="valor" nameKey="etiqueta" cx="50%" cy="50%" outerRadius={90} label={({ etiqueta, percent }) => `${etiqueta} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {(data.ventasPorCanal || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      formatter={(v) => [fmt(v), "Monto"]}
                    />
                    <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Desempeño por supervisor */}
            <div className="chart-card">
              <h3 className="chart-title">Desempeño por Supervisor</h3>
              <Tabla
                columnas={[
                  { key: "supervisor", label: "Supervisor" },
                  { key: "ventasGanadas", label: "Ventas Ganadas", render: (v) => <span className="badge-green">{fmt(v)}</span> },
                  { key: "csatPromedio", label: "CSAT Prom.", render: (v) => <span className="badge-blue">{Number(v).toFixed(1)} ★</span> },
                  { key: "mejorCampana", label: "Mejor Campaña", render: (v) => <span className="badge-purple">{v}</span> },
                ]}
                datos={data.desempenoPorSupervisor || []}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
