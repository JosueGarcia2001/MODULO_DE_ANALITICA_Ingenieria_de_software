namespace ApiAnalitica.Core.Models
{
    public class Tareas
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Prioridad { get; set; } = string.Empty; // Alta, Media, Baja
        public int VendedorId { get; set; } // A quién va dirigida la sugerencia
    }
}