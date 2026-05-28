using System;

namespace ApiAnalitica.Core.Models
{
    public class Ventas
    {
        public int Id { get; set; }
        public decimal Monto { get; set; }
        public string ProyectoNombre { get; set; } = string.Empty; // Mapea proyecto_nombre
        public string Etapa { get; set; } = "Ganado";
        public DateTime FechaVenta { get; set; } // Mapea fecha_venta
        public int UsuarioId { get; set; } // El vendedor que cerró la venta
        public int ClienteId { get; set; } // El cliente que compró
        public int Csat { get; set; } // Calificación 1-5
        public string OrigenCampana { get; set; } = string.Empty; // Mapea origen_campana
    }
}