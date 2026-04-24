using ApiAnalitica.Core.Interfaces;
using ApiAnalitica.Core.Services;
using ApiAnalitica.Infrastructure.Data;
using ApiAnalitica.Infrastructure.Repositories;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// 1. CONFIGURACIÓN DE SERVICIOS (Dependency Injection)
// ============================================================

// Agregar Controladores
builder.Services.AddControllers();

// Configuración de Swagger para pruebas
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Inyección de la Capa de Datos (Infraestructura)
builder.Services.AddSingleton<DapperContext>();

// Inyección de Repositorios (Relación Interfaz -> Implementación)
// Esto corrige el error de "implicit reference conversion"
builder.Services.AddScoped<IAnaliticaRepository, AnaliticaRepository>();

// Inyección de la Capa de Negocio (Core)
builder.Services.AddScoped<AnaliticaService>();

// Configuración de CORS (Permite que el Front-end se comunique con la API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// ============================================================
// 2. CONFIGURACIÓN DEL PIPELINE DE HTTP (Middleware)
// ============================================================

// Habilitar Swagger en ambiente de desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API Analítica v1");
        c.RoutePrefix = "swagger"; // Esto hace que Swagger abra en la raíz o /swagger
    });
}

// Seguridad y Enrutamiento
app.UseHttpsRedirection();

// IMPORTANTE: UseCors debe ir antes de Authorization y MapControllers
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();