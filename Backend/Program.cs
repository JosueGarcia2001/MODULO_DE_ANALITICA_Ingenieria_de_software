using ApiAnalitica.Infrastructure.Data;
using ApiAnalitica.Infrastructure.Repositories;
using ApiAnalitica.Core.Interfaces;

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

// Registro de DapperContext y repositorio
builder.Services.AddSingleton<DapperContext>();
builder.Services.AddScoped<IAnaliticaRepository, AnaliticaRepository>();

var app = builder.Build();

// Swagger siempre activo
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();
app.Run();