# Módulo de Analítica CRM
### Universidad Mariano Galvez de Guatemala — Ingeniería de Software 2026

Sistema de dashboard analítico con KPIs comerciales, alertas de anomalías
y vistas diferenciadas por rol de usuario.

## Autores
- Josué Fernando García Reyes
- Bernon Isaac Romero Leonardo

## Estructura del Repositorio
| Carpeta | Contenido |
|---------|-----------|
| Backend/ | ASP.NET Core 8 + Dapper + MySQL |
| FrontEnd/ | React 18 + Vite + Recharts |

## Tecnologías
| Capa | Tecnología |
|------|-----------|
| Backend | ASP.NET Core 8, Dapper, MySqlConnector |
| Frontend | React 18, Vite, Recharts, Axios |
| Base de datos | MySQL 8 (XAMPP) |
| Documentación API | Swagger / OpenAPI |
| Integración externa | X-API-Token (HU-07) |

## Historias de Usuario Implementadas
| ID | Historia | Estado |
|----|----------|--------|
| HU-01 | Motor de Cálculo de Ventas y Embudo | ✅ |
| HU-02 | Reporte de Rendimiento Comercial y CSAT | ✅ |
| HU-03 | Filtros de Segmentación Temporal | ✅ |
| HU-04 | Motor de Alertas de Anomalías | ✅ |
| HU-05 | Dashboard Personalizado por Roles | ✅ |
| HU-07 | Integración con Módulo CRM Externo | ✅ |

## Ejecución local
### Backend
```bash
cd Backend
dotnet run
```
### Frontend
```bash
cd FrontEnd/crm-dashboard
npm install
npm run dev
```
