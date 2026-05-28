using System.Data;
using MySql.Data.MySqlClient;
using Microsoft.Extensions.Configuration;

namespace ApiAnalitica.Infrastructure.Data
{
    public class DapperContext
    {
        private readonly string _connectionString;

        public DapperContext(IConfiguration configuration)
        {
            // Busca "DefaultConnection" en tu appsettings.json
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        // Este es el método que tu Repositorio llama
        public IDbConnection CreateConnection()
            => new MySqlConnection(_connectionString);
    }
}