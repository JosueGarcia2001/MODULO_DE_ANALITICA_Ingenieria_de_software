using ApiAnalitica.Core.Interfaces;
using ApiAnalitica.Core.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace ApiAnalitica.Core.Services
{
    public class AnaliticaService
    {
        private readonly IAnaliticaRepository _repo;
        public AnaliticaService(IAnaliticaRepository repo) => _repo = repo;

        // Filtro por defecto solo para visualización de Dashboards
        private (DateTime, DateTime) ObtenerFechasPorDefecto(DateTime? inicio, DateTime? fin)
        {
            var fechaActual = DateTime.Now;
            var fechaInicio = inicio ?? new DateTime(fechaActual.Year, fechaActual.Month, 1);
            var fechaFin = fin ?? new DateTime(fechaActual.Year, fechaActual.Month, DateTime.DaysInMonth(fechaActual.Year, fechaActual.Month));

            return (fechaInicio, fechaFin);
        }

        public async Task<object> ObtenerDashboardDinamico(int id, string rol, DateTime? inicio = null, DateTime? fin = null)
        {
            var (fechaInicio, fechaFin) = ObtenerFechasPorDefecto(inicio, fin);

            if (rol == "Vendedor")
            {
                var data = await _repo.GetVendedorData(id, fechaInicio, fechaFin);
                data.TareasPrioritarias = new List<TareaSugeridaDTO>();
                foreach (var v in data.MisNegociacionesYVentas)
                {
                    if (v.Etapa != "Ganado" && v.DiasInactivo >= 3)
                        data.TareasPrioritarias.Add(new TareaSugeridaDTO { Titulo = v.Cliente, Subtitulo = $"Inactivo: {v.DiasInactivo} días", Prioridad = "Alta" });
                }
                data.MensajeInformativo = $"Mostrando datos del {fechaInicio:dd/MM/yyyy} al {fechaFin:dd/MM/yyyy}.";
                return data;
            }
            if (rol == "Supervisor")
            {
                var data = await _repo.GetSupervisorData(id, fechaInicio, fechaFin);
                data.MensajeInformativo = $"Mostrando datos del {fechaInicio:dd/MM/yyyy} al {fechaFin:dd/MM/yyyy}.";
                return data;
            }
            if (rol == "Gerente")
            {
                var data = await _repo.GetGerenteData(fechaInicio, fechaFin);
                data.MensajeInformativo = $"Mostrando datos del {fechaInicio:dd/MM/yyyy} al {fechaFin:dd/MM/yyyy}.";
                return data;
            }
            return new { Error = "Rol no reconocido." };
        }

        // Exportación estricta (no usa fechas por defecto)
        public async Task<byte[]> ExportarReporteCsv(int id, string rol, DateTime inicio, DateTime fin)
        {
            if (rol != "Gerente" && rol != "Supervisor" && rol != "Vendedor")
                throw new Exception("Rol de exportación inválido.");

            var ventas = await _repo.GetExportacionVentas(id, rol, inicio, fin);

            var sb = new StringBuilder();
            sb.AppendLine("Proyecto,Cliente,Monto,Fecha Venta,Vendedor,Origen Campana,Etapa,Nivel CSAT");

            foreach (var v in ventas)
            {
                sb.AppendLine($"{v.Proyecto?.Replace(",", " ")},{v.Cliente?.Replace(",", " ")},{v.Monto},{v.FechaVenta},{v.Vendedor?.Replace(",", " ")},{v.Origen},{v.Etapa},{v.Csat}");
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }
    }
}