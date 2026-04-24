using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAnalitica.Core.Models
{
    public class Usuario
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty; // Gerente, Supervisor, Vendedor
        public int? JefeId { get; set; }
        public decimal MetaMensual { get; set; }
    }
}