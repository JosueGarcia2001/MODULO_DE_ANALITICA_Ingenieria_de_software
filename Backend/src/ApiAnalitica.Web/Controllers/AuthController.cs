using Microsoft.AspNetCore.Mvc;
using ApiAnalitica.Core.Interfaces;
using ApiAnalitica.Infrastructure.Data;
using Dapper;

namespace ApiAnalitica.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DapperContext _context;

        public AuthController(DapperContext context)
        {
            _context = context;
        }

        [HttpGet("login/{id}")]
        public async Task<IActionResult> Login(int id)
        {
            using var connection = _context.CreateConnection();

            // Buscamos al usuario en la DB para saber su ROL y su NOMBRE
            string sql = "SELECT id, nombre, rol, jefe_id as JefeId FROM usuarios WHERE id = @id";
            var usuario = await connection.QueryFirstOrDefaultAsync(sql, new { id });

            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado" });

            return Ok(usuario);
        }
    }
}