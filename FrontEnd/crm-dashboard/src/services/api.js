const BASE = "https://crm-analitica-backend.onrender.com";

export async function loginUsuario(id) {
  const res = await fetch(`${BASE}/api/auth/login/${id}`);
  if (!res.ok) throw new Error("Usuario no encontrado");
  return res.json();
}

export async function getDashboardGerente(inicio = null, fin = null) {
  let url = `${BASE}/api/analitica/gerente`;
  if (inicio && fin) url += `?inicio=${inicio}&fin=${fin}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener datos del gerente");
  return res.json();
}

export async function getDashboardSupervisor(id, inicio = null, fin = null) {
  let url = `${BASE}/api/analitica/supervisor/${id}`;
  if (inicio && fin) url += `?inicio=${inicio}&fin=${fin}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener datos del supervisor");
  return res.json();
}

export async function getDashboardVendedor(id, inicio = null, fin = null) {
  let url = `${BASE}/api/analitica/vendedor/${id}`;
  if (inicio && fin) url += `?inicio=${inicio}&fin=${fin}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener datos del vendedor");
  return res.json();
}

export function getExportUrl(rol, id, inicio, fin) {
  return `${BASE}/api/analitica/exportar/${rol}/${id}?inicio=${inicio}&fin=${fin}`;
}
