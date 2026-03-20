using System.Text;
using CemacoPlatform.Application;
using CemacoPlatform.Domain.Entities;
using CemacoPlatform.Domain.Enums;
using CemacoPlatform.Infrastructure;
using CemacoPlatform.API.Middleware;
using CemacoPlatform.Infrastructure.Options;
using CemacoPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 5 * 1024 * 1024;
});

builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 5 * 1024 * 1024;
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwtSection = builder.Configuration.GetSection(JwtOptions.SectionName);
var jwtKey = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key no configurada.");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = signingKey
        };
    });

builder.Services.AddAuthorization();

var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

var uploadsPath = ResolveUploadsPath(app.Configuration, app.Environment);
Directory.CreateDirectory(Path.Combine(uploadsPath, "products"));

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
    await SeedDataAsync(db);
}

await app.RunAsync();

static string ResolveUploadsPath(IConfiguration configuration, IWebHostEnvironment environment)
{
    var configured = configuration["Storage:UploadsPath"];
    if (!string.IsNullOrWhiteSpace(configured))
        return Path.GetFullPath(configured);

    return Path.Combine(environment.ContentRootPath, "uploads");
}

static async Task SeedDataAsync(AppDbContext db)
{
    await SeedCategoriesAsync(db);
    await SeedUsersAsync(db);
}

static async Task SeedCategoriesAsync(AppDbContext db)
{
    if (await db.Categories.AnyAsync())
        return;

    var defaults = new (string Name, int Order)[]
    {
        ("Tecnología", 0),
        ("Muebles", 1),
        ("Novedades", 2),
        ("Todo en ferretería", 3),
        ("Productos con suscripción", 4)
    };

    foreach (var (name, order) in defaults)
    {
        db.Categories.Add(new Category
        {
            Id = Guid.NewGuid(),
            Name = name,
            SortOrder = order
        });
    }

    await db.SaveChangesAsync();
}

static async Task SeedUsersAsync(AppDbContext db)
{
    if (await db.Users.AnyAsync())
        return;

    db.Users.AddRange(
        new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@cemaco.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = UserRole.Admin
        },
        new User
        {
            Id = Guid.NewGuid(),
            Email = "colaborador@cemaco.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Colaborador123!"),
            Role = UserRole.Colaborador
        });

    await db.SaveChangesAsync();
}
