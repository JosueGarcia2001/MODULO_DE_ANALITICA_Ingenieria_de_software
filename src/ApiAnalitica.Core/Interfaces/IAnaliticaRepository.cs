using ApiAnalitica.Core.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ApiAnalitica.Core.Interfaces
{
    public interface IAnaliticaRepository
    {
        Task<DashboardGerenteResponse> GetGerenteData(DateTime inicio, DateTime fin);
        Task<DashboardSupervisorResponse> GetSupervisorData(int supervisorId, DateTime inicio, DateTime fin);
        Task<DashboardVendedorResponse> GetVendedorData(int vendedorId, DateTime inicio, DateTime fin);

        // El nuevo contrato exige ID, Rol y Fechas estrictas
        Task<List<VentaDetalleDTO>> GetExportacionVentas(int id, string rol, DateTime inicio, DateTime fin);
    }
}