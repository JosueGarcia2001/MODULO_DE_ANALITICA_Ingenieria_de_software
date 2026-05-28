using System;
using System.Collections.Generic;

namespace ApiAnalitica.Core.Models
{
    // --- DTOs de Soporte ---
    public class VentaDetalleDTO
    {
        public string Proyecto { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public string FechaVenta { get; set; } = string.Empty;
        public string FechaUltimoContacto { get; set; } = string.Empty;
        public string Vendedor { get; set; } = string.Empty;
        public string Origen { get; set; } = string.Empty;
        public string Etapa { get; set; } = string.Empty;
        public int DiasInactivo { get; set; }
        public int Csat { get; set; }
    }

    public class GraficoDatoDTO
    {
        public string Etiqueta { get; set; } = string.Empty;
        public decimal Valor { get; set; }
    }

    public class EmbudoDatoDTO
    {
        public string Etiqueta { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal Porcentaje { get; set; }
    }

    public class SupervisorDesempenoDTO
    {
        public string Supervisor { get; set; } = string.Empty;
        public decimal VentasGanadas { get; set; }
        public decimal CsatPromedio { get; set; }
        public string MejorCampana { get; set; } = string.Empty;
    }

    public class VendedorRankingDTO
    {
        public string Vendedor { get; set; } = string.Empty;
        public int CantidadVentas { get; set; }
        public decimal MontoTotal { get; set; }
        public decimal PromedioCsat { get; set; }
        public decimal MetaCumplidaPorcentaje { get; set; }
    }

    public class TareaSugeridaDTO
    {
        public string Titulo { get; set; } = string.Empty;
        public string Subtitulo { get; set; } = string.Empty;
        public string Prioridad { get; set; } = string.Empty;
    }

    // --- RESPUESTAS POR ROL ---

    public class DashboardGerenteResponse
    {
        public decimal VentasGanadasGlobales { get; set; }
        public decimal MetaGlobal { get; set; }
        public decimal CsatGlobal { get; set; }
        public int ProspectosNuevos { get; set; }
        public decimal PorcentajeCrecimiento { get; set; }
        public bool AlertaCaidaVentas { get; set; }
        public List<EmbudoDatoDTO> EmbudoVentas { get; set; } = new();
        public List<SupervisorDesempenoDTO> DesempenoPorSupervisor { get; set; } = new();
        public List<GraficoDatoDTO> VentasPorCanal { get; set; } = new();
        public string MensajeInformativo { get; set; } = string.Empty;
    }

    public class DashboardSupervisorResponse
    {
        public decimal VentasGanadasEquipo { get; set; }
        public decimal MetaEquipo { get; set; }
        public int ProspectosNuevos { get; set; }
        public string VendedorEstrella { get; set; } = string.Empty;
        public List<VendedorRankingDTO> RankingVendedores { get; set; } = new();
        public List<GraficoDatoDTO> TendenciaCsat { get; set; } = new();
        public List<VentaDetalleDTO> DetalleVentasFiltradas { get; set; } = new();
        public string MensajeInformativo { get; set; } = string.Empty;
    }

    public class DashboardVendedorResponse
    {
        public decimal MisVentasGanadas { get; set; }
        public decimal MetaPersonal { get; set; }
        public decimal MiCsat { get; set; }
        public int ProspectosNuevos { get; set; }
        public decimal FaltaParaMeta { get; set; }
        public decimal PorcentajeProgreso { get; set; }
        public List<GraficoDatoDTO> MiEmbudoVentas { get; set; } = new();
        public List<VentaDetalleDTO> MisNegociacionesYVentas { get; set; } = new();
        public List<TareaSugeridaDTO> TareasPrioritarias { get; set; } = new();
        public string MensajeInformativo { get; set; } = string.Empty;
    }
}