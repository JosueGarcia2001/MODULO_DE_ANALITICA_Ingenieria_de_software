using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;

namespace ApiAnaliticaCRM.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Esto hace que la ruta base sea "api/analitica"
    public class AnaliticaController : ControllerBase
    {
        // Cadena de conexión directa a tu XAMPP
        private readonly string connectionString = "Server=localhost;Database=crm_analitica_db;User ID=root;Password=;";

        // ==========================================
        // HU-01: Motor de Cálculo de Ventas y Embudo
        // ==========================================
        [HttpGet("dashboard/kpis")] // Ruta final: GET api/analitica/dashboard/kpis
        public IActionResult GetDashboardKpis()
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();

                    decimal totalVentas = 0;
                    var queryTotal = "SELECT SUM(monto) FROM ventas WHERE etapa = 'Ganado'";
                    using (var commandTotal = new MySqlCommand(queryTotal, connection))
                    {
                        var result = commandTotal.ExecuteScalar();
                        if (result != DBNull.Value) totalVentas = Convert.ToDecimal(result);
                    }

                    var embudo = new List<object>();
                    var queryEmbudo = "SELECT etapa, COUNT(*) as cantidad FROM ventas GROUP BY etapa";
                    using (var commandEmbudo = new MySqlCommand(queryEmbudo, connection))
                    using (var reader = commandEmbudo.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            embudo.Add(new
                            {
                                etapa = reader["etapa"].ToString(),
                                cantidad = Convert.ToInt32(reader["cantidad"])
                            });
                        }
                    }

                    return Ok(new
                    {
                        estado = 1,
                        mensaje = "KPIs calculados con éxito",
                        total_ventas_ganadas = totalVentas,
                        embudo = embudo
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error en el servidor: {ex.Message}");
            }
        }

        // =======================================================
        // HU-02: Motor de Rendimiento Comercial, Marketing y CSAT
        // =======================================================
        [HttpGet("reportes/rendimiento")] // Ruta final: GET api/analitica/reportes/rendimiento
        public IActionResult GetRendimientoVendedores()
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    var listaRendimiento = new List<object>();

                    var query = @"
                        SELECT 
                            v.nombre AS nombre_vendedor, 
                            ven.origen_campana, 
                            SUM(ven.monto) AS monto_vendido, 
                            ROUND(AVG(ven.csat), 1) AS csat_promedio 
                        FROM ventas ven 
                        JOIN vendedores v ON ven.vendedor_id = v.id 
                        WHERE ven.etapa = 'Ganado' 
                        GROUP BY v.nombre, ven.origen_campana 
                        ORDER BY monto_vendido DESC";

                    using (var command = new MySqlCommand(query, connection))
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            listaRendimiento.Add(new
                            {
                                nombre_vendedor = reader["nombre_vendedor"].ToString(),
                                origen_campana = reader["origen_campana"].ToString(),
                                monto_vendido = Convert.ToDecimal(reader["monto_vendido"]),
                                csat_promedio = reader["csat_promedio"] != DBNull.Value ? Convert.ToDecimal(reader["csat_promedio"]) : 0
                            });
                        }
                    }

                    return Ok(new
                    {
                        estado = 1,
                        mensaje = "Reporte generado con éxito",
                        datos_rendimiento = listaRendimiento
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error en el servidor: {ex.Message}");
            }
        }
    }
}