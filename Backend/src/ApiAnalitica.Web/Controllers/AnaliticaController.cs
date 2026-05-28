using Microsoft.AspNetCore.Mvc;
using ApiAnalitica.Core.Services;
using System;
using System.Threading.Tasks;

namespace ApiAnalitica.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnaliticaController : ControllerBase
    {
        private readonly AnaliticaService _service;
        public AnaliticaController(AnaliticaService service) => _service = service;

        // =====================================
        // DASHBOARDS (Fechas 100% Opcionales)
        // =====================================

        [HttpGet("gerente")]
        public async Task<IActionResult> GetGerente([FromQuery] string? inicio = null, [FromQuery] string? fin = null)
        {
            DateTime? fechaInicio = string.IsNullOrWhiteSpace(inicio) ? null : DateTime.Parse(inicio);
            DateTime? fechaFin = string.IsNullOrWhiteSpace(fin) ? null : DateTime.Parse(fin);

            return Ok(await _service.ObtenerDashboardDinamico(0, "Gerente", fechaInicio, fechaFin));
        }

        [HttpGet("supervisor/{id}")]
        public async Task<IActionResult> GetSupervisor(int id, [FromQuery] string? inicio = null, [FromQuery] string? fin = null)
        {
            DateTime? fechaInicio = string.IsNullOrWhiteSpace(inicio) ? null : DateTime.Parse(inicio);
            DateTime? fechaFin = string.IsNullOrWhiteSpace(fin) ? null : DateTime.Parse(fin);

            return Ok(await _service.ObtenerDashboardDinamico(id, "Supervisor", fechaInicio, fechaFin));
        }

        [HttpGet("vendedor/{id}")]
        public async Task<IActionResult> GetVendedor(int id, [FromQuery] string? inicio = null, [FromQuery] string? fin = null)
        {
            DateTime? fechaInicio = string.IsNullOrWhiteSpace(inicio) ? null : DateTime.Parse(inicio);
            DateTime? fechaFin = string.IsNullOrWhiteSpace(fin) ? null : DateTime.Parse(fin);

            return Ok(await _service.ObtenerDashboardDinamico(id, "Vendedor", fechaInicio, fechaFin));
        }

        // =====================================
        // EXPORTACIÓN (Fechas Obligatorias)
        // =====================================

        [HttpGet("exportar/{rol}/{id}")]
        public async Task<IActionResult> ExportarReporte(string rol, int id, [FromQuery] string? inicio = null, [FromQuery] string? fin = null)
        {
            if (string.IsNullOrWhiteSpace(inicio) || string.IsNullOrWhiteSpace(fin))
            {
                return BadRequest(new { Error = "Las fechas de 'inicio' y 'fin' son estrictamente obligatorias para descargar el reporte." });
            }

            try
            {
                DateTime fechaInicio = DateTime.Parse(inicio);
                DateTime fechaFin = DateTime.Parse(fin);

                var bytes = await _service.ExportarReporteCsv(id, rol, fechaInicio, fechaFin);
                string nombreArchivo = $"Reporte_{rol}_{DateTime.Now:yyyyMMdd_HHmm}.csv";

                return File(bytes, "text/csv", nombreArchivo);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = "Formato de fecha inválido o error interno: " + ex.Message });
            }
        }
    }
}