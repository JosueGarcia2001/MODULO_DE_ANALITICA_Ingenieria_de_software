using Dapper;
using ApiAnalitica.Core.Models;
using ApiAnalitica.Core.Interfaces;
using ApiAnalitica.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApiAnalitica.Infrastructure.Repositories
{
    public class AnaliticaRepository : IAnaliticaRepository
    {
        private readonly DapperContext _context;
        public AnaliticaRepository(DapperContext context) => _context = context;

        public async Task<DashboardGerenteResponse> GetGerenteData(DateTime inicio, DateTime fin)
        {
            using var connection = _context.CreateConnection();
            double diff = (fin - inicio).TotalDays;
            var param = new { inicio, fin, inicioAnt = inicio.AddDays(-diff - 1), finAnt = inicio.AddDays(-1) };

            var res = await connection.QueryFirstOrDefaultAsync<DashboardGerenteResponse>(@"
                SELECT 
                    COALESCE(SUM(CASE WHEN etapa = 'Ganado' THEN monto ELSE 0 END), 0) as VentasGanadasGlobales,
                    COALESCE(AVG(CASE WHEN etapa = 'Ganado' AND csat > 0 THEN csat ELSE NULL END), 0) as CsatGlobal,
                    (SELECT SUM(meta_mensual) FROM usuarios WHERE rol IN ('Supervisor', 'Vendedor')) as MetaGlobal,
                    COUNT(CASE WHEN etapa = 'Prospecto' THEN 1 END) as ProspectosNuevos
                FROM ventas WHERE fecha_venta BETWEEN @inicio AND @fin", param);

            if (res == null) res = new DashboardGerenteResponse();

            decimal vAnt = await connection.ExecuteScalarAsync<decimal>(@"SELECT COALESCE(SUM(monto), 0) FROM ventas WHERE etapa = 'Ganado' AND fecha_venta BETWEEN @inicioAnt AND @finAnt", param);
            res.PorcentajeCrecimiento = vAnt > 0 ? Math.Round(((res.VentasGanadasGlobales - vAnt) / vAnt) * 100, 2) : (res.VentasGanadasGlobales > 0 ? 100 : 0);
            res.AlertaCaidaVentas = res.PorcentajeCrecimiento <= -20;

            var emb = await connection.QueryAsync<EmbudoDatoDTO>(@"SELECT etapa as Etiqueta, COUNT(*) as Cantidad, ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM ventas WHERE fecha_venta BETWEEN @inicio AND @fin), 0), 2) as Porcentaje FROM ventas WHERE fecha_venta BETWEEN @inicio AND @fin GROUP BY etapa", param);
            res.EmbudoVentas = emb.ToList();

            var sups = await connection.QueryAsync<SupervisorDesempenoDTO>(@"SELECT sup.nombre as Supervisor, COALESCE(SUM(CASE WHEN v.etapa = 'Ganado' THEN v.monto ELSE 0 END), 0) as VentasGanadas, COALESCE(AVG(CASE WHEN v.etapa = 'Ganado' AND v.csat > 0 THEN v.csat ELSE NULL END), 0) as CsatPromedio, COALESCE((SELECT origen_campana FROM ventas v2 INNER JOIN usuarios u2 ON u2.id = v2.usuario_id WHERE u2.jefe_id = sup.id AND v2.etapa = 'Ganado' AND v2.fecha_venta BETWEEN @inicio AND @fin GROUP BY origen_campana ORDER BY COUNT(*) DESC LIMIT 1), 'N/A') as MejorCampana FROM usuarios sup LEFT JOIN usuarios vend ON vend.jefe_id = sup.id LEFT JOIN ventas v ON v.usuario_id = vend.id AND v.fecha_venta BETWEEN @inicio AND @fin WHERE sup.rol = 'Supervisor' GROUP BY sup.nombre", param);
            res.DesempenoPorSupervisor = sups.ToList();

            var can = await connection.QueryAsync<GraficoDatoDTO>(@"SELECT origen_campana as Etiqueta, SUM(monto) as Valor FROM ventas WHERE etapa = 'Ganado' AND fecha_venta BETWEEN @inicio AND @fin GROUP BY origen_campana", param);
            res.VentasPorCanal = can.ToList();

            return res;
        }

        public async Task<DashboardSupervisorResponse> GetSupervisorData(int supervisorId, DateTime inicio, DateTime fin)
        {
            using var connection = _context.CreateConnection();
            var param = new { supervisorId, inicio, fin };

            var res = await connection.QueryFirstOrDefaultAsync<DashboardSupervisorResponse>(@"
                SELECT 
                    COALESCE(SUM(CASE WHEN v.etapa = 'Ganado' THEN v.monto ELSE 0 END), 0) as VentasGanadasEquipo,
                    (SELECT SUM(meta_mensual) FROM usuarios WHERE jefe_id = @supervisorId) as MetaEquipo,
                    COUNT(CASE WHEN v.etapa = 'Prospecto' THEN 1 END) as ProspectosNuevos
                FROM ventas v INNER JOIN usuarios u ON v.usuario_id = u.id
                WHERE u.jefe_id = @supervisorId AND v.fecha_venta BETWEEN @inicio AND @fin", param);

            if (res == null) res = new DashboardSupervisorResponse();

            var rank = await connection.QueryAsync<VendedorRankingDTO>(@"SELECT u.nombre as Vendedor, COUNT(CASE WHEN v.etapa = 'Ganado' THEN 1 END) as CantidadVentas, COALESCE(SUM(CASE WHEN v.etapa = 'Ganado' THEN v.monto ELSE 0 END), 0) as MontoTotal, COALESCE(AVG(CASE WHEN v.etapa = 'Ganado' AND v.csat > 0 THEN v.csat ELSE NULL END), 0) as PromedioCsat, ROUND(COALESCE(SUM(CASE WHEN v.etapa = 'Ganado' THEN v.monto ELSE 0 END) / NULLIF(u.meta_mensual, 0) * 100, 0), 2) as MetaCumplidaPorcentaje FROM usuarios u LEFT JOIN ventas v ON v.usuario_id = u.id AND v.fecha_venta BETWEEN @inicio AND @fin WHERE u.jefe_id = @supervisorId GROUP BY u.id, u.nombre, u.meta_mensual ORDER BY MontoTotal DESC", param);
            res.RankingVendedores = rank.ToList();
            res.VendedorEstrella = res.RankingVendedores.FirstOrDefault()?.Vendedor ?? "Sin datos";

            var tend = await connection.QueryAsync<GraficoDatoDTO>(@"SELECT DATE_FORMAT(v.fecha_venta, '%b %Y') as Etiqueta, COALESCE(AVG(CASE WHEN v.csat > 0 THEN v.csat ELSE NULL END), 0) as Valor FROM ventas v INNER JOIN usuarios u ON v.usuario_id = u.id WHERE u.jefe_id = @supervisorId AND v.etapa = 'Ganado' AND v.fecha_venta BETWEEN DATE_SUB(@fin, INTERVAL 5 MONTH) AND @fin GROUP BY YEAR(v.fecha_venta), MONTH(v.fecha_venta), DATE_FORMAT(v.fecha_venta, '%b %Y') ORDER BY YEAR(v.fecha_venta), MONTH(v.fecha_venta)", param);
            res.TendenciaCsat = tend.ToList();

            var det = await connection.QueryAsync<VentaDetalleDTO>(@"SELECT v.proyecto_nombre as Proyecto, c.nombre as Cliente, v.monto, v.etapa, DATE_FORMAT(v.fecha_venta, '%d/%m/%Y') as FechaVenta, DATE_FORMAT(v.fecha_ultimo_contacto, '%d/%m/%Y') as FechaUltimoContacto, u.nombre as Vendedor, v.origen_campana as Origen, v.csat, DATEDIFF(CURRENT_DATE(), v.fecha_ultimo_contacto) as DiasInactivo FROM ventas v INNER JOIN clientes c ON v.cliente_id = c.id INNER JOIN usuarios u ON v.usuario_id = u.id WHERE u.jefe_id = @supervisorId AND v.fecha_venta BETWEEN @inicio AND @fin ORDER BY v.fecha_venta DESC", param);
            res.DetalleVentasFiltradas = det.ToList();

            return res;
        }

        public async Task<DashboardVendedorResponse> GetVendedorData(int vendedorId, DateTime inicio, DateTime fin)
        {
            using var connection = _context.CreateConnection();
            var param = new { vendedorId, inicio, fin };

            var res = await connection.QueryFirstOrDefaultAsync<DashboardVendedorResponse>(@"
                SELECT 
                    COALESCE(SUM(CASE WHEN etapa = 'Ganado' THEN monto ELSE 0 END), 0) as MisVentasGanadas,
                    COALESCE(AVG(CASE WHEN etapa = 'Ganado' AND csat > 0 THEN csat ELSE NULL END), 0) as MiCsat,
                    (SELECT meta_mensual FROM usuarios WHERE id = @vendedorId) as MetaPersonal,
                    COUNT(CASE WHEN etapa = 'Prospecto' THEN 1 END) as ProspectosNuevos
                FROM ventas WHERE usuario_id = @vendedorId AND fecha_venta BETWEEN @inicio AND @fin", param);

            if (res == null) res = new DashboardVendedorResponse();

            res.FaltaParaMeta = res.MetaPersonal > res.MisVentasGanadas ? res.MetaPersonal - res.MisVentasGanadas : 0;
            res.PorcentajeProgreso = res.MetaPersonal > 0 ? (res.MisVentasGanadas / res.MetaPersonal) * 100 : 0;

            var emb = await connection.QueryAsync<GraficoDatoDTO>(@"SELECT etapa as Etiqueta, COUNT(*) as Valor FROM ventas WHERE usuario_id = @vendedorId AND fecha_venta BETWEEN @inicio AND @fin GROUP BY etapa", param);
            res.MiEmbudoVentas = emb.ToList();

            var list = await connection.QueryAsync<VentaDetalleDTO>(@"SELECT v.proyecto_nombre as Proyecto, c.nombre as Cliente, v.monto, v.etapa, DATE_FORMAT(v.fecha_venta, '%d/%m/%Y') as FechaVenta, DATE_FORMAT(v.fecha_ultimo_contacto, '%d/%m/%Y') as FechaUltimoContacto, DATEDIFF(CURRENT_DATE(), v.fecha_ultimo_contacto) as DiasInactivo, v.origen_campana as Origen, v.csat FROM ventas v INNER JOIN clientes c ON v.cliente_id = c.id WHERE v.usuario_id = @vendedorId AND v.fecha_venta BETWEEN @inicio AND @fin ORDER BY v.fecha_ultimo_contacto ASC", param);
            res.MisNegociacionesYVentas = list.ToList();

            return res;
        }

        public async Task<List<VentaDetalleDTO>> GetExportacionVentas(int id, string rol, DateTime inicio, DateTime fin)
        {
            using var connection = _context.CreateConnection();
            var param = new { id, inicio, fin };

            string sql = @"
                SELECT 
                    v.proyecto_nombre as Proyecto, c.nombre as Cliente, v.monto as Monto,
                    DATE_FORMAT(v.fecha_venta, '%d/%m/%Y') as FechaVenta,
                    u.nombre as Vendedor, v.origen_campana as Origen, v.etapa as Etapa, v.csat as Csat
                FROM ventas v
                INNER JOIN clientes c ON v.cliente_id = c.id
                INNER JOIN usuarios u ON v.usuario_id = u.id
                WHERE v.fecha_venta BETWEEN @inicio AND @fin";

            // Filtro de seguridad por Rol
            if (rol == "Supervisor")
            {
                sql += " AND u.jefe_id = @id";
            }
            else if (rol == "Vendedor")
            {
                sql += " AND u.id = @id";
            }

            sql += " ORDER BY v.fecha_venta DESC";

            var result = await connection.QueryAsync<VentaDetalleDTO>(sql, param);
            return result.ToList();
        }
    }
}