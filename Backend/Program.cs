using ApiAnalitica.Infrastructure.Data;
using ApiAnalitica.Infrastructure.Repositories;
using ApiAnalitica.Core.Interfaces;
using ApiAnalitica.Core.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Registro de servicios
builder.Services.AddSingleton<DapperContext>();
builder.Services.AddScoped<IAnaliticaRepository, AnaliticaRepository>();
builder.Services.AddScoped<AnaliticaService>();

var app = builder.Build();

// Swagger siempre activo
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();
app.Run();