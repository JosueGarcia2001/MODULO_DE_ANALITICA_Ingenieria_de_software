import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const API_BASE = "https://crm-gestion.onrender.com";
const API_TOKEN = "LQzDhjapi5IdwnkSuoa6xLl8Yile6YegcOZnU_77_DYSsoM0qzyCE_44lJjIZyEo";

const headers = {
  "X-API-Token": API_TOKEN,
  "Content-Type": "application/json"
};

const COLORES = ["#2E75B6", "#1D9E75", "#BA7517", "#993C1D", "#534AB7"];

export default function ModuloExterno() {
  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabActiva, setTabActiva] = useState("resumen");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [resClientes, resProv, resEmp] = await Promise.all([
          fetch(`${API_BASE}/api/pub/clientes`, { headers }),
          fetch(`${API_BASE}/api/pub/proveedores`, { headers }),
          fetch(`${API_BASE}/api/pub/empleados`, { headers })
        ]);

        const dataClientes = await resClientes.json();
        const dataProv = await resProv.json();
        const dataEmp = await resEmp.json();

        setClientes(dataClientes.clientes || []);
        setProveedores(dataProv.proveedores || []);
        setEmpleados(dataEmp.empleados || []);
      } catch (err) {
        setError("No se pudo conectar con el módulo externo.");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // ── Datos para gráficas ──────────────────────────────────────
  const clientesPorTipo = clientes.reduce((acc, c) => {
    const tipo = c.tipo || "Sin tipo";
    const existe = acc.find(x => x.name === tipo);
    if (existe) existe.value++;
    else acc.push({ name: tipo, value: 1 });
    return acc;
  }, []);

  const empleadosPorCargo = empleados.reduce((acc, e) => {
    const cargo = e.cargo || "Sin cargo";
    const existe = acc.find(x => x.cargo === cargo);
    if (existe) existe.total++;
    else acc.push({ cargo, total: 1 });
    return acc;
  }, []);

  const clientesActivos = clientes.filter(c => c.estado === "Activo").length;
  const empleadosActivos = empleados.filter(e => e.estado === "Activo").length;
  const proveedoresActivos = proveedores.filter(p => p.estado === "Activo").length;

  // ── Render ───────────────────────────────────────────────────
  if (loading) return (
    <div style={estilos.contenedor}>
      <div style={estilos.loading}>
        <div style={estilos.spinner}></div>
        <p style={{ color: "#94a3b8", marginTop: 12 }}>
          Conectando con módulo externo...
        </p>
      </div>
    </div>
  );

  if (error) return (
    <div style={estilos.contenedor}>
      <div style={estilos.errorBox}>
        <span style={{ fontSize: 24 }}>⚠️</span>
        <p style={{ color: "#f87171", margin: "8px 0 0" }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={estilos.contenedor}>

      {/* ── Header ── */}
      <div style={estilos.header}>
        <div>
          <h2 style={estilos.titulo}>🔗 Prueba de Integración de Módulos</h2>
          <p style={estilos.subtitulo}>
            Datos consumidos en tiempo real desde el módulo CRM Base del equipo externo
          </p>
        </div>
        <div style={estilos.badgeConectado}>● Conectado</div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={estilos.kpiGrid}>
        <div style={estilos.kpiCard}>
          <p style={estilos.kpiLabel}>Clientes activos</p>
          <p style={estilos.kpiValor}>{clientesActivos}</p>
          <p style={estilos.kpiFuente}>api/pub/clientes</p>
        </div>
        <div style={estilos.kpiCard}>
          <p style={estilos.kpiLabel}>Empleados activos</p>
          <p style={estilos.kpiValor}>{empleadosActivos}</p>
          <p style={estilos.kpiFuente}>api/pub/empleados</p>
        </div>
        <div style={estilos.kpiCard}>
          <p style={estilos.kpiLabel}>Proveedores activos</p>
          <p style={estilos.kpiValor}>{proveedoresActivos}</p>
          <p style={estilos.kpiFuente}>api/pub/proveedores</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={estilos.tabs}>
        {["resumen", "clientes", "empleados", "proveedores"].map(tab => (
          <button
            key={tab}
            onClick={() => setTabActiva(tab)}
            style={tabActiva === tab ? estilos.tabActivo : estilos.tab}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Tab: Resumen (gráficas) ── */}
      {tabActiva === "resumen" && (
        <div style={estilos.graficasGrid}>

          <div style={estilos.graficaCard}>
            <h3 style={estilos.graficaTitulo}>Clientes por tipo</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={clientesPorTipo}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {clientesPorTipo.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={estilos.graficaCard}>
            <h3 style={estilos.graficaTitulo}>Empleados por cargo</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={empleadosPorCargo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="cargo" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155" }}
                />
                <Bar dataKey="total" fill="#2E75B6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

      {/* ── Tab: Clientes ── */}
      {tabActiva === "clientes" && (
        <div style={estilos.tablaContenedor}>
          <table style={estilos.tabla}>
            <thead>
              <tr>
                {["ID", "Nombre / Razón Social", "Tipo", "Correo", "Estado"].map(h => (
                  <th key={h} style={estilos.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientes.map((c, i) => (
                <tr key={c.id_cliente} style={i % 2 === 0 ? estilos.trPar : estilos.trImpar}>
                  <td style={estilos.td}>{c.id_cliente}</td>
                  <td style={estilos.td}>{c.nombre_razon_social}</td>
                  <td style={estilos.td}>{c.tipo}</td>
                  <td style={estilos.td}>{c.correo}</td>
                  <td style={estilos.td}>
                    <span style={c.estado === "Activo" ? estilos.badgeActivo : estilos.badgeInactivo}>
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: Empleados ── */}
      {tabActiva === "empleados" && (
        <div style={estilos.tablaContenedor}>
          <table style={estilos.tabla}>
            <thead>
              <tr>
                {["N° Empleado", "Nombre", "Cargo", "Correo", "Teléfono", "Estado"].map(h => (
                  <th key={h} style={estilos.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleados.map((e, i) => (
                <tr key={e.id_empleado} style={i % 2 === 0 ? estilos.trPar : estilos.trImpar}>
                  <td style={estilos.td}>{e.numero_empleado}</td>
                  <td style={estilos.td}>{e.nombre_completo}</td>
                  <td style={estilos.td}>{e.cargo}</td>
                  <td style={estilos.td}>{e.correo}</td>
                  <td style={estilos.td}>{e.telefono}</td>
                  <td style={estilos.td}>
                    <span style={e.estado === "Activo" ? estilos.badgeActivo : estilos.badgeInactivo}>
                      {e.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: Proveedores ── */}
      {tabActiva === "proveedores" && (
        <div style={estilos.tablaContenedor}>
          <table style={estilos.tabla}>
            <thead>
              <tr>
                {["ID", "Empresa", "NIT", "Correo", "Teléfono", "Estado"].map(h => (
                  <th key={h} style={estilos.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p, i) => (
                <tr key={p.id_proveedor} style={i % 2 === 0 ? estilos.trPar : estilos.trImpar}>
                  <td style={estilos.td}>{p.id_proveedor}</td>
                  <td style={estilos.td}>{p.nombre_empresa}</td>
                  <td style={estilos.td}>{p.nit}</td>
                  <td style={estilos.td}>{p.correo}</td>
                  <td style={estilos.td}>{p.telefono}</td>
                  <td style={estilos.td}>
                    <span style={p.estado === "Activo" ? estilos.badgeActivo : estilos.badgeInactivo}>
                      {p.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────────
const estilos = {
  contenedor: { padding: "24px", color: "#e2e8f0" },
  loading: { textAlign: "center", padding: "60px 0" },
  spinner: {
    width: 40, height: 40, border: "3px solid #334155",
    borderTop: "3px solid #2E75B6", borderRadius: "50%",
    animation: "spin 1s linear infinite", margin: "0 auto"
  },
  errorBox: {
    background: "#1e293b", border: "1px solid #991b1b",
    borderRadius: 8, padding: 24, textAlign: "center"
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 24
  },
  titulo: { fontSize: 22, fontWeight: 600, margin: 0, color: "#f1f5f9" },
  subtitulo: { fontSize: 13, color: "#64748b", marginTop: 4 },
  badgeConectado: {
    background: "#064e3b", color: "#34d399",
    padding: "4px 12px", borderRadius: 20, fontSize: 13
  },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 },
  kpiCard: {
    background: "#1e293b", border: "1px solid #334155",
    borderRadius: 10, padding: "16px 20px"
  },
  kpiLabel: { fontSize: 12, color: "#64748b", margin: 0 },
  kpiValor: { fontSize: 32, fontWeight: 700, color: "#2E75B6", margin: "4px 0" },
  kpiFuente: { fontSize: 11, color: "#475569", margin: 0 },
  tabs: { display: "flex", gap: 8, marginBottom: 20 },
  tab: {
    padding: "8px 18px", borderRadius: 6, border: "1px solid #334155",
    background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13
  },
  tabActivo: {
    padding: "8px 18px", borderRadius: 6, border: "1px solid #2E75B6",
    background: "#1e3a5f", color: "#93c5fd", cursor: "pointer", fontSize: 13
  },
  graficasGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  graficaCard: {
    background: "#1e293b", border: "1px solid #334155",
    borderRadius: 10, padding: 20
  },
  graficaTitulo: { fontSize: 14, color: "#94a3b8", marginTop: 0, marginBottom: 16 },
  tablaContenedor: { overflowX: "auto" },
  tabla: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    background: "#1e3a5f", color: "#93c5fd", padding: "10px 14px",
    textAlign: "left", fontWeight: 500
  },
  td: { padding: "10px 14px", color: "#cbd5e1" },
  trPar: { background: "#1e293b" },
  trImpar: { background: "#0f172a" },
  badgeActivo: {
    background: "#064e3b", color: "#34d399",
    padding: "2px 10px", borderRadius: 20, fontSize: 12
  },
  badgeInactivo: {
    background: "#451a03", color: "#fb923c",
    padding: "2px 10px", borderRadius: 20, fontSize: 12
  }
};