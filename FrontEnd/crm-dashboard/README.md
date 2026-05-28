# CRM Analítica — Frontend

Dashboard analítico para el módulo CRM, construido con React + Vite + Recharts.

## Requisitos previos

- Node.js v18+
- Backend `ApiAnalitica.Web` corriendo en `http://localhost:59896`
- XAMPP con MySQL y la base de datos `crm_analitica_db`

## Instalación y ejecución

```bash
# 1. Entra a la carpeta del proyecto
cd crm-dashboard

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

Abre el navegador en: **http://localhost:3000**

## IDs de prueba para login

| ID | Nombre            | Rol        |
|----|-------------------|------------|
| 1  | Bernon Romero     | Gerente    |
| 2  | Natalia Sandoval  | Supervisor |
| 3  | Carlos Ruiz       | Supervisor |
| 6  | Claudio Rivera    | Vendedor   |
| 9  | Jorge Smith       | Vendedor   |

## Datos de prueba

Los datos de la BD están en **abril 2026**. Al entrar al dashboard
las fechas ya están pre-configuradas en `2026-04-01` a `2026-04-30`.

## Estructura

```
src/
├── pages/
│   ├── Login.jsx / Login.css
│   ├── DashboardGerente.jsx
│   ├── DashboardSupervisor.jsx
│   ├── DashboardVendedor.jsx
│   └── Dashboard.css          ← estilos compartidos
├── components/
│   └── index.jsx              ← KPICard, FiltroFechas, Tabla, Navbar...
├── services/
│   └── api.js                 ← llamadas al backend
└── App.jsx                    ← router por rol
```
